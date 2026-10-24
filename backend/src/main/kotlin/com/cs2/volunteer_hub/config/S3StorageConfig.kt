package com.cs2.volunteer_hub.config

import org.springframework.context.annotation.Bean
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.context.properties.EnableConfigurationProperties
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
@EnableConfigurationProperties(StorageProperties::class)
class S3StorageConfig(private val storage: StorageProperties) {
    private fun credentials() =
        StaticCredentialsProvider.create(AwsBasicCredentials.create(storage.accessKey, storage.secretKey))

    private fun s3Options() = S3Configuration.builder().pathStyleAccessEnabled(true).build()

    @Bean
    fun s3Client(): S3Client = S3Client.builder()
        .endpointOverride(URI.create(storage.endpoint))
        .credentialsProvider(credentials())
        .region(Region.US_EAST_1)
        .serviceConfiguration(s3Options())
        .build()

    // RustFS is addressed by "rustfs" inside Compose and by localhost in the browser.
    // SigV4 signs the Host header, so the presigner MUST use the browser-accessible URL.
    @Bean
    @ConditionalOnProperty(prefix = "storage", name = ["bootstrap-bucket"], havingValue = "true", matchIfMissing = true)
    fun localBucketProvisioner(client: S3Client): ApplicationRunner = ApplicationRunner {
        val bucket = storage.bucket
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
        .endpointOverride(URI.create(storage.presignEndpoint))
        .credentialsProvider(credentials())
        .region(Region.US_EAST_1)
        .serviceConfiguration(s3Options())
        .build()
}
