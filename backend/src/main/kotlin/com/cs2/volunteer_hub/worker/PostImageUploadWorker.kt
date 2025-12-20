package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.PostCreationMessage
import com.cs2.volunteer_hub.dto.PostImageUploadFailureMessage
import com.cs2.volunteer_hub.dto.PostImageUploadSuccessMessage
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.service.ImageUploadService
import com.cs2.volunteer_hub.service.TemporaryFileStorageService
import java.util.concurrent.ConcurrentHashMap
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.dao.OptimisticLockingFailureException
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class PostImageUploadWorker(
        private val imageUploadService: ImageUploadService,
        private val tempFileService: TemporaryFileStorageService,
        private val postRepository: PostRepository,
        private val rabbitTemplate: RabbitTemplate
) {
    private val logger = LoggerFactory.getLogger(PostImageUploadWorker::class.java)

    // Idempotency tracking - in production, use Redis or database
    private val processedMessages = ConcurrentHashMap.newKeySet<String>()

    @RabbitListener(queues = [RabbitMQConfig.POST_CREATION_PENDING_QUEUE])
    @Transactional
    fun handlePostCreation(message: PostCreationMessage) {
        val messageId = "post-${message.postId}-retry-${message.retryCount}"

        // Idempotency check
        if (!processedMessages.add(messageId)) {
            logger.warn("Duplicate message detected for Post ID: ${message.postId}, skipping")
            return
        }

        try {
            processPostCreation(message)
        } catch (e: OptimisticLockingFailureException) {
            logger.warn("Optimistic locking failure for Post ID: ${message.postId}, will retry")
            processedMessages.remove(messageId) // Allow retry
            throw e // Requeue message
        } catch (e: Exception) {
            logger.error("Unexpected error processing Post ID: ${message.postId}", e)
            handleRetryOrFailure(message, emptyMap(), e.message ?: "Unknown error")
            throw e // Send to DLQ after max retries
        }
    }

    private fun processPostCreation(message: PostCreationMessage) {
        val postId = message.postId

        logger.info(
                "Processing image upload for Post ID: $postId (attempt ${message.retryCount + 1})"
        )

        val post = postRepository.findById(postId).orElse(null)
        if (post == null) {
            logger.warn("Post ID: $postId not found. May have been deleted. Skipping.")
            return
        }

        // Check if already processed
        val imagesToUpload =
                post.images.filter {
                    it.status == ImageStatus.PENDING_UPLOAD && it.temporaryFilePath != null
                }

        if (imagesToUpload.isEmpty()) {
            logger.info("No pending images for Post ID: $postId. May have been processed already.")
            return
        }

        val uploadedUrls = mutableMapOf<Long, String>()
        val failedImages = mutableListOf<Long>()

        // Upload images with individual error handling
        imagesToUpload.forEach { image ->
            try {
                val fileBytes = tempFileService.read(image.temporaryFilePath!!)

                val url =
                        imageUploadService
                                .uploadImageFromBytes(
                                        fileBytes,
                                        image.contentType,
                                        image.originalFileName
                                )
                                .get() // Wait for CompletableFuture

                uploadedUrls[image.id] = url
                logger.info("Successfully uploaded image ID: ${image.id} for Post ID: $postId")
            } catch (e: Exception) {
                logger.error(
                        "Failed to upload image ID: ${image.id} for Post ID: $postId. Error: ${e.message}",
                        e
                )
                failedImages.add(image.id)
            } finally {
                // Always clean up temporary file
                try {
                    image.temporaryFilePath?.let {
                        tempFileService.delete(it)
                        image.temporaryFilePath = null
                    }
                } catch (e: Exception) {
                    logger.error("Failed to delete temp file for image ID: ${image.id}", e)
                }
            }
        }

        // Save to clear temp paths
        postRepository.save(post)

        // Determine outcome
        when {
            failedImages.isEmpty() -> {
                // All succeeded
                val successMessage =
                        PostImageUploadSuccessMessage(postId = postId, uploadedUrls = uploadedUrls)
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE_NAME,
                        RabbitMQConfig.POST_IMAGE_UPLOAD_SUCCEEDED_ROUTING_KEY,
                        successMessage
                )
                logger.info("All images uploaded successfully for Post ID: $postId")
            }
            uploadedUrls.isEmpty() -> {
                // All failed - retry or compensate
                handleRetryOrFailure(message, uploadedUrls, "All image uploads failed")
            }
            else -> {
                // Partial success - still considered failure
                logger.warn(
                        "Partial upload failure for Post ID: $postId. ${uploadedUrls.size} succeeded, ${failedImages.size} failed"
                )
                handleRetryOrFailure(
                        message,
                        uploadedUrls,
                        "Partial upload failure: ${failedImages.size} images failed"
                )
            }
        }
    }

    private fun handleRetryOrFailure(
            message: PostCreationMessage,
            uploadedUrls: Map<Long, String>,
            error: String
    ) {
        if (message.retryCount < RabbitMQConfig.MAX_RETRY_COUNT) {
            // Retry
            val retryMessage = message.copy(retryCount = message.retryCount + 1)
            logger.warn(
                    "Retrying upload for Post ID: ${message.postId} (attempt ${retryMessage.retryCount + 1}/${RabbitMQConfig.MAX_RETRY_COUNT})"
            )

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.POST_CREATION_PENDING_ROUTING_KEY,
                    retryMessage
            )
        } else {
            // Max retries exceeded - compensate
            logger.error(
                    "Max retries exceeded for Post ID: ${message.postId}. Triggering compensation."
            )

            val failureMessage =
                    PostImageUploadFailureMessage(
                            postId = message.postId,
                            uploadedUrls = uploadedUrls,
                            error = error,
                            retryCount = message.retryCount
                    )
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.POST_IMAGE_UPLOAD_FAILED_ROUTING_KEY,
                    failureMessage
            )
        }
    }
}
