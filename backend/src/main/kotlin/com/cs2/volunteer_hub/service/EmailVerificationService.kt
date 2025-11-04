package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.model.EmailVerificationToken
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.EmailVerificationTokenRepository
import com.cs2.volunteer_hub.repository.UserRepository
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class EmailVerificationService(
    private val emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private val userRepository: UserRepository,
    private val emailQueueService: EmailQueueService
) {
    private val logger = LoggerFactory.getLogger(EmailVerificationService::class.java)
    private val TOKEN_EXPIRATION_HOURS = 24L

    @Transactional
    fun createVerificationToken(user: User): String {
        emailVerificationTokenRepository.deleteByUser(user)

        val token = UUID.randomUUID().toString()
        val expiresAt = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS)

        val verificationToken = EmailVerificationToken(
            token = token,
            user = user,
            expiresAt = expiresAt
        )

        emailVerificationTokenRepository.save(verificationToken)
        logger.info("Created verification token for user: ${user.email}, expires at: $expiresAt")

        return token
    }

    fun sendVerificationEmail(user: User, token: String) {
        try {
            emailQueueService.queueVerificationEmail(user.email, user.name, token)
            logger.info("Verification email queued for: ${user.email}")
        } catch (e: Exception) {
            logger.error("Failed to queue verification email for: ${user.email}", e)
        }
    }

    @Transactional
    fun verifyEmail(token: String): Boolean {
        val verificationToken = emailVerificationTokenRepository.findByToken(token)
            ?: throw IllegalArgumentException("Invalid verification token")

        if (verificationToken.expiresAt.isBefore(LocalDateTime.now())) {
            logger.warn("Verification token expired for user: ${verificationToken.user.email}")
            throw IllegalArgumentException("Verification token has expired")
        }

        if (verificationToken.verifiedAt != null) {
            logger.info("Token already used for user: ${verificationToken.user.email}")
            return true
        }

        val user = verificationToken.user
        user.isEmailVerified = true
        userRepository.save(user)

        verificationToken.verifiedAt = LocalDateTime.now()
        emailVerificationTokenRepository.save(verificationToken)

        logger.info("Email verified successfully for user: ${user.email}")
        return true
    }

    fun getUserByToken(token: String): User? {
        return emailVerificationTokenRepository.findByToken(token)?.user
    }

    @Transactional
    fun resendVerificationEmail(email: String) {
        val user = userRepository.findByEmail(email)
            ?: throw IllegalArgumentException("User not found")

        if (user.isEmailVerified) {
            throw IllegalArgumentException("Email is already verified")
        }

        val token = createVerificationToken(user)
        sendVerificationEmail(user, token)
    }

    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    @Transactional
    fun cleanupExpiredTokens() {
        val now = LocalDateTime.now()
        val deletedCount = emailVerificationTokenRepository.deleteExpiredTokens(now)
        logger.info("Cleaned up $deletedCount expired verification tokens")
    }
}
