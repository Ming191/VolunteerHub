package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.EmailMessage
import com.cs2.volunteer_hub.dto.VerificationEmailMessage
import com.cs2.volunteer_hub.dto.WelcomeEmailMessage
import com.cs2.volunteer_hub.dto.EventApprovedEmailMessage
import com.cs2.volunteer_hub.dto.EventRejectedEmailMessage
import com.cs2.volunteer_hub.dto.EventCancelledEmailMessage
import com.cs2.volunteer_hub.dto.RegistrationStatusEmailMessage
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Service

@Service
class EmailQueueService(
    private val rabbitTemplate: RabbitTemplate
) {
    private val logger = LoggerFactory.getLogger(EmailQueueService::class.java)

    fun queueVerificationEmail(email: String, name: String, token: String) {
        val message = VerificationEmailMessage(
            to = email,
            name = name,
            token = token
        )
        queueEmail(message)
        logger.info("Verification email queued for: $email")
    }

    fun queueWelcomeEmail(email: String, name: String) {
        val message = WelcomeEmailMessage(
            to = email,
            name = name
        )
        queueEmail(message)
        logger.info("Welcome email queued for: $email")
    }

    fun queueEventApprovedEmail(email: String, name: String, eventTitle: String, eventId: Long) {
        val message = EventApprovedEmailMessage(
            to = email,
            name = name,
            eventTitle = eventTitle,
            eventId = eventId
        )
        queueEmail(message)
        logger.info("Event approved email queued for: $email, event: $eventTitle")
    }

    fun queueEventRejectedEmail(email: String, name: String, eventTitle: String, reason: String) {
        val message = EventRejectedEmailMessage(
            to = email,
            name = name,
            eventTitle = eventTitle,
            reason = reason
        )
        queueEmail(message)
        logger.info("Event rejected email queued for: $email, event: $eventTitle")
    }

    fun queueEventCancelledEmail(email: String, name: String, eventTitle: String, cancelReason: String) {
        val message = EventCancelledEmailMessage(
            to = email,
            name = name,
            eventTitle = eventTitle,
            cancelReason = cancelReason
        )
        queueEmail(message)
        logger.info("Event cancelled email queued for: $email, event: $eventTitle")
    }

    fun queueRegistrationStatusEmail(email: String, name: String, eventTitle: String, status: String) {
        val message = RegistrationStatusEmailMessage(
            to = email,
            name = name,
            eventTitle = eventTitle,
            status = status
        )
        queueEmail(message)
        logger.info("Registration status email queued for: $email, status: $status")
    }

    private fun queueEmail(message: EmailMessage) {
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.EMAIL_ROUTING_KEY,
                message
            )
        } catch (e: Exception) {
            logger.error("Failed to queue email message: ${e.message}", e)
            throw RuntimeException("Failed to queue email", e)
        }
    }
}
