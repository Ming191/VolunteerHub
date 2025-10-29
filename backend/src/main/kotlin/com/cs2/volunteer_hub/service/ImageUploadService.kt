package com.cs2.volunteer_hub.service

import com.google.cloud.storage.Acl
import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import com.cs2.volunteer_hub.exception.BadRequestException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.*

@Service
class ImageUploadService(
    private val storage: Storage,
    @Value("\${gcs.bucket.name}") private val bucketName: String
) {
    fun uploadImage(file: MultipartFile): String {
        if (file.contentType !in listOf("image/jpeg", "image/png", "image/webp")) {
            throw BadRequestException("Unsupported file type: ${file.contentType}")
        }
        return uploadImageFromBytes(file.bytes, file.contentType, file.originalFilename)
    }

    fun uploadImages(files: List<MultipartFile>): List<String> {
        return files.map { uploadImage(it) }
    }

    fun uploadImageFromBytes(fileBytes: ByteArray, contentType: String?, originalFilename: String?): String {
        val fileName = "images/${UUID.randomUUID()}-${originalFilename?.replace(" ", "_")}"

        val blobId = BlobId.of(bucketName, fileName)
        val blobInfo = BlobInfo.newBuilder(blobId)
            .setContentType(contentType)
            .build()

        val blob = storage.create(blobInfo, fileBytes)

        blob.createAcl(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER))

        return "https://storage.googleapis.com/$bucketName/$fileName"
    }

    fun deleteImageByUrl(url: String) {
        // Extract the file path from the GCS URL
        // URL format: https://storage.googleapis.com/{bucketName}/{filePath}
        val prefix = "https://storage.googleapis.com/$bucketName/"
        if (!url.startsWith(prefix)) {
            throw BadRequestException("Invalid GCS URL format: $url")
        }

        val filePath = url.substringAfter(prefix)
        val blobId = BlobId.of(bucketName, filePath)

        val deleted = storage.delete(blobId)
        if (!deleted) {
            throw BadRequestException("Failed to delete image from GCS. File may not exist: $url")
        }
    }
}