package com.cs2.volunteer_hub.service

import jakarta.mail.internet.MimeMessage
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import org.thymeleaf.TemplateEngine
import org.thymeleaf.context.Context

@Service
class EmailService(
    private val javaMailSender: JavaMailSender,
    private val templateEngine: TemplateEngine,
    @Value("\${spring.mail.username}") private val fromEmail: String,
    @Value("\${app.frontend-url:http://localhost:3000}") private val frontendUrl: String
) {
    private val logger = LoggerFactory.getLogger(EmailService::class.java)

    private fun sendHtmlEmail(to: String, subject: String, htmlBody: String) {
        try {
            val message: MimeMessage = javaMailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, true, "UTF-8")

            helper.setFrom(fromEmail, "VolunteerHub")
            helper.setTo(to)
            helper.setSubject(subject)
            helper.setText(htmlBody, true)

            javaMailSender.send(message)
            logger.info("Email sent successfully to $to: $subject")
        } catch (e: Exception) {
            logger.error("Failed to send email to $to: ${e.message}", e)
            throw RuntimeException("Email sending failed: ${e.message}", e)
        }
    }

    fun sendVerificationEmail(email: String, name: String, token: String) {
        val subject = "Verify Your VolunteerHub Account"
        val url = "$frontendUrl/verify-email?token=$token"

        val context = Context().apply {
            setVariable("subject", subject)
            setVariable("name", name)
            setVariable("verificationUrl", url)
        }

        val htmlBody = templateEngine.process("verify-email", context)
        sendHtmlEmail(email, subject, htmlBody)
    }

    fun sendWelcomeEmail(email: String, name: String) {
        val subject = "Welcome to VolunteerHub!"
        val dashboardUrl = "$frontendUrl/dashboard"

        val context = Context().apply {
            setVariable("subject", subject)
            setVariable("name", name)
            setVariable("dashboardUrl", dashboardUrl)
        }

        val htmlBody = templateEngine.process("welcome-email", context)
        sendHtmlEmail(email, subject, htmlBody)
    }
}
