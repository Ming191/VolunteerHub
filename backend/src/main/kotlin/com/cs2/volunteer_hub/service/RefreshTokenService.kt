package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.jwt.JwtProperties
import com.cs2.volunteer_hub.model.RefreshToken
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.RefreshTokenRepository
import java.time.LocalDateTime
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class RefreshTokenService(
        private val refreshTokenRepository: RefreshTokenRepository,
        private val jwtProperties: JwtProperties
) {
    private val refreshTokenExpiration get() = jwtProperties.refreshToken.expiration

    data class IssuedRefreshToken(val value: String, val user: User)

    class RefreshTokenReplayException : IllegalArgumentException("Refresh token replay detected")

    private val random = SecureRandom()

    /** Only a digest is ever persisted; the bearer secret is returned once to the cookie layer. */
    private fun hash(token: String): String = MessageDigest.getInstance("SHA-256")
        .digest(token.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it) }

    fun tokenHash(token: String): String = hash(token)

    private fun mint(): String = ByteArray(32).also(random::nextBytes).let {
        Base64.getUrlEncoder().withoutPadding().encodeToString(it)
    }

    /** Create a new refresh token for a user */
    @Transactional
    fun createRefreshToken(
            user: User,
            ipAddress: String? = null,
            userAgent: String? = null
    ): IssuedRefreshToken {
        requireActive(user)
        val token = mint()
        val expiresAt = LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000)

        val refreshToken =
                RefreshToken(
                        token = hash(token),
                        user = user,
                        expiresAt = expiresAt,
                        ipAddress = ipAddress,
                        userAgent = userAgent
                )

        refreshTokenRepository.save(refreshToken)
        return IssuedRefreshToken(token, user)
    }

    private fun requireActive(user: User) {
        if (user.isLocked || user.isDeleted) {
            throw IllegalArgumentException("Account is unavailable")
        }
    }

    /** Validate and retrieve a refresh token */
    @Transactional(readOnly = true)
    fun validateRefreshToken(token: String): RefreshToken {
        val refreshToken =
                refreshTokenRepository.findByToken(hash(token))
                        ?: throw IllegalArgumentException("Invalid refresh token")

        if (refreshToken.isRevoked) {
            throw IllegalArgumentException("Refresh token has been revoked")
        }

        if (refreshToken.isExpired) {
            throw IllegalArgumentException("Refresh token has expired")
        }

        requireActive(refreshToken.user)

        return refreshToken
    }

    /**
     * Rotate refresh token (revoke old, create new) This is a security best practice to prevent
     * token reuse
     */
    @Transactional(noRollbackFor = [RefreshTokenReplayException::class])
    fun rotateRefreshToken(
            oldToken: String,
            ipAddress: String? = null,
            userAgent: String? = null
    ): IssuedRefreshToken {
        val old = refreshTokenRepository.findByTokenForUpdate(hash(oldToken))
            ?: throw IllegalArgumentException("Invalid refresh token")
        if (old.isRevoked) {
            if (old.replacedByToken != null) {
                refreshTokenRepository.revokeFamily(old.familyId, LocalDateTime.now())
                throw RefreshTokenReplayException()
            }
            throw IllegalArgumentException("Refresh token has been revoked")
        }
        if (old.isExpired) throw IllegalArgumentException("Refresh token has expired")
        requireActive(old.user)

        val value = mint()
        old.revokedAt = LocalDateTime.now()
        old.replacedByToken = hash(value)
        refreshTokenRepository.save(old)
        refreshTokenRepository.save(
            RefreshToken(token = hash(value), user = old.user,
                expiresAt = LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000),
                ipAddress = ipAddress, userAgent = userAgent, familyId = old.familyId)
        )
        return IssuedRefreshToken(value, old.user)
    }

    /** Revoke a specific refresh token */
    @Transactional
    fun revokeToken(token: String) {
        val refreshToken = refreshTokenRepository.findByToken(hash(token)) ?: return
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
