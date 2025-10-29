package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.ImageUploadFailureMessage
import com.cs2.volunteer_hub.dto.ImageUploadSuccessMessage
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.service.ImageUploadService
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class EventStatusUpdater(
    private val eventRepository: EventRepository,
    private val imageUploadService: ImageUploadService
) {
    private val logger = LoggerFactory.getLogger(EventStatusUpdater::class.java)

    @RabbitListener(queues = [RabbitMQConfig.IMAGE_UPLOAD_SUCCEEDED_QUEUE])
    @Transactional
    fun handleUploadSuccess(message: ImageUploadSuccessMessage) {
        val eventId = message.eventId
        val uploadedUrls = message.uploadedUrls

        logger.info("Processing upload success for Event ID: $eventId with ${uploadedUrls.size} images")

        val event = eventRepository.findById(eventId).orElse(null)
        if (event == null) {
            logger.warn("Event ID: $eventId not found for status update. May have been deleted.")
            return
        }

        var updated = false
        uploadedUrls.forEach { (imageId, url) ->
            event.images.find { it.id == imageId }?.let { image ->
                image.url = url
                image.status = ImageStatus.UPLOADED
                updated = true
            }
        }

        if (updated) {
            // Check if all images are uploaded
            val allUploaded = event.images.all { it.status == ImageStatus.UPLOADED }

            if (allUploaded) {
                event.isApproved = true
                logger.info("All images uploaded successfully. Auto-approving Event ID: $eventId")
            }

            eventRepository.save(event)
            logger.info("Successfully saved image status for Event ID: $eventId (approved: ${event.isApproved})")
        }
    }

    @RabbitListener(queues = [RabbitMQConfig.IMAGE_UPLOAD_FAILED_QUEUE])
    @Transactional
    fun handleUploadFailure(message: ImageUploadFailureMessage) {
        val eventId = message.eventId
        val uploadedUrls = message.uploadedUrls
        val error = message.error

        logger.warn("Processing upload failure for Event ID: $eventId. Error: $error")

        // Clean up successfully uploaded files from GCS
        if (uploadedUrls.isNotEmpty()) {
            logger.info("Cleaning up ${uploadedUrls.size} successfully uploaded images from GCS for Event ID: $eventId")
            uploadedUrls.values.forEach { url ->
                try {
                    imageUploadService.deleteImageByUrl(url)
                    logger.info("Successfully deleted image from GCS: $url")
                } catch (e: Exception) {
                    logger.error("Failed to delete image from GCS: $url. Error: ${e.message}", e)
                    // Continue cleanup even if one fails
                }
            }
        }

        // Delete event from database
        if (eventRepository.existsById(eventId)) {
            eventRepository.deleteById(eventId)
            logger.warn("Deleted Event ID: $eventId from database due to upload failure.")
        } else {
            logger.info("Event ID: $eventId was already deleted. Skipping compensating action.")
        }
    }
}