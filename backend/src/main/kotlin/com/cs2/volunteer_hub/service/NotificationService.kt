package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.NotificationMessage
import com.cs2.volunteer_hub.dto.NotificationResponse
import com.cs2.volunteer_hub.mapper.NotificationMapper
import com.cs2.volunteer_hub.model.Notification
import com.cs2.volunteer_hub.repository.FcmTokenRepository
import com.cs2.volunteer_hub.repository.NotificationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.specification.NotificationSpecifications
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingException
import com.google.firebase.messaging.Message
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.data.domain.Sort
import org.springframework.retry.annotation.Backoff
import org.springframework.retry.annotation.Retryable
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

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
     * Get unread notifications using NotificationSpecifications
     */
    @Transactional(readOnly = true)
    fun getUnreadNotificationsForUser(userEmail: String): List<NotificationResponse> {
        val user = userRepository.findByEmail(userEmail)!!
        val spec = NotificationSpecifications.unreadForUser(user.id)

        return notificationRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
            .map(notificationMapper::toNotificationResponse)
    }

    /**
     * Get recent notifications from the last N days using NotificationSpecifications
     */
    @Transactional(readOnly = true)
    fun getRecentNotifications(userEmail: String, days: Int): List<NotificationResponse> {
        val user = userRepository.findByEmail(userEmail)!!
        val since = LocalDateTime.now().minusDays(days.toLong())
        val spec = NotificationSpecifications.recentForUser(user.id, since)

        return notificationRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
            .map(notificationMapper::toNotificationResponse)
    }

    /**
     * Search notifications by content text using NotificationSpecifications
     */
    @Transactional(readOnly = true)
    fun searchNotifications(userEmail: String, searchText: String): List<NotificationResponse> {
        val user = userRepository.findByEmail(userEmail)!!
        val spec = NotificationSpecifications.forUser(user.id)
            .and(NotificationSpecifications.contentContains(searchText))

        return notificationRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
            .map(notificationMapper::toNotificationResponse)
    }

    /**
     * Get notifications by date range using NotificationSpecifications
     */
    @Transactional(readOnly = true)
    fun getNotificationsByDateRange(
        userEmail: String,
        from: LocalDateTime,
        to: LocalDateTime
    ): List<NotificationResponse> {
        val user = userRepository.findByEmail(userEmail)!!
        val spec = NotificationSpecifications.forUser(user.id)
            .and(NotificationSpecifications.createdAfter(from))
            .and(NotificationSpecifications.createdBefore(to))

        return notificationRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
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
     * Enhanced with data payload support
     */
    fun sendFcmPushNotificationToUser(userId: Long, title: String, body: String, link: String? = null, data: Map<String, String> = emptyMap()) {
        val fcmTokens = fcmTokenRepository.findAllByUserId(userId)

        if (fcmTokens.isEmpty()) {
            logger.warn("No FCM tokens found for user $userId. Skipping push notification.")
            return
        }

        fcmTokens.forEach { fcmToken ->
            sendPushNotificationWithRetry(fcmToken.token, fcmToken.id, title, body, link, data)
        }
    }

    /**
     * Enhanced FCM send method with error code handling and data payload
     */
    @Retryable(
        value = [Exception::class],
        maxAttempts = 3,
        backoff = Backoff(delay = 1000, multiplier = 2.0), // 1s, 2s, 4s
        exclude = [FirebaseMessagingException::class] // Don't retry FCM-specific errors
    )
    fun sendPushNotificationWithRetry(token: String, tokenId: Long, title: String, body: String, link: String? = null, data: Map<String, String> = emptyMap()) {
        try {
            val notification = com.google.firebase.messaging.Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build()

            val messageBuilder = Message.builder()
                .setNotification(notification)
                .setToken(token)

            // Add data payload for deep linking and custom handling
            if (link != null) {
                messageBuilder.putData("link", link)
            }

            // Add custom data fields
            data.forEach { (key, value) ->
                messageBuilder.putData(key, value)
            }

            val message = messageBuilder.build()

            logger.info("Sending FCM notification to token: ${token.take(10)}...")
            val response = FirebaseMessaging.getInstance().send(message)
            logger.info("FCM message sent successfully: $response")

        } catch (e: FirebaseMessagingException) {
            logger.error("FCM error for token ${token.take(10)}...: ${e.messagingErrorCode} - ${e.message}")

            // Handle specific FCM error codes
            when (e.messagingErrorCode?.name) {
                "UNREGISTERED", "INVALID_ARGUMENT" -> {
                    logger.warn("Invalid/unregistered token detected. Removing token ID: $tokenId")
                    // Direct repository call - will be part of parent transaction if exists
                    try {
                        fcmTokenRepository.deleteById(tokenId)
                        logger.info("Successfully deleted invalid FCM token ID: $tokenId")
                    } catch (deleteEx: Exception) {
                        logger.error("Failed to delete FCM token ID: $tokenId - ${deleteEx.message}")
                    }
                    // Don't retry for invalid tokens
                }
                "SENDER_ID_MISMATCH" -> {
                    logger.warn("Sender ID mismatch for token. Removing token ID: $tokenId")
                    // Direct repository call - will be part of parent transaction if exists
                    try {
                        fcmTokenRepository.deleteById(tokenId)
                        logger.info("Successfully deleted invalid FCM token ID: $tokenId")
                    } catch (deleteEx: Exception) {
                        logger.error("Failed to delete FCM token ID: $tokenId - ${deleteEx.message}")
                    }
                }
                "QUOTA_EXCEEDED" -> {
                    logger.error("FCM quota exceeded. Will retry.")
                    throw e // Retry
                }
                "UNAVAILABLE" -> {
                    logger.error("FCM service unavailable. Will retry.")
                    throw e // Retry
                }
                else -> {
                    logger.error("Unknown FCM error. Will retry.")
                    throw e // Retry for unknown errors
                }
            }
        } catch (e: Exception) {
            logger.error("Unexpected error sending FCM to token ${token.take(10)}...: ${e.message}")
            throw e
        }
    }


    /**
     * Scheduled job to clean up stale tokens (runs daily at 2 AM)
     * Removes tokens older than 90 days that haven't been updated
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    fun cleanupStaleTokens() {
        try {
            val cutoffDate = LocalDateTime.now().minusDays(90)
            val staleTokens = fcmTokenRepository.findAll()
                .filter { it.createdAt.isBefore(cutoffDate) }

            if (staleTokens.isNotEmpty()) {
                fcmTokenRepository.deleteAll(staleTokens)
                logger.info("Cleaned up ${staleTokens.size} stale FCM tokens older than 90 days")
            } else {
                logger.info("No stale FCM tokens to cleanup")
            }
        } catch (e: Exception) {
            logger.error("Error during FCM token cleanup: ${e.message}", e)
        }
    }

    /**
     * Mark notification as read
     */
    @Transactional
    fun markNotificationAsRead(notificationId: Long, userEmail: String) {
        val user = userRepository.findByEmail(userEmail)
            ?: throw IllegalArgumentException("User not found")

        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { IllegalArgumentException("Notification not found with id: $notificationId") }

        if (notification.recipient.id != user.id) {
            throw IllegalArgumentException("You don't have permission to mark this notification as read")
        }

        notification.isRead = true
        notificationRepository.save(notification)
        logger.info("Notification $notificationId marked as read by user ${user.email}")
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    fun markAllNotificationsAsRead(userEmail: String) {
        val user = userRepository.findByEmail(userEmail)
            ?: throw IllegalArgumentException("User not found")

        val unreadNotifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.id)
            .filter { !it.isRead }

        unreadNotifications.forEach { it.isRead = true }
        notificationRepository.saveAll(unreadNotifications)
        logger.info("Marked ${unreadNotifications.size} notifications as read for user ${user.email}")
    }

    /**
     * Delete a notification
     */
    @Transactional
    fun deleteNotification(notificationId: Long, userEmail: String) {
        val user = userRepository.findByEmail(userEmail)
            ?: throw IllegalArgumentException("User not found")

        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { IllegalArgumentException("Notification not found with id: $notificationId") }

        if (notification.recipient.id != user.id) {
            throw IllegalArgumentException("You don't have permission to delete this notification")
        }

        notificationRepository.delete(notification)
        logger.info("Notification $notificationId deleted by user ${user.email}")
    }

    /**
     * Get unread notification count for a user
     */
    @Transactional(readOnly = true)
    fun getUnreadNotificationCount(userEmail: String): Long {
        val user = userRepository.findByEmail(userEmail)
            ?: throw IllegalArgumentException("User not found")

        return notificationRepository.countByRecipientIdAndIsReadFalse(user.id)
    }
}