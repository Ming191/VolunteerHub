package com.cs2.volunteer_hub.service

import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import com.cs2.volunteer_hub.exception.BadRequestException
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker
import io.github.resilience4j.timelimiter.annotation.TimeLimiter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*
import java.util.concurrent.CompletableFuture

@Service
class ImageUploadService(
    private val storage: Storage,
    @Value("\${gcs.bucket.name}") private val bucketName: String
) {
    private val logger = LoggerFactory.getLogger(ImageUploadService::class.java)

    @CircuitBreaker(name = "gcs", fallbackMethod = "uploadImageFallback")
    @TimeLimiter(name = "gcs")
    fun uploadImageFromBytes(fileBytes: ByteArray, contentType: String?, originalFilename: String?): CompletableFuture<String> {
        return CompletableFuture.supplyAsync {
            val fileName = "images/${UUID.randomUUID()}-${originalFilename?.replace(" ", "_")}"

            val blobId = BlobId.of(bucketName, fileName)
            val blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(contentType)
                .build()

            logger.debug("Uploading image to GCS: $fileName")
            storage.create(blobInfo, fileBytes)
            "https://storage.googleapis.com/$bucketName/$fileName"
        }
    }

    private fun uploadImageFallback(fileBytes: ByteArray, contentType: String?, originalFilename: String?, throwable: Throwable): CompletableFuture<String> {
        logger.error("GCS circuit breaker activated for upload. Reason: ${throwable.message}", throwable)
        throw BadRequestException("Image upload service temporarily unavailable. Please try again later.")
    }

    @CircuitBreaker(name = "gcs", fallbackMethod = "deleteImageFallback")
    @TimeLimiter(name = "gcs")
    fun deleteImageByUrl(url: String): CompletableFuture<Boolean> {
        return CompletableFuture.supplyAsync {
            val prefix = "https://storage.googleapis.com/$bucketName/"
            if (!url.startsWith(prefix)) {
                throw BadRequestException("Invalid GCS URL format: $url")
            }

            val filePath = url.substringAfter(prefix)
            val blobId = BlobId.of(bucketName, filePath)

            logger.debug("Deleting image from GCS: $filePath")
            val deleted = storage.delete(blobId)
            if (!deleted) {
                throw BadRequestException("Failed to delete image from GCS. File may not exist: $url")
            }
            true
        }
    }

    private fun deleteImageFallback(url: String, throwable: Throwable): CompletableFuture<Boolean> {
        logger.error("GCS circuit breaker activated for delete. Reason: ${throwable.message}. URL: $url", throwable)
        // Don't throw exception for delete fallback - log and return false
        return CompletableFuture.completedFuture(false)
    }
}
