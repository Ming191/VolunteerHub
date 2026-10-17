package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.BadRequestException
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker
import io.github.resilience4j.timelimiter.annotation.TimeLimiter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.HeadObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.time.Duration
import java.util.UUID
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors

@Service
class ImageUploadService(
    private val s3: S3Client,
    private val presigner: S3Presigner,
    @Value("\${storage.bucket:volunteerhub}") private val bucketName: String,
    @Value("\${storage.public-base-url:http://localhost:8080}") private val publicBaseUrl: String,
    private val fileValidationService: FileValidationService
) {
    private val logger = LoggerFactory.getLogger(ImageUploadService::class.java)
    private val executor = Executors.newCachedThreadPool()
    private val maxSize = 10L * 1024 * 1024
    private val allowedTypes = setOf("image/jpeg", "image/png", "image/webp")
    private val filenamePattern = Regex("[A-Za-z0-9][A-Za-z0-9_.-]{0,99}")
    private val objectPattern = Regex("images/[0-9a-fA-F-]{36}-[A-Za-z0-9][A-Za-z0-9_.-]{0,99}")

    private fun requireUpload(contentType: String?, originalFilename: String?): String {
        if (contentType !in allowedTypes) throw BadRequestException("Unsupported image Content-Type")
        val raw = originalFilename?.trim() ?: throw BadRequestException("Missing filename")
        if (raw.isEmpty() || raw.length > 100 || raw.contains("..") ||
            raw.any { it == '/' || it.code == 92 || it.isISOControl() }) {
            throw BadRequestException("Unsafe upload filename")
        }
        // Support spaces and Unicode names without using them directly in S3 object keys.
        val normalized = raw.map { if ((it.isLetterOrDigit() && it.code < 128) || it in "._-") it else '_' }.joinToString("")
        val safe = (if (normalized.firstOrNull()?.let { it.code < 128 && it.isLetterOrDigit() } == true) normalized else "file_$normalized").take(100)
        if (!filenamePattern.matches(safe)) throw BadRequestException("Invalid upload filename")
        return safe
    }
    private fun publicUrl(key: String): String =
        publicBaseUrl.trimEnd('/') + "/api/media/" + key

    @CircuitBreaker(name = "storage", fallbackMethod = "uploadImageFallback")
    @TimeLimiter(name = "storage")
    fun uploadImageFromBytes(
        fileBytes: ByteArray, contentType: String?, originalFilename: String?
    ): CompletableFuture<String> = CompletableFuture.supplyAsync({
        val safeName = requireUpload(contentType, originalFilename)
        fileValidationService.validateUploadedBytes(fileBytes, contentType)
        val key = "images/${UUID.randomUUID()}-$safeName"
        val put = PutObjectRequest.builder().bucket(bucketName).key(key)
            .contentType(contentType).ifNoneMatch("*").build()
        s3.putObject(put, RequestBody.fromBytes(fileBytes))
        publicUrl(key)
    }, executor)

    /**
     * The browser signs PUT against the externally reachable endpoint (localhost:9000).
     * If-None-Match must be sent by the client and is included in the SigV4 signature.
     * Object names are random, immutable, and checked again against the Redis grant.
     */
    fun generateSignedUrl(contentType: String, originalFilename: String): Pair<String, String> {
        val safeName = requireUpload(contentType, originalFilename)
        val key = "images/${UUID.randomUUID()}-$safeName"
        val request = PutObjectRequest.builder()
            .bucket(bucketName).key(key).contentType(contentType).ifNoneMatch("*").build()
        val signed = presigner.presignPutObject(
            PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(request)
                .build()
        )
        return signed.url().toString() to publicUrl(key)
    }

    private fun keyFromUrl(url: String): String {
        val prefix = publicBaseUrl.trimEnd('/') + "/api/media/"
        if (!url.startsWith(prefix)) throw BadRequestException("Unexpected image origin")
        val key = url.removePrefix(prefix)
        if (!objectPattern.matches(key)) throw BadRequestException("Malformed object reference")
        return key
    }

    /** Verify the real stored bytes, not only untrusted caller-provided URL or content type. */
    fun verifyUploadedObject(publicUrl: String, contentType: String) {
        val key = keyFromUrl(publicUrl)
        val metadata = s3.headObject(HeadObjectRequest.builder().bucket(bucketName).key(key).build())
        if (metadata.contentLength() !in 1..maxSize || metadata.contentType() != contentType) {
            throw BadRequestException("Uploaded image exceeds size or MIME limits")
        }
        val bytes = s3.getObjectAsBytes(GetObjectRequest.builder().bucket(bucketName).key(key).build()).asByteArray()
        fileValidationService.validateUploadedBytes(bytes, metadata.contentType())
    }

    /** Only images with a randomized key can be read, and the bucket remains private. */
    fun readPublicImage(fileName: String): Pair<ByteArray, String>? {
        val key = "images/$fileName"
        if (!objectPattern.matches(key)) return null
        return try {
            val head = s3.headObject(HeadObjectRequest.builder().bucket(bucketName).key(key).build())
            if (head.contentLength() !in 1..maxSize || head.contentType() !in allowedTypes) return null
            val bytes = s3.getObjectAsBytes(
                GetObjectRequest.builder().bucket(bucketName).key(key).build()
            ).asByteArray()
            bytes to head.contentType()
        } catch (e: software.amazon.awssdk.services.s3.model.NoSuchKeyException) {
            null
        } catch (e: software.amazon.awssdk.services.s3.model.S3Exception) {
            if (e.statusCode() == 404) null else throw e
        }
    }

    @CircuitBreaker(name = "storage", fallbackMethod = "deleteImageFallback")
    @TimeLimiter(name = "storage")
    fun deleteImageByUrl(url: String): CompletableFuture<Boolean> =
        CompletableFuture.supplyAsync({
            val key = keyFromUrl(url)
            s3.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build())
            true
        }, executor)

    private fun uploadImageFallback(
        fileBytes: ByteArray, contentType: String?, originalFilename: String?, cause: Throwable
    ): CompletableFuture<String> {
        logger.error("Local object storage upload failure", cause)
        throw BadRequestException("Image storage temporarily unavailable")
    }

    private fun deleteImageFallback(url: String, cause: Throwable): CompletableFuture<Boolean> {
        logger.warn("Could not delete stored image", cause)
        return CompletableFuture.completedFuture(false)
    }
}
