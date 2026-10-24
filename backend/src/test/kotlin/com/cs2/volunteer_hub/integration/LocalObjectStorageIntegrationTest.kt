package com.cs2.volunteer_hub.integration

import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.service.FileValidationService
import com.cs2.volunteer_hub.service.ImageUploadService
import com.cs2.volunteer_hub.service.TemporaryFileStorageService
import com.cs2.volunteer_hub.storage.S3ObjectStorageAdapter
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.Network
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.utility.MountableFile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.model.CreateBucketRequest
import software.amazon.awssdk.services.s3.model.CORSRule
import software.amazon.awssdk.services.s3.model.CORSConfiguration
import software.amazon.awssdk.services.s3.model.PutBucketCorsRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.net.HttpURLConnection
import java.net.URI
import java.net.URL
import java.net.Socket
import java.nio.file.Path
import javax.imageio.ImageIO

/** No GCS credentials: real RustFS Docker image, S3 SigV4 signed PUT and private reads. */
@Testcontainers
class LocalObjectStorageIntegrationTest {
    companion object {
        private val network = Network.newNetwork()

        @Container @JvmField
        val rustfs = GenericContainer<Nothing>("rustfs/rustfs:latest").apply {
            withNetwork(network)
            withNetworkAliases("rustfs")
            withExposedPorts(9000)
            withEnv("RUSTFS_ACCESS_KEY", "localtestaccess")
            withEnv("RUSTFS_SECRET_KEY", "localtestsecret123")
            withEnv("RUSTFS_CORS_ALLOWED_ORIGINS", "http://localhost:5173")
            withCommand("/data")
            waitingFor(Wait.forListeningPort())
        }

    }

    private fun validPng(): ByteArray {
        val output = ByteArrayOutputStream()
        ImageIO.write(BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", output)
        return output.toByteArray()
    }

    private fun putSigned(url: String, image: ByteArray): Int {
        val conn = URL(url).openConnection() as HttpURLConnection
        conn.requestMethod = "PUT"
        conn.doOutput = true
        conn.connectTimeout = 5000
        conn.readTimeout = 5000
        conn.setRequestProperty("Content-Type", "image/png")
        conn.setRequestProperty("If-None-Match", "*")
        conn.outputStream.use { it.write(image) }
        return try { conn.responseCode } finally { conn.disconnect() }
    }

    @Test
    fun composeIngressEnforcesCorsSizeLimitAndSignedPutImmutability() {
        val config = Path.of("..", "docker", "storage-proxy", "default.conf").toAbsolutePath()
        val proxy = GenericContainer<Nothing>("nginx:1.27-alpine").apply {
            withNetwork(network)
            withExposedPorts(9000)
            withCopyFileToContainer(MountableFile.forHostPath(config),
                "/etc/nginx/conf.d/default.conf")
            waitingFor(Wait.forListeningPort())
        }
        proxy.start()
        try {
            val endpoint = "http://${proxy.host}:${proxy.getMappedPort(9000)}"
            fun preflight(origin: String): HttpURLConnection =
                (URL("$endpoint/volunteerhub-ingress/images/preflight.png").openConnection() as HttpURLConnection).apply {
                    requestMethod = "OPTIONS"
                    setRequestProperty("Origin", origin)
                    setRequestProperty("Access-Control-Request-Method", "PUT")
                    setRequestProperty("Access-Control-Request-Headers", "Content-Type, If-None-Match")
                }
            preflight("http://localhost:5173").useConnection { conn ->
                assertEquals(204, conn.responseCode)
                assertEquals("http://localhost:5173", conn.getHeaderField("Access-Control-Allow-Origin"))
            }
            preflight("https://attacker.example").useConnection { conn ->
                assertEquals(204, conn.responseCode)
                assertNull(conn.getHeaderField("Access-Control-Allow-Origin"))
            }

            // Content-Length exceeds 10 MiB: nginx rejects before any body reaches RustFS.
            Socket(proxy.host, proxy.getMappedPort(9000)).use { socket ->
                socket.soTimeout = 5_000
                val header = "PUT /volunteerhub-ingress/images/too-large.png HTTP/1.1\r\n" +
                    "Host: ${proxy.host}:${proxy.getMappedPort(9000)}\r\n" +
                    "Content-Length: 10485761\r\nConnection: close\r\n\r\n"
                socket.getOutputStream().write(header.toByteArray(Charsets.US_ASCII))
                val statusLine = socket.getInputStream().bufferedReader().readLine()
                assertTrue(statusLine.contains("413"), "nginx must refuse oversized PUT: $statusLine")
            }

            val credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create("localtestaccess", "localtestsecret123"))
            val directEndpoint = URI.create("http://${rustfs.host}:${rustfs.getMappedPort(9000)}")
            val options = S3Configuration.builder().pathStyleAccessEnabled(true).build()
            S3Client.builder().credentialsProvider(credentials).endpointOverride(directEndpoint)
                .region(Region.US_EAST_1).serviceConfiguration(options).build().use { s3 ->
                S3Presigner.builder().credentialsProvider(credentials).endpointOverride(URI.create(endpoint))
                    .region(Region.US_EAST_1).serviceConfiguration(options).build().use { presigner ->
                    s3.createBucket(CreateBucketRequest.builder().bucket("volunteerhub-ingress").build())
                    val validator = FileValidationService(10_485_760L,
                        Mockito.mock(TemporaryFileStorageService::class.java))
                    val service = ImageUploadService(
                        S3ObjectStorageAdapter(s3, presigner, "volunteerhub-ingress"),
                        "http://localhost:8080", validator)
                    val picture = validPng()
                    val (putUrl, publicUrl) = service.generateSignedUrl("image/png", "ingress.png")
                    assertTrue(putUrl.startsWith(endpoint))
                    assertTrue(putSigned(putUrl, picture) in 200..299)
                    service.verifyUploadedObject(publicUrl, "image/png")
                    assertTrue(putSigned(putUrl, picture) in setOf(409, 412),
                        "Signed URL replay must not overwrite an existing object")
                    assertTrue(service.deleteImageByUrl(publicUrl).get())
                }
            }
        } finally {
            proxy.stop()
        }
    }

