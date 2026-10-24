package com.cs2.volunteer_hub.storage

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.HeadObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.model.S3Exception
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.time.Duration

@Component
@ConditionalOnProperty(prefix = "storage", name = ["provider"], havingValue = "s3", matchIfMissing = true)
class S3ObjectStorageAdapter(
    private val client: S3Client,
    private val presigner: S3Presigner,
    private val storageProperties: com.cs2.volunteer_hub.config.StorageProperties
) : ObjectStoragePort {
    private val bucket get() = storageProperties.bucket
    override fun putIfAbsent(key: String, contentType: String, bytes: ByteArray) {
        client.putObject(putRequest(key, contentType), RequestBody.fromBytes(bytes))
    }

    override fun presignPutIfAbsent(key: String, contentType: String, validity: Duration): String =
        presigner.presignPutObject(
            PutObjectPresignRequest.builder()
                .signatureDuration(validity)
                .putObjectRequest(putRequest(key, contentType))
                .build()
        ).url().toString()

    override fun metadata(key: String): StoredObjectMetadata? = notFoundAsNull {
        val head = client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build())
        StoredObjectMetadata(head.contentLength(), head.contentType())
    }

    override fun read(key: String): ByteArray? = notFoundAsNull {
        client.getObjectAsBytes(
            GetObjectRequest.builder().bucket(bucket).key(key).build()
        ).asByteArray()
    }

    override fun delete(key: String) {
        client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build())
    }

    private fun putRequest(key: String, contentType: String): PutObjectRequest =
        PutObjectRequest.builder().bucket(bucket).key(key)
            .contentType(contentType).ifNoneMatch("*").build()

    private inline fun <T> notFoundAsNull(block: () -> T): T? = try {
        block()
    } catch (e: S3Exception) {
        if (e.statusCode() == 404) null else throw e
    }
}
