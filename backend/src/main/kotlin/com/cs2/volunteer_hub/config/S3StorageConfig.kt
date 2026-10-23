package com.cs2.volunteer_hub.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import software.amazon.awssdk.services.s3.model.HeadBucketRequest
import software.amazon.awssdk.services.s3.model.CreateBucketRequest
import software.amazon.awssdk.services.s3.model.S3Exception
import software.amazon.awssdk.services.s3.model.CORSRule
import software.amazon.awssdk.services.s3.model.CORSConfiguration
import software.amazon.awssdk.services.s3.model.PutBucketCorsRequest
import software.amazon.awssdk.core.exception.SdkClientException
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import java.net.URI

/**
 * Local object storage uses RustFS. Keep all S3 endpoint/credentials in configuration:
 * switching to a future S3-compatible provider does not change domain services.
 */
@Configuration
@ConditionalOnProperty(prefix = "storage", name = ["provider"], havingValue = "s3", matchIfMissing = true)
class S3StorageConfig(
    @Value("\${storage.endpoint:http://localhost:9000}") private val internalEndpoint: String,
    @Value("\${storage.presign-endpoint:http://localhost:9000}") private val browserEndpoint: String,
    @Value("\${storage.access-key:localdevaccess}") private val accessKey: String,
    @Value("\${storage.secret-key:localdevsecret123}") private val secretKey: String
) {
    private fun credentials() =
        StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))

    private fun s3Options() = S3Configuration.builder().pathStyleAccessEnabled(true).build()

    @Bean
    fun s3Client(): S3Client = S3Client.builder()
        .endpointOverride(URI.create(internalEndpoint))
        .credentialsProvider(credentials())
        .region(Region.US_EAST_1)
        .serviceConfiguration(s3Options())
        .build()

    // RustFS is addressed by "rustfs" inside Compose and by localhost in the browser.
    // SigV4 signs the Host header, so the presigner MUST use the browser-accessible URL.
    @Bean
    @ConditionalOnProperty(prefix = "storage", name = ["bootstrap-bucket"], havingValue = "true", matchIfMissing = true)
    fun localBucketProvisioner(
        client: S3Client,
        @Value("\${storage.bucket:volunteerhub}") bucket: String
    ): ApplicationRunner = ApplicationRunner {
        // RustFS may need a few seconds on the first local run.
        var lastError: Exception? = null
        for (attempt in 1..20) {
            try {
                try {
                    client.headBucket(HeadBucketRequest.builder().bucket(bucket).build())
                } catch (e: S3Exception) {
                    if (e.statusCode() != 404) throw e
                    client.createBucket(CreateBucketRequest.builder().bucket(bucket).build())
                }
                // Configure browser uploads for the local frontend; the S3 bucket remains private.
                val corsRule = CORSRule.builder()
                    .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000")
                    .allowedMethods("PUT", "GET", "HEAD")
                    .allowedHeaders("content-type", "if-none-match", "*")
                    .maxAgeSeconds(600)
                    .build()
                client.putBucketCors(PutBucketCorsRequest.builder().bucket(bucket)
                    .corsConfiguration(CORSConfiguration.builder().corsRules(corsRule).build())
                    .build())
                return@ApplicationRunner
            } catch (e: SdkClientException) {
                lastError = e
                Thread.sleep(1000)
            }
        }
        throw IllegalStateException("Local S3 store is unreachable", lastError)
    }

    @Bean
    fun s3Presigner(): S3Presigner = S3Presigner.builder()
        .endpointOverride(URI.create(browserEndpoint))
        .credentialsProvider(credentials())
        .region(Region.US_EAST_1)
        .serviceConfiguration(s3Options())
        .build()
}
