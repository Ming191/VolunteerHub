package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.ProfilePictureUploadFailureMessage
import com.cs2.volunteer_hub.dto.ProfilePictureUploadMessage
import com.cs2.volunteer_hub.dto.ProfilePictureUploadSuccessMessage
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.service.ImageUploadService
import com.cs2.volunteer_hub.service.NotificationService
import com.cs2.volunteer_hub.service.TemporaryFileStorageService
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.dao.OptimisticLockingFailureException
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.concurrent.ConcurrentHashMap

@Component
class ProfilePictureUploadWorker(
    private val imageUploadService: ImageUploadService,
    private val tempFileService: TemporaryFileStorageService,
    private val userRepository: UserRepository,
    private val rabbitTemplate: RabbitTemplate,
    private val notificationService: NotificationService
) {
    private val logger = LoggerFactory.getLogger(ProfilePictureUploadWorker::class.java)

    private val processedMessages = ConcurrentHashMap.newKeySet<String>()

    @RabbitListener(queues = [RabbitMQConfig.PROFILE_PICTURE_UPLOAD_QUEUE])
    @Transactional
    fun handleProfilePictureUpload(message: ProfilePictureUploadMessage) {
        val messageId = "user-${message.userId}-retry-${message.retryCount}"

        if (!processedMessages.add(messageId)) {
            logger.warn("Duplicate message detected for User ID: ${message.userId}, skipping")
            return
        }

        try {
            processProfilePictureUpload(message)
        } catch (e: OptimisticLockingFailureException) {
            logger.warn("Optimistic locking failure for User ID: ${message.userId}, will retry")
            processedMessages.remove(messageId) // Allow retry
            throw e
        } catch (e: Exception) {
            logger.error("Unexpected error processing profile picture for User ID: ${message.userId}", e)
            handleRetryOrFailure(message, e.message ?: "Unknown error")
            throw e
        }
    }

    private fun processProfilePictureUpload(message: ProfilePictureUploadMessage) {
        val userId = message.userId

        logger.info("Processing profile picture upload for User ID: $userId (attempt ${message.retryCount + 1})")

        val user = userRepository.findById(userId).orElse(null)
        if (user == null) {
            logger.warn("User ID: $userId not found. May have been deleted. Skipping.")
            return
        }

        try {
            val fileBytes = tempFileService.read(message.temporaryFilePath)

            val uploadedUrl = imageUploadService.uploadImageFromBytes(
                fileBytes,
                message.contentType,
                message.originalFileName
            ).get() // Wait for CompletableFuture
            user.profilePictureUrl?.let { oldUrl ->
                try {
                    imageUploadService.deleteImageByUrl(oldUrl).get() // Wait for CompletableFuture
                    logger.info("Deleted old profile picture for User ID: $userId")
                } catch (e: Exception) {
                    logger.warn("Failed to delete old profile picture for User ID: $userId: ${e.message}")
                }
            }

            user.profilePictureUrl = uploadedUrl
            userRepository.save(user)

            logger.info("Successfully uploaded profile picture for User ID: $userId")
            val successMessage = ProfilePictureUploadSuccessMessage(
                userId = userId,
                uploadedUrl = uploadedUrl
            )
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.PROFILE_PICTURE_UPLOAD_SUCCEEDED_ROUTING_KEY,
                successMessage
            )

        } catch (e: Exception) {
            logger.error("Failed to upload profile picture for User ID: $userId. Error: ${e.message}", e)
            throw e
        } finally {
            try {
                tempFileService.delete(message.temporaryFilePath)
                logger.info("Deleted temporary file for User ID: $userId")
            } catch (e: Exception) {
                logger.warn("Failed to delete temporary file for User ID: $userId: ${e.message}")
            }
        }
    }

    private fun handleRetryOrFailure(message: ProfilePictureUploadMessage, error: String) {
        if (message.retryCount < RabbitMQConfig.MAX_RETRY_COUNT) {
            val retryMessage = message.copy(retryCount = message.retryCount + 1)
            logger.warn("Retrying profile picture upload for User ID: ${message.userId} (retry ${retryMessage.retryCount}/${RabbitMQConfig.MAX_RETRY_COUNT})")
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.PROFILE_PICTURE_UPLOAD_ROUTING_KEY,
                retryMessage
            )
        } else {
            logger.error("Max retries exceeded for User ID: ${message.userId}. Sending failure message.")
            val failureMessage = ProfilePictureUploadFailureMessage(
                userId = message.userId,
                error = error,
                retryCount = message.retryCount
            )
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.PROFILE_PICTURE_UPLOAD_FAILED_ROUTING_KEY,
                failureMessage
            )
        }
    }

    @RabbitListener(queues = [RabbitMQConfig.PROFILE_PICTURE_UPLOAD_SUCCEEDED_QUEUE])
    fun handleUploadSuccess(message: ProfilePictureUploadSuccessMessage) {
        logger.info("Profile picture upload succeeded for User ID: ${message.userId}. URL: ${message.uploadedUrl}")
    }

    @RabbitListener(queues = [RabbitMQConfig.PROFILE_PICTURE_UPLOAD_FAILED_QUEUE])
    fun handleUploadFailure(message: ProfilePictureUploadFailureMessage) {
        logger.error("Profile picture upload failed for User ID: ${message.userId}. Error: ${message.error}")

        try {
            notificationService.saveNotification(
                userId = message.userId,
                content = "Failed to upload profile picture. Please try again later.",
                link = "/profile/settings"
            )

            notificationService.queuePushNotificationToUser(
                userId = message.userId,
                title = "Profile Picture Upload Failed",
                body = "We couldn't update your profile picture. Please try again.",
                link = "/profile/settings"
            )

            logger.info("Sent failure notification to User ID: ${message.userId}")
        } catch (e: Exception) {
            logger.error("Failed to send notification for User ID: ${message.userId}: ${e.message}", e)
        }
    }
}
