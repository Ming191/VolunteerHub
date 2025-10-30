package com.cs2.volunteer_hub.service

import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import com.cs2.volunteer_hub.exception.BadRequestException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*

@Service
class ImageUploadService(
    private val storage: Storage,
    @Value("\${gcs.bucket.name}") private val bucketName: String
) {
    fun uploadImageFromBytes(fileBytes: ByteArray, contentType: String?, originalFilename: String?): String {
        val fileName = "images/${UUID.randomUUID()}-${originalFilename?.replace(" ", "_")}"

        val blobId = BlobId.of(bucketName, fileName)
        val blobInfo = BlobInfo.newBuilder(blobId)
            .setContentType(contentType)
            .build()

        storage.create(blobInfo, fileBytes)
        return "https://storage.googleapis.com/$bucketName/$fileName"
    }

    fun deleteImageByUrl(url: String) {
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
