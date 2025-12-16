package com.cs2.volunteer_hub.listener

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.*
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.UserSettingsRepository
import com.cs2.volunteer_hub.service.EmailService
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class EmailQueueListener(
        private val emailService: EmailService,
        private val userRepository: UserRepository,
        private val userSettingsRepository: UserSettingsRepository
) {
    private val logger = LoggerFactory.getLogger(EmailQueueListener::class.java)

    @RabbitListener(queues = [RabbitMQConfig.EMAIL_QUEUE])
    fun handleEmailMessage(
            message: EmailMessage,
            @Header(value = "x-death", required = false) xDeath: List<Map<String, Any>>?
    ) {
        val retryCount = xDeath?.firstOrNull()?.get("count") as? Long ?: 0

        logger.info("Processing email message (attempt ${retryCount + 1}) for: ${message.to}")

        try {
            when (message) {
                is VerificationEmailMessage -> {
                    emailService.sendVerificationEmail(message.to, message.name, message.token)
                    logger.info("Verification email sent successfully to: ${message.to}")
                }
                is WelcomeEmailMessage -> {
                    emailService.sendWelcomeEmail(message.to, message.name)
                    logger.info("Welcome email sent successfully to: ${message.to}")
                }
                is EventApprovedEmailMessage -> {
                    if (shouldSendEmail(message.to)) {
                        emailService.sendEventApprovedEmail(
                                message.to,
                                message.name,
                                message.eventTitle,
                                message.eventId
                        )
                        logger.info("Event approved email sent successfully to: ${message.to}")
                    }
                }
                is EventRejectedEmailMessage -> {
                    if (shouldSendEmail(message.to)) {
                        emailService.sendEventRejectedEmail(
                                message.to,
                                message.name,
                                message.eventTitle,
                                message.reason
                        )
                        logger.info("Event rejected email sent successfully to: ${message.to}")
                    }
                }
                is EventCancelledEmailMessage -> {
                    if (shouldSendEmail(message.to)) {
                        emailService.sendEventCancelledEmail(
                                message.to,
                                message.name,
                                message.eventTitle,
                                message.cancelReason
                        )
                        logger.info("Event cancelled email sent successfully to: ${message.to}")
                    }
                }
                is RegistrationStatusEmailMessage -> {
                    if (shouldSendEmail(message.to)) {
                        emailService.sendRegistrationStatusEmail(
                                message.to,
                                message.name,
                                message.eventTitle,
                                message.status
                        )
                        logger.info("Registration status email sent successfully to: ${message.to}")
                    }
                }
            }
        } catch (e: Exception) {
            logger.error("Failed to send email to ${message.to}: ${e.message}", e)

            if (retryCount >= RabbitMQConfig.MAX_RETRY_COUNT - 1) {
                logger.error("Max retries reached for email to ${message.to}. Moving to DLQ.")
                throw e
            } else {
                logger.warn(
                        "Retrying email to ${message.to} (retry ${retryCount + 1}/${RabbitMQConfig.MAX_RETRY_COUNT})"
                )
                throw e
            }
        }
    }

    private fun shouldSendEmail(email: String): Boolean {
        val user =
                userRepository.findByEmail(email)
                        ?: return true // Default to true if user not found (safe fallback)
        val settings = userSettingsRepository.findByUserId(user.id) ?: return true

        if (!settings.emailNotificationsEnabled) {
            logger.info("Skipping email to $email (disabled in settings)")
            return false
        }
        return true
    }
}
