package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.service.RefreshTokenService
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class RefreshTokenCleanupWorker(
    private val refreshTokenService: RefreshTokenService
) {
    private val logger = LoggerFactory.getLogger(RefreshTokenCleanupWorker::class.java)

    /**
     * Clean up expired refresh tokens daily at 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    fun cleanupExpiredTokens() {
        logger.info("Starting cleanup of expired refresh tokens...")
        try {
            refreshTokenService.deleteExpiredTokens()
            logger.info("Successfully cleaned up expired refresh tokens")
        } catch (e: Exception) {
            logger.error("Error during refresh token cleanup", e)
        }
    }
}

