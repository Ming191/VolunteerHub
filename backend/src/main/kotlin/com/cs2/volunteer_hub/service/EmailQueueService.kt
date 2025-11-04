package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.EmailMessage
import com.cs2.volunteer_hub.dto.VerificationEmailMessage
import com.cs2.volunteer_hub.dto.WelcomeEmailMessage
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

