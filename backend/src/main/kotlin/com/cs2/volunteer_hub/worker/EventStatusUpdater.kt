package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.ImageUploadFailureMessage
import com.cs2.volunteer_hub.dto.ImageUploadSuccessMessage
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.repository.EventRepository
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * Upload results update *images*, not their parent event. Failed media must never cascade
 * deletion of registrations, an active event or already-uploaded images.
 */
@Component
class EventStatusUpdater(private val events: EventRepository) {
    private val logger = LoggerFactory.getLogger(EventStatusUpdater::class.java)

    @RabbitListener(queues = [RabbitMQConfig.IMAGE_UPLOAD_SUCCEEDED_QUEUE])
    @Transactional
    fun handleUploadSuccess(message: ImageUploadSuccessMessage) {
        val event = events.findByIdWithLock(message.eventId).orElse(null) ?: return
        for ((imageId, url) in message.uploadedUrls) {
            val image = event.images.firstOrNull { it.id == imageId } ?: continue
            if (image.status == ImageStatus.PENDING_UPLOAD) {
                image.url = url
                image.status = ImageStatus.UPLOADED
                image.temporaryFilePath = null
            } else if (image.status == ImageStatus.UPLOADED && image.url != url) {
                logger.warn("Ignoring stale upload success for image $imageId on event ${event.id}")
            }
        }
        events.save(event)
    }

    @RabbitListener(queues = [RabbitMQConfig.IMAGE_UPLOAD_FAILED_QUEUE])
    @Transactional
    fun handleUploadFailure(message: ImageUploadFailureMessage) {
        val event = events.findByIdWithLock(message.eventId).orElse(null) ?: return
        // Keep partial successes even when other images in the same batch fail.
        for ((imageId, url) in message.uploadedUrls) {
            val image = event.images.firstOrNull { it.id == imageId } ?: continue
            if (image.status == ImageStatus.PENDING_UPLOAD) {
                image.url = url
                image.status = ImageStatus.UPLOADED
                image.temporaryFilePath = null
            }
        }

        val failedIds = if (message.failedImageIds.isNotEmpty()) {
            message.failedImageIds.toSet()
        } else {
            // Compatibility with old queued messages: only legacy worker-discarded media have
            // a missing temp path. Never mark a newly staged (retryable) image as failed.
            event.images.filter {
                it.status == ImageStatus.PENDING_UPLOAD && it.temporaryFilePath == null &&
                    it.id !in message.uploadedUrls.keys
            }.map { it.id }.toSet()
        }
        for (image in event.images) {
            if (image.id in failedIds && image.status == ImageStatus.PENDING_UPLOAD) {
                image.status = ImageStatus.UPLOAD_FAILED
                image.temporaryFilePath = null
            }
        }
        events.save(event)
        logger.warn(
            "Event ${event.id}: recorded ${failedIds.size} failed image IDs; event and registrations preserved. ${message.error}"
        )
    }
}