    private inline fun <T> HttpURLConnection.useConnection(block: (HttpURLConnection) -> T): T =
        try { block(this) } finally { disconnect() }

    @Test
    fun signedPutIsScopedToNewObjectAndImageRoundTripsThroughPrivateS3() {
        val credentials = StaticCredentialsProvider.create(
            AwsBasicCredentials.create("localtestaccess", "localtestsecret123")
        )
        val options = S3Configuration.builder().pathStyleAccessEnabled(true).build()
        val endpoint = URI.create("http://${rustfs.host}:${rustfs.getMappedPort(9000)}")
        S3Client.builder().credentialsProvider(credentials).endpointOverride(endpoint)
            .region(Region.US_EAST_1).serviceConfiguration(options).build().use { s3 ->
            S3Presigner.builder().credentialsProvider(credentials).endpointOverride(endpoint)
                .region(Region.US_EAST_1).serviceConfiguration(options).build().use { presigner ->
                s3.createBucket(CreateBucketRequest.builder().bucket("volunteerhub").build())
                val cors = CORSRule.builder().allowedOrigins("http://localhost:5173")
                    .allowedMethods("PUT").allowedHeaders("*").build()
                s3.putBucketCors(PutBucketCorsRequest.builder().bucket("volunteerhub")
                    .corsConfiguration(CORSConfiguration.builder().corsRules(cors).build())
                    .build())
                val validator = FileValidationService(10_485_760L,
                    Mockito.mock(TemporaryFileStorageService::class.java))
                val adapter = S3ObjectStorageAdapter(s3, presigner, "volunteerhub")
                val service = ImageUploadService(adapter, "http://localhost:8080", validator)
                val picture = validPng()
                val (putUrl, publicUrl) = service.generateSignedUrl("image/png", "avatar.png")
                assertTrue(putUrl.startsWith(endpoint.toString()))
                assertThrows(BadRequestException::class.java) {
                    service.verifyUploadedObject(publicUrl, "image/png")
                }
                assertTrue(putSigned(putUrl, picture) in 200..299, "Initial signed PUT must succeed")
                service.verifyUploadedObject(publicUrl, "image/png")
                assertThrows(BadRequestException::class.java) {
                    service.verifyUploadedObject(publicUrl, "image/jpeg")
                }
                val fileName = publicUrl.substringAfterLast("/")
                val retrieved = requireNotNull(service.readPublicImage(fileName))
                assertArrayEquals(picture, retrieved.first)
                assertEquals("image/png", retrieved.second)
                assertTrue(putSigned(putUrl, picture) in setOf(409, 412), "Second PUT must not overwrite")
                assertThrows(BadRequestException::class.java) {
                    service.verifyUploadedObject("https://elsewhere.invalid/avatar.png", "image/png")
                }
                assertThrows(BadRequestException::class.java) {
                    service.generateSignedUrl("application/octet-stream", "payload.bin")
                }
                assertTrue(service.deleteImageByUrl(publicUrl).get())
                assertNull(service.readPublicImage(fileName))
                val directUrl = service.uploadImageFromBytes(picture, "image/png", "direct.png").get()
                val directFile = directUrl.substringAfterLast("/")
                assertArrayEquals(picture, requireNotNull(service.readPublicImage(directFile)).first)
                assertTrue(service.deleteImageByUrl(directUrl).get())
            }
        }
    }
}
