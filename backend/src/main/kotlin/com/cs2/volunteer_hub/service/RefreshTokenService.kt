package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.model.RefreshToken
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.RefreshTokenRepository
import java.time.LocalDateTime
import java.util.*
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class RefreshTokenService(
        private val refreshTokenRepository: RefreshTokenRepository,
        @Value("\${jwt.refresh-token.expiration:2592000000}") // Default: 30 days
        private val refreshTokenExpiration: Long
) {

    /** Create a new refresh token for a user */
    @Transactional
    fun createRefreshToken(
            user: User,
            ipAddress: String? = null,
            userAgent: String? = null
    ): RefreshToken {
        val existingTokens =
                refreshTokenRepository.findByUserAndIpAddressAndUserAgentAndRevokedAtIsNull(
                        user,
                        ipAddress,
                        userAgent
                )

        if (existingTokens.isNotEmpty()) {
            val now = LocalDateTime.now()
            existingTokens.forEach { token ->
                token.revokedAt = now
                token.replacedByToken = null
            }
            refreshTokenRepository.saveAll(existingTokens)
        }

        val token = UUID.randomUUID().toString()
        val expiresAt = LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000)

        val refreshToken =
                RefreshToken(
                        token = token,
                        user = user,
                        expiresAt = expiresAt,
                        ipAddress = ipAddress,
                        userAgent = userAgent
                )

        return refreshTokenRepository.save(refreshToken)
    }

    /** Validate and retrieve a refresh token */
    fun validateRefreshToken(token: String): RefreshToken {
        val refreshToken =
                refreshTokenRepository.findByToken(token)
                        ?: throw IllegalArgumentException("Invalid refresh token")

        if (refreshToken.isRevoked) {
            throw IllegalArgumentException("Refresh token has been revoked")
        }

        if (refreshToken.isExpired) {
            throw IllegalArgumentException("Refresh token has expired")
        }

        return refreshToken
    }

    /**
     * Rotate refresh token (revoke old, create new) This is a security best practice to prevent
     * token reuse
     */
    @Transactional
    fun rotateRefreshToken(
            oldToken: String,
            ipAddress: String? = null,
            userAgent: String? = null
    ): RefreshToken {
        val oldRefreshToken = validateRefreshToken(oldToken)

        val newRefreshToken = createRefreshToken(oldRefreshToken.user, ipAddress, userAgent)

        oldRefreshToken.revokedAt = LocalDateTime.now()
        oldRefreshToken.replacedByToken = newRefreshToken.token
        refreshTokenRepository.save(oldRefreshToken)

        return newRefreshToken
    }

    /** Revoke a specific refresh token */
    @Transactional
    fun revokeToken(token: String) {
        val refreshToken = refreshTokenRepository.findByToken(token) ?: return
        refreshToken.revokedAt = LocalDateTime.now()
        refreshTokenRepository.save(refreshToken)
    }

    /**
     * Revoke all refresh tokens for a user (e.g., on password change or logout from all devices)
     */
    @Transactional
    fun revokeAllUserTokens(user: User) {
        refreshTokenRepository.revokeAllUserTokens(user)
    }

    /** Clean up expired tokens (should be scheduled) */
    @Transactional
    fun deleteExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens()
    }
}
