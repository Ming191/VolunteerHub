package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.ImageUploadFailureMessage
import com.cs2.volunteer_hub.dto.ImageUploadSuccessMessage
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.service.ImageUploadService
import com.cs2.volunteer_hub.service.TemporaryFileStorageService
import java.util.concurrent.TimeUnit
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager

@Component
class ImageUploadWorker(
    private val imageUploadService: ImageUploadService,
    private val tempFileService: TemporaryFileStorageService,
    private val eventRepository: EventRepository,
    private val rabbitTemplate: RabbitTemplate
) {
    private val logger = LoggerFactory.getLogger(ImageUploadWorker::class.java)

    @RabbitListener(queues = [RabbitMQConfig.EVENT_CREATION_PENDING_QUEUE])
    @Transactional
    fun handleEventCreation(message: EventCreationMessage) {
        // The event lock serializes retries and newer update messages. Persisted image status
        // (rather than an in-memory process cache) makes duplicate deliveries idempotent.
        val event = eventRepository.findByIdWithLock(message.eventId).orElse(null) ?: run {
            logger.info("Upload message for deleted event ${message.eventId}; ignoring")
            return
        }
        val targets = event.images.filter {
            it.status == ImageStatus.PENDING_UPLOAD && it.temporaryFilePath != null &&
                (message.imageIds.isEmpty() || it.id in message.imageIds)
        }
        if (targets.isEmpty()) return

        val uploaded = mutableMapOf<Long, String>()
        val failed = mutableListOf<Long>()
        val cleanup = mutableListOf<String>()
        for (image in targets) {
            val path = image.temporaryFilePath ?: continue
            try {
                val bytes = tempFileService.read(path)
                val url = imageUploadService.uploadImageFromBytes(
                    bytes, image.contentType, image.originalFileName
                ).get(30, TimeUnit.SECONDS)
                image.url = url
                image.status = ImageStatus.UPLOADED
                image.temporaryFilePath = null
                uploaded[image.id] = url
                cleanup.add(path)
            } catch (e: Exception) {
                failed.add(image.id)
                logger.warn("Image ${image.id} upload attempt ${message.retryCount + 1} failed: ${e.message}")
                // Preserve the temp file for a real retry, not another no-op attempt.
                if (message.retryCount >= RabbitMQConfig.MAX_RETRY_COUNT) {
                    image.status = ImageStatus.UPLOAD_FAILED
                    image.temporaryFilePath = null
                    cleanup.add(path)
                }
            }
        }
        eventRepository.saveAndFlush(event)

        // Publish ONLY after image state commits, so a retry cannot see the previous attempt.
        afterCommit {
            for (path in cleanup) tempFileService.delete(path)
            if (uploaded.isNotEmpty()) {
                rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.IMAGE_UPLOAD_SUCCEEDED_ROUTING_KEY,
                    ImageUploadSuccessMessage(event.id, uploaded)
                )
            }
            if (failed.isNotEmpty()) {
                if (message.retryCount < RabbitMQConfig.MAX_RETRY_COUNT) {
                    rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE_NAME,
                        RabbitMQConfig.EVENT_CREATION_PENDING_ROUTING_KEY,
                        message.copy(retryCount = message.retryCount + 1)
                    )
                } else {
                    rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE_NAME,
                        RabbitMQConfig.IMAGE_UPLOAD_FAILED_ROUTING_KEY,
                        ImageUploadFailureMessage(
                            eventId = event.id,
                            uploadedUrls = uploaded,
                            error = "Image upload failed after retries",
                            retryCount = message.retryCount,
                            failedImageIds = failed
                        )
                    )
                }
            }
        }
    }

    private fun afterCommit(block: () -> Unit) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(object : TransactionSynchronization {
                override fun afterCommit() = block()
            })
        } else {
            block()
        }
    }
}
