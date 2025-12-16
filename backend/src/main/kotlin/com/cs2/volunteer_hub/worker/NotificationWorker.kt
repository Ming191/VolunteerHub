package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.NotificationMessage
import com.cs2.volunteer_hub.dto.RegistrationStatusUpdateMessage
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserSettingsRepository
import com.cs2.volunteer_hub.service.NotificationService
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class NotificationWorker(
        private val registrationRepository: RegistrationRepository,
        private val notificationService: NotificationService,
        private val userSettingsRepository: UserSettingsRepository
) {
    private val logger = LoggerFactory.getLogger(NotificationWorker::class.java)

    /** Process notification messages from RabbitMQ and send FCM push notifications */
    @RabbitListener(queues = [RabbitMQConfig.NOTIFICATION_QUEUE])
    @Transactional
    fun handleNotification(message: NotificationMessage) {
        try {
            logger.info("Processing notification for user ${message.userId}: ${message.title}")

            // Save notification to database
            notificationService.saveNotification(
                    userId = message.userId,
                    content = message.body,
                    link = message.link
            )

            // Check if user has enabled push notifications
            val userSettings = userSettingsRepository.findByUserId(message.userId)
            if (userSettings?.pushNotificationsEnabled == true) {
                // Send FCM push notification to user's devices with data payload
                notificationService.sendFcmPushNotificationToUser(
                        userId = message.userId,
                        title = message.title,
                        body = message.body,
                        link = message.link,
                        data =
                                mapOf(
                                        "type" to "general_notification",
                                        "timestamp" to System.currentTimeMillis().toString()
                                )
                )
            } else {
                logger.info(
                        "Skipping push notification for user ${message.userId} (disabled in settings)"
                )
            }

            logger.info("Successfully processed notification for user ${message.userId}")
        } catch (e: Exception) {
            logger.error(
                    "Failed to process notification for user ${message.userId}: ${e.message}",
                    e
            )
            throw e // Requeue to DLQ after retries
        }
    }

    /** Process registration status updates and send notifications */
    @RabbitListener(queues = [RabbitMQConfig.REGISTRATION_STATUS_UPDATED_QUEUE])
    @Transactional
    fun handleRegistrationStatusUpdate(message: RegistrationStatusUpdateMessage) {
        try {
            logger.info(
                    "Processing registration status update for registration ${message.registrationId}"
            )

            val registration = registrationRepository.findById(message.registrationId).orElse(null)
            if (registration == null) {
                logger.warn("Registration not found: ${message.registrationId}. Skipping.")
                return
            }

            val userToNotify = registration.user
            val eventTitle = registration.event.title
            val eventId = registration.event.id

            val title = "Registration Status Update"
            val body =
                    when (registration.status) {
                        RegistrationStatus.APPROVED ->
                                "Congratulations! Your registration for event '$eventTitle' has been approved."
                        RegistrationStatus.REJECTED ->
                                "Unfortunately, your registration for event '$eventTitle' has been rejected."
                        RegistrationStatus.COMPLETED ->
                                "Thank you for completing the event '$eventTitle'!"
                        else -> null
                    }

            if (body != null) {
                val link = "/events/${registration.event.id}"

                // Save notification to database
                notificationService.saveNotification(
                        userId = userToNotify.id,
                        content = body,
                        link = link
                )

                // Check settings
                val userSettings = userSettingsRepository.findByUserId(userToNotify.id)
                if (userSettings?.pushNotificationsEnabled == true) {
                    // Send FCM push notification with enhanced data payload
                    notificationService.sendFcmPushNotificationToUser(
                            userId = userToNotify.id,
                            title = title,
                            body = body,
                            link = link,
                            data =
                                    mapOf(
                                            "type" to "registration_status_update",
                                            "eventId" to eventId.toString(),
                                            "registrationId" to registration.id.toString(),
                                            "status" to registration.status.name,
                                            "timestamp" to System.currentTimeMillis().toString()
                                    )
                    )
                } else {
                    logger.info(
                            "Skipping push notification for registration update to user ${userToNotify.id} (disabled)"
                    )
                }

                logger.info(
                        "Successfully processed registration status update for user ${userToNotify.id}"
                )
            }
        } catch (e: Exception) {
            logger.error(
                    "Failed to process registration status update for registration ${message.registrationId}: ${e.message}",
                    e
            )
            throw e // Requeue to DLQ after retries
        }
    }
}
