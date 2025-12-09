package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EmailMessage
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.NotificationMessage
import com.cs2.volunteer_hub.dto.PostCreationMessage
import com.cs2.volunteer_hub.dto.ProfilePictureUploadMessage
import com.cs2.volunteer_hub.model.PendingMessage
import com.cs2.volunteer_hub.model.PendingMessageStatus
import com.cs2.volunteer_hub.repository.PendingMessageRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import kotlin.math.pow

/**
 * Service for managing pending RabbitMQ messages that failed to send
 */
@Service
class PendingMessageService(
    private val pendingMessageRepository: PendingMessageRepository,
    private val rabbitTemplate: RabbitTemplate,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(PendingMessageService::class.java)

    /**
     * Store a message that failed to send to RabbitMQ
     */
    @Transactional
    fun storePendingMessage(
        exchange: String,
        routingKey: String,
        message: Any,
        messageType: String = message::class.simpleName ?: "Unknown"
    ): PendingMessage {
        try {
            val messagePayload = objectMapper.writeValueAsString(message)
            val pendingMessage = PendingMessage(
                exchange = exchange,
                routingKey = routingKey,
                messagePayload = messagePayload,
                messageType = messageType,
                status = PendingMessageStatus.PENDING,
                nextRetryAt = calculateNextRetryTime(0)
            )
            
            val saved = pendingMessageRepository.save(pendingMessage)
            logger.info("Stored pending message ID ${saved.id} - Type: $messageType, RoutingKey: $routingKey")
            return saved
        } catch (e: Exception) {
            logger.error("Failed to store pending message: ${e.message}", e)
            throw e
        }
    }

    /**
     * Process pending messages and attempt to resend them
     * Runs every 2 minutes
     */
    @Scheduled(fixedDelay = 120000, initialDelay = 60000) // Every 2 minutes, start after 1 minute
    @Transactional
    fun processPendingMessages() {
        try {
            val pendingMessages = pendingMessageRepository.findMessagesReadyForRetry(
                PendingMessageStatus.PENDING,
                LocalDateTime.now()
            )

            if (pendingMessages.isEmpty()) {
                logger.debug("No pending messages to process")
                return
            }

            logger.info("Processing ${pendingMessages.size} pending messages")
            
            pendingMessages.forEach { message ->
                processSingleMessage(message)
            }
        } catch (e: Exception) {
            logger.error("Error processing pending messages: ${e.message}", e)
        }
    }

    /**
     * Process a single pending message
     */
    @Transactional
    fun processSingleMessage(pendingMessage: PendingMessage) {
        try {
            // Mark as processing to prevent duplicate processing
            pendingMessage.status = PendingMessageStatus.PROCESSING
            pendingMessageRepository.save(pendingMessage)

            // Deserialize the message based on type
            val messageObject = deserializeMessage(pendingMessage.messagePayload, pendingMessage.messageType)

            // Attempt to send the message
            rabbitTemplate.convertAndSend(
                pendingMessage.exchange,
                pendingMessage.routingKey,
                messageObject
            )

            // Mark as sent
            pendingMessage.status = PendingMessageStatus.SENT
            pendingMessage.processedAt = LocalDateTime.now()
            pendingMessageRepository.save(pendingMessage)
            
            logger.info("Successfully sent pending message ID ${pendingMessage.id} after ${pendingMessage.retryCount} retries")

        } catch (e: Exception) {
            handleMessageFailure(pendingMessage, e)
        }
    }

    /**
     * Handle message sending failure
     */
    @Transactional
    fun handleMessageFailure(pendingMessage: PendingMessage, error: Exception) {
        pendingMessage.retryCount++
        pendingMessage.errorMessage = "${error.javaClass.simpleName}: ${error.message}"

        if (pendingMessage.retryCount >= pendingMessage.maxRetries) {
            // Max retries reached - mark as failed
            pendingMessage.status = PendingMessageStatus.FAILED
            pendingMessage.processedAt = LocalDateTime.now()
            logger.error("Pending message ID ${pendingMessage.id} failed after ${pendingMessage.retryCount} retries. Marking as FAILED.")
        } else {
            // Schedule next retry with exponential backoff
            pendingMessage.status = PendingMessageStatus.PENDING
            pendingMessage.nextRetryAt = calculateNextRetryTime(pendingMessage.retryCount)
            logger.warn("Pending message ID ${pendingMessage.id} failed (attempt ${pendingMessage.retryCount}/${pendingMessage.maxRetries}). Next retry at ${pendingMessage.nextRetryAt}")
        }

        pendingMessageRepository.save(pendingMessage)
    }

    /**
     * Calculate next retry time with exponential backoff
     * Retry intervals: 2min, 4min, 8min, 16min, 32min
     */
    private fun calculateNextRetryTime(retryCount: Int): LocalDateTime {
        val delayMinutes = 2.0.pow(retryCount.toDouble() + 1).toLong()
        return LocalDateTime.now().plusMinutes(delayMinutes)
    }

    /**
     * Deserialize message based on type
     */
    private fun deserializeMessage(payload: String, messageType: String): Any {
        return when (messageType) {
            "NotificationMessage" -> objectMapper.readValue(payload, NotificationMessage::class.java)
            "EventCreationMessage" -> objectMapper.readValue(payload, EventCreationMessage::class.java)
            "PostCreationMessage" -> objectMapper.readValue(payload, PostCreationMessage::class.java)
            "ProfilePictureUploadMessage" -> objectMapper.readValue(payload, ProfilePictureUploadMessage::class.java)
            "EmailMessage" -> objectMapper.readValue(payload, EmailMessage::class.java)
            else -> {
                logger.warn("Unknown message type: $messageType. Returning raw string.")
                payload
            }
        }
    }

    /**
     * Cleanup old completed messages
     * Runs daily at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    fun cleanupOldMessages() {
        try {
            val cutoffDate = LocalDateTime.now().minusDays(7) // Keep for 7 days
            val oldMessages = pendingMessageRepository.findOldCompletedMessages(cutoffDate)

            if (oldMessages.isNotEmpty()) {
                pendingMessageRepository.deleteAll(oldMessages)
                logger.info("Cleaned up ${oldMessages.size} old pending messages")
            } else {
                logger.info("No old pending messages to cleanup")
            }
        } catch (e: Exception) {
            logger.error("Error during pending message cleanup: ${e.message}", e)
        }
    }

    /**
     * Get statistics about pending messages
     * Used for admin dashboard monitoring
     */
    @Transactional(readOnly = true)
    fun getPendingMessageStats(): Map<String, Long> {
        return mapOf(
            "pending" to pendingMessageRepository.countByStatus(PendingMessageStatus.PENDING),
            "processing" to pendingMessageRepository.countByStatus(PendingMessageStatus.PROCESSING),
            "sent" to pendingMessageRepository.countByStatus(PendingMessageStatus.SENT),
            "failed" to pendingMessageRepository.countByStatus(PendingMessageStatus.FAILED),
            "expired" to pendingMessageRepository.countByStatus(PendingMessageStatus.EXPIRED)
        )
    }

    /**
     * Manually retry a specific message (for admin intervention)
     */
    @Transactional
    fun retryMessage(messageId: Long): Boolean {
        return try {
            val message = pendingMessageRepository.findById(messageId)
                .orElseThrow { IllegalArgumentException("Message not found: $messageId") }

            if (message.status == PendingMessageStatus.SENT) {
                logger.warn("Message $messageId already sent")
                return false
            }

            message.status = PendingMessageStatus.PENDING
            message.nextRetryAt = LocalDateTime.now()
            pendingMessageRepository.save(message)
            
            processSingleMessage(message)
            true
        } catch (e: Exception) {
            logger.error("Failed to retry message $messageId: ${e.message}", e)
            false
        }
    }
}
