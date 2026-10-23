package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.storage.ObjectStoragePort
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker
import io.github.resilience4j.timelimiter.annotation.TimeLimiter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import java.util.UUID
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors

@Service
class ImageUploadService(
    private val storage: ObjectStoragePort,
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
        // Preserve Unicode names while keeping object keys in a safe ASCII subset.
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
        val type = requireNotNull(contentType)
        fileValidationService.validateUploadedBytes(fileBytes, type)
        val key = "images/${UUID.randomUUID()}-$safeName"
        storage.putIfAbsent(key, type, fileBytes)
        publicUrl(key)
    }, executor)

    /**
     * The adapter signs a create-only PUT for the browser-accessible endpoint.
     * Keys are randomized and checked again against the Redis upload grant.
     */
    fun generateSignedUrl(contentType: String, originalFilename: String): Pair<String, String> {
        val safeName = requireUpload(contentType, originalFilename)
        val key = "images/${UUID.randomUUID()}-$safeName"
        return storage.presignPutIfAbsent(key, contentType, Duration.ofMinutes(15)) to publicUrl(key)
    }

    private fun keyFromUrl(url: String): String {
        val prefix = publicBaseUrl.trimEnd('/') + "/api/media/"
        if (!url.startsWith(prefix)) throw BadRequestException("Unexpected image origin")
        val key = url.removePrefix(prefix)
        if (!objectPattern.matches(key)) throw BadRequestException("Malformed object reference")
        return key
    }

    /** Check actual stored metadata and bytes, never just the submitted URL or MIME. */
    fun verifyUploadedObject(publicUrl: String, contentType: String) {
        val key = keyFromUrl(publicUrl)
        val metadata = storage.metadata(key) ?: throw BadRequestException("Uploaded image is missing")
        if (metadata.contentLength !in 1..maxSize || metadata.contentType != contentType) {
            throw BadRequestException("Uploaded image exceeds size or MIME limits")
        }
        val bytes = storage.read(key) ?: throw BadRequestException("Uploaded image is missing")
        fileValidationService.validateUploadedBytes(bytes, metadata.contentType)
    }

    /** Only images with a randomized key can be read; the backing bucket stays private. */
    fun readPublicImage(fileName: String): Pair<ByteArray, String>? {
        val key = "images/$fileName"
        if (!objectPattern.matches(key)) return null
        val metadata = storage.metadata(key) ?: return null
        if (metadata.contentLength !in 1..maxSize || metadata.contentType !in allowedTypes) return null
        val bytes = storage.read(key) ?: return null
        return bytes to metadata.contentType
    }

    @CircuitBreaker(name = "storage", fallbackMethod = "deleteImageFallback")
    @TimeLimiter(name = "storage")
    fun deleteImageByUrl(url: String): CompletableFuture<Boolean> =
        CompletableFuture.supplyAsync({
            val key = keyFromUrl(url)
            storage.delete(key)
            true
        }, executor)

    private fun uploadImageFallback(
        fileBytes: ByteArray, contentType: String?, originalFilename: String?, cause: Throwable
    ): CompletableFuture<String> {
        logger.error("Object storage upload failure", cause)
        throw BadRequestException("Image storage temporarily unavailable")
    }

    private fun deleteImageFallback(url: String, cause: Throwable): CompletableFuture<Boolean> {
        logger.warn("Could not delete stored image", cause)
        return CompletableFuture.completedFuture(false)
    }
}
