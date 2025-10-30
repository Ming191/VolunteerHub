package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.model.Image
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.Post
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

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
