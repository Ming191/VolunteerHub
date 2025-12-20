package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.BadRequestException
import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker
import io.github.resilience4j.timelimiter.annotation.TimeLimiter
import java.util.*
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class ImageUploadService(
        private val storage: Storage,
        @Value("\${gcs.bucket.name}") private val bucketName: String
) {
        private val logger = LoggerFactory.getLogger(ImageUploadService::class.java)
        private val executor = Executors.newCachedThreadPool()

        @CircuitBreaker(name = "gcs", fallbackMethod = "uploadImageFallback")
        @TimeLimiter(name = "gcs")
        fun uploadImageFromBytes(
                fileBytes: ByteArray,
                contentType: String?,
                originalFilename: String?
        ): CompletableFuture<String> {
                return CompletableFuture.supplyAsync(
                        {
                                val fileName =
                                        "images/${UUID.randomUUID()}-${originalFilename?.replace(" ", "_")}"

                                val blobId = BlobId.of(bucketName, fileName)
                                val blobInfo =
                                        BlobInfo.newBuilder(blobId)
                                                .setContentType(contentType)
                                                .build()

                                logger.debug("Uploading image to GCS: $fileName")
                                storage.create(blobInfo, fileBytes)
                                "https://storage.googleapis.com/$bucketName/$fileName"
                        },
                        executor
                )
        }

        fun generateSignedUrl(contentType: String, originalFilename: String): Pair<String, String> {
                val fileName = "images/${UUID.randomUUID()}-${originalFilename.replace(" ", "_")}"
                val blobInfo =
                        BlobInfo.newBuilder(BlobId.of(bucketName, fileName))
                                .setContentType(contentType)
                                .build()

                val extensionHeaders = mapOf(
                        "Content-Type" to contentType
                )

                val url =
                        storage.signUrl(
                            blobInfo,
                            15,
                            java.util.concurrent.TimeUnit.MINUTES,
                            Storage.SignUrlOption.httpMethod(
                                    com.google.cloud.storage.HttpMethod.PUT
                            ),
                            Storage.SignUrlOption.withV4Signature(),
                            Storage.SignUrlOption.withExtHeaders(extensionHeaders)
                        )

                val publicUrl = "https://storage.googleapis.com/$bucketName/$fileName"
                return Pair(url.toString(), publicUrl)
        }

        private fun uploadImageFallback(
                @Suppress("UNUSED_PARAMETER") fileBytes: ByteArray,
                @Suppress("UNUSED_PARAMETER") contentType: String?,
                @Suppress("UNUSED_PARAMETER") originalFilename: String?,
                throwable: Throwable
        ): CompletableFuture<String> {
                logger.error(
                        "GCS circuit breaker activated for upload. Reason: ${throwable.message}",
                        throwable
                )
                throw BadRequestException(
                        "Image upload service temporarily unavailable. Please try again later."
                )
        }

        @CircuitBreaker(name = "gcs", fallbackMethod = "deleteImageFallback")
        @TimeLimiter(name = "gcs")
        fun deleteImageByUrl(url: String): CompletableFuture<Boolean> {
                return CompletableFuture.supplyAsync(
                        {
                                val prefix = "https://storage.googleapis.com/$bucketName/"
                                if (!url.startsWith(prefix)) {
                                        throw BadRequestException("Invalid GCS URL format: $url")
                                }

                                val filePath = url.substringAfter(prefix)
                                val blobId = BlobId.of(bucketName, filePath)

                                logger.debug("Deleting image from GCS: $filePath")
                                val deleted = storage.delete(blobId)
                                if (!deleted) {
                                        throw BadRequestException(
                                                "Failed to delete image from GCS. File may not exist: $url"
                                        )
                                }
                                true
                        },
                        executor
                )
        }

        private fun deleteImageFallback(
                url: String,
                throwable: Throwable
        ): CompletableFuture<Boolean> {
                logger.error(
                        "GCS circuit breaker activated for delete. Reason: ${throwable.message}. URL: $url",
                        throwable
                )
                // Don't throw exception for delete fallback - log and return false
                return CompletableFuture.completedFuture(false)
        }
}
