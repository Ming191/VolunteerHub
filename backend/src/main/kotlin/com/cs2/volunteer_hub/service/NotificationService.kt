package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.NotificationMessage
import com.cs2.volunteer_hub.dto.NotificationResponse
import com.cs2.volunteer_hub.mapper.NotificationMapper
import com.cs2.volunteer_hub.model.Notification
import com.cs2.volunteer_hub.repository.FcmTokenRepository
import com.cs2.volunteer_hub.repository.NotificationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.Message
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.retry.annotation.Backoff
import org.springframework.retry.annotation.Retryable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class NotificationService(
    private val fcmTokenRepository: FcmTokenRepository,
    private val userRepository: UserRepository,
    private val notificationRepository: NotificationRepository,
    private val notificationMapper: NotificationMapper,
    private val rabbitTemplate: RabbitTemplate
) {
    private val logger = LoggerFactory.getLogger(NotificationService::class.java)

    @Transactional(readOnly = true)
    fun getNotificationsForUser(userEmail: String): List<NotificationResponse> {
        val user = userRepository.findByEmail(userEmail)!!
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.id)
            .map(notificationMapper::toNotificationResponse)
    }

    /**
     * Queue a push notification to be sent to a user via RabbitMQ
     */
    fun queuePushNotificationToUser(userId: Long, title: String, body: String, link: String? = null) {
        try {
            val notificationMessage = NotificationMessage(
                userId = userId,
                title = title,
                body = body,
                link = link
            )

            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                notificationMessage
            )

            logger.info("Queued notification for user $userId: $title")
        } catch (e: Exception) {
            logger.error("Failed to queue notification for user $userId: ${e.message}", e)
            throw e
        }
    }

    /**
     * Save notification to database
     */
    @Transactional
    fun saveNotification(userId: Long, content: String, link: String?): Notification {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found with id: $userId") }

        val notification = Notification(
            recipient = user,
            content = content,
            link = link
        )

        return notificationRepository.save(notification)
    }

    /**
     * Send FCM push notification to all user devices (called by worker)
     */
    fun sendFcmPushNotificationToUser(userId: Long, title: String, body: String) {
        val tokens = fcmTokenRepository.findAllByUserId(userId).map { it.token }

        if (tokens.isEmpty()) {
            logger.warn("No FCM tokens found for user $userId. Skipping push notification.")
            return
        }

        tokens.forEach { token ->
            sendPushNotificationWithRetry(token, title, body)
        }
    }

    @Retryable(
        value = [Exception::class],
        maxAttempts = 3,
        backoff = Backoff(delay = 1000, multiplier = 2.0) // 1s, 2s, 4s
    )
    fun sendPushNotificationWithRetry(token: String, title: String, body: String) {
        try {
            val notification = com.google.firebase.messaging.Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build()

            val message = Message.builder()
                .setNotification(notification)
                .setToken(token)
                .build()

            logger.info("Sending FCM notification to token: ${token.take(10)}...")
            val response = FirebaseMessaging.getInstance().send(message)
            logger.info("FCM message sent successfully: $response")

        } catch (e: Exception) {
            logger.error("Error sending FCM to token ${token.take(10)}...: ${e.message}")
            throw e
        }
    }
}