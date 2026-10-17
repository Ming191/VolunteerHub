package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.model.Image
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.Post
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.ByteArrayInputStream
import javax.imageio.ImageIO

@Service
class FileValidationService(
    @field:Value("\${upload.max-file-size:10485760}") private val maxFileSize: Long = 10 * 1024 * 1024, // 10MB
    private val temporaryFileStorageService: TemporaryFileStorageService
) {
    private val allowedContentTypes = setOf("image/jpeg", "image/png", "image/webp", "image/jpg")

    fun validateFiles(files: List<MultipartFile>, maxFiles: Int) {
        if (files.size > maxFiles) {
            throw BadRequestException("Too many files. Maximum allowed: $maxFiles, provided: ${files.size}")
        }

        files.forEach { file ->
            if (file.size > maxFileSize) {
                throw BadRequestException(
                    "File '${file.originalFilename}' exceeds maximum size of ${maxFileSize / 1024 / 1024}MB. " +
                    "Actual size: ${file.size / 1024 / 1024}MB"
                )
            }
            if (file.contentType !in allowedContentTypes) {
                throw BadRequestException(
                    "Unsupported file type: ${file.contentType}. " +
                    "Allowed types: ${allowedContentTypes.joinToString(", ")}"
                )
            }
            if (file.isEmpty) {
                throw BadRequestException("File '${file.originalFilename}' is empty")
            }

            if (file.originalFilename.isNullOrBlank() ||
                file.originalFilename!!.length > 128 ||
                file.originalFilename!!.contains("/") ||
                file.originalFilename!!.contains("\\") ||
                file.originalFilename!!.contains("..") ||
                file.originalFilename!!.any { it.isISOControl() }) {
                throw BadRequestException("Unsafe or missing filename")
            }
            verifyImageBytes(file)

        }
    }


    private fun verifyImageBytes(file: MultipartFile) {
        validateUploadedBytes(file.bytes, file.contentType)
    }

    /** Also used after signed PUT uploads, where the browser's MIME header is untrusted. */
    fun validateUploadedBytes(bytes: ByteArray, declaredType: String?) {
        if (bytes.isEmpty() || bytes.size > maxFileSize) {
            throw BadRequestException("Image is empty or exceeds maximum upload size")
        }
        val png = bytes.size >= 24 && bytes.copyOfRange(0, 8).contentEquals(
            byteArrayOf(0x89.toByte(), 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))
        val jpeg = bytes.size >= 4 && bytes[0] == 0xff.toByte() &&
            bytes[1] == 0xd8.toByte() && bytes[2] == 0xff.toByte()
        val webp = bytes.size >= 30 && String(bytes, 0, 4, Charsets.US_ASCII) == "RIFF" &&
            String(bytes, 8, 4, Charsets.US_ASCII) == "WEBP"
        val declared = if (declaredType == "image/jpg") "image/jpeg" else declaredType
        val actual = when {
            png -> "image/png"
            jpeg -> "image/jpeg"
            webp -> "image/webp"
            else -> throw BadRequestException("Unsupported or corrupted image header")
        }
        if (actual != declared) throw BadRequestException("Image payload does not match declared Content-Type")
        val dimensions: Pair<Int, Int> = if (webp) {
            // Accept only WebP VP8X extended headers, whose dimensions can be bounded.
            // Other WebP variants require a dedicated decoder before being accepted.
            if (String(bytes, 12, 4, Charsets.US_ASCII) != "VP8X") {
                throw BadRequestException("Unsupported WebP encoding")
            }
            val width = 1 + (bytes[24].toInt() and 255) +
                ((bytes[25].toInt() and 255) shl 8) + ((bytes[26].toInt() and 255) shl 16)
            val height = 1 + (bytes[27].toInt() and 255) +
                ((bytes[28].toInt() and 255) shl 8) + ((bytes[29].toInt() and 255) shl 16)
            Pair(width, height)
        } else {
            ImageIO.createImageInputStream(ByteArrayInputStream(bytes)).use { input ->
                if (input == null) throw BadRequestException("Unreadable image")
                val readers = ImageIO.getImageReaders(input)
                if (!readers.hasNext()) throw BadRequestException("Unrecognized image data")
                val reader = readers.next()
                try {
                    reader.input = input
                    Pair(reader.getWidth(0), reader.getHeight(0))
                } catch (_: Exception) {
                    throw BadRequestException("Malformed image")
                } finally {
                    reader.dispose()
                }
            }
        }
        val (width, height) = dimensions
        if (width < 1 || height < 1 || width > 8192 || height > 8192 ||
            width.toLong() * height.toLong() > 20_000_000L) {
            throw BadRequestException("Image dimensions exceed allowed limits")
        }
    }

    fun processFilesForEvent(files: List<MultipartFile>, event: Event) {
        files.forEach { file ->
            val tempPath = temporaryFileStorageService.save(file)
            val image = Image(
                event = event,
                originalFileName = file.originalFilename ?: "unknown",
                contentType = file.contentType ?: "application/octet-stream",
                temporaryFilePath = tempPath
            )
            event.images.add(image)
        }
    }

    fun processFilesForPost(files: List<MultipartFile>, post: Post) {
        files.forEach { file ->
            val tempPath = temporaryFileStorageService.save(file)
            val image = Image(
                post = post,
                originalFileName = file.originalFilename ?: "unknown",
                contentType = file.contentType ?: "application/octet-stream",
                temporaryFilePath = tempPath
            )
            post.images.add(image)
        }
    }
}
