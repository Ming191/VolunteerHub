package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.ImageUploadFailureMessage
import com.cs2.volunteer_hub.dto.ImageUploadSuccessMessage
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.service.ImageUploadService
import com.cs2.volunteer_hub.service.TemporaryFileStorageService
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.dao.OptimisticLockingFailureException
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.concurrent.ConcurrentHashMap

@Component
class ImageUploadWorker(
    private val imageUploadService: ImageUploadService,
    private val tempFileService: TemporaryFileStorageService,
    private val eventRepository: EventRepository,
    private val rabbitTemplate: RabbitTemplate
) {
    private val logger = LoggerFactory.getLogger(ImageUploadWorker::class.java)

    // Idempotency tracking - in production, use Redis or database
    private val processedMessages = ConcurrentHashMap.newKeySet<String>()

    @RabbitListener(queues = [RabbitMQConfig.EVENT_CREATION_PENDING_QUEUE])
    @Transactional
    fun handleEventCreation(message: EventCreationMessage) {
        val messageId = "event-${message.eventId}-retry-${message.retryCount}"

        // Idempotency check
        if (!processedMessages.add(messageId)) {
            logger.warn("Duplicate message detected for Event ID: ${message.eventId}, skipping")
            return
        }

        try {
            processEventCreation(message)
        } catch (e: OptimisticLockingFailureException) {
            logger.warn("Optimistic locking failure for Event ID: ${message.eventId}, will retry")
            processedMessages.remove(messageId) // Allow retry
            throw e // Requeue message
        } catch (e: Exception) {
            logger.error("Unexpected error processing Event ID: ${message.eventId}", e)
            handleRetryOrFailure(message, emptyMap(), e.message ?: "Unknown error")
            throw e // Send to DLQ after max retries
        }
    }

    private fun processEventCreation(message: EventCreationMessage) {
        val eventId = message.eventId

        logger.info("Processing image upload for Event ID: $eventId (attempt ${message.retryCount + 1})")

        val event = eventRepository.findById(eventId).orElse(null)
        if (event == null) {
            logger.warn("Event ID: $eventId not found. May have been deleted. Skipping.")
            return
        }

        // Check if already processed
        val imagesToUpload = event.images.filter {
            it.status == ImageStatus.PENDING_UPLOAD && it.temporaryFilePath != null
        }

        if (imagesToUpload.isEmpty()) {
            logger.info("No pending images for Event ID: $eventId. May have been processed already.")
            return
        }

        val uploadedUrls = mutableMapOf<Long, String>()
        val failedImages = mutableListOf<Long>()

        // Upload images with individual error handling
        imagesToUpload.forEach { image ->
            try {
                val fileBytes = tempFileService.read(image.temporaryFilePath!!)

                val url = imageUploadService.uploadImageFromBytes(
                    fileBytes,
                    image.contentType,
                    image.originalFileName
                )

                uploadedUrls[image.id] = url
                logger.info("Successfully uploaded image ID: ${image.id} for Event ID: $eventId")

            } catch (e: Exception) {
                logger.error("Failed to upload image ID: ${image.id} for Event ID: $eventId. Error: ${e.message}", e)
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
        eventRepository.save(event)

        // Determine outcome
        when {
            failedImages.isEmpty() -> {
                // All succeeded
                val successMessage = ImageUploadSuccessMessage(
                    eventId = eventId,
                    uploadedUrls = uploadedUrls
                )
                rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.IMAGE_UPLOAD_SUCCEEDED_ROUTING_KEY,
                    successMessage
                )
                logger.info("All images uploaded successfully for Event ID: $eventId")
            }
            uploadedUrls.isEmpty() -> {
                // All failed - retry or compensate
                handleRetryOrFailure(message, uploadedUrls, "All image uploads failed")
            }
            else -> {
                // Partial success - still considered failure
                logger.warn("Partial upload failure for Event ID: $eventId. ${uploadedUrls.size} succeeded, ${failedImages.size} failed")
                handleRetryOrFailure(message, uploadedUrls, "Partial upload failure: ${failedImages.size} images failed")
            }
        }
    }

    private fun handleRetryOrFailure(
        message: EventCreationMessage,
        uploadedUrls: Map<Long, String>,
        error: String
    ) {
        if (message.retryCount < RabbitMQConfig.MAX_RETRY_COUNT) {
            // Retry
            val retryMessage = message.copy(retryCount = message.retryCount + 1)
            logger.warn("Retrying upload for Event ID: ${message.eventId} (attempt ${retryMessage.retryCount + 1}/${RabbitMQConfig.MAX_RETRY_COUNT})")

            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.EVENT_CREATION_PENDING_ROUTING_KEY,
                retryMessage
            )
        } else {
            // Max retries exceeded - compensate
            logger.error("Max retries exceeded for Event ID: ${message.eventId}. Triggering compensation.")

            val failureMessage = ImageUploadFailureMessage(
                eventId = message.eventId,
                uploadedUrls = uploadedUrls,
                error = error,
                retryCount = message.retryCount
            )
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.IMAGE_UPLOAD_FAILED_ROUTING_KEY,
                failureMessage
            )
        }
    }
}