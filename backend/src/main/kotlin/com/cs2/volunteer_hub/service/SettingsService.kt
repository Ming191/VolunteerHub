package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.ActiveSessionResponse
import com.cs2.volunteer_hub.dto.DeleteAccountRequest
import com.cs2.volunteer_hub.dto.UpdateUserSettingsRequest
import com.cs2.volunteer_hub.dto.UserSettingsResponse
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.mapper.SettingsMapper
import com.cs2.volunteer_hub.repository.RefreshTokenRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.UserSettingsRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import java.time.LocalDateTime
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SettingsService(
        private val userRepository: UserRepository,
        private val userSettingsRepository: UserSettingsRepository,
        private val refreshTokenRepository: RefreshTokenRepository,
        private val passwordEncoder: PasswordEncoder,
        private val settingsMapper: SettingsMapper
) {
    private val logger = LoggerFactory.getLogger(SettingsService::class.java)

    /** Get user settings - settings must already exist (created at registration) */
    @Transactional(readOnly = true)
    fun getUserSettings(userEmail: String): UserSettingsResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val settings =
                userSettingsRepository.findByUserId(user.id)
                        ?: throw ResourceNotFoundException("UserSettings", "userId", user.id)
        return settingsMapper.toUserSettingsResponse(settings)
    }

    /** Update user settings - operates on managed entity within transaction */
    @Transactional
    fun updateUserSettings(
            userEmail: String,
            request: UpdateUserSettingsRequest
    ): UserSettingsResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val settings =
                userSettingsRepository.findByUserId(user.id)
                        ?: throw ResourceNotFoundException("UserSettings", "userId", user.id)

        // Update only non-null fields on the managed entity
        request.emailNotificationsEnabled?.let { settings.emailNotificationsEnabled = it }
        request.pushNotificationsEnabled?.let { settings.pushNotificationsEnabled = it }
        request.eventReminderNotifications?.let { settings.eventReminderNotifications = it }
        request.eventUpdateNotifications?.let { settings.eventUpdateNotifications = it }
        request.commentNotifications?.let { settings.commentNotifications = it }
        request.theme?.let { settings.theme = it }
        request.profileVisibility?.let { settings.profileVisibility = it }

        // No explicit save needed - JPA dirty checking handles it within transaction
        logger.info("Updated settings for user: ${user.id}")
        return settingsMapper.toUserSettingsResponse(settings)
    }

    /** Get all active sessions for a user */
    @Transactional(readOnly = true)
    fun getActiveSessions(userEmail: String, currentToken: String?): List<ActiveSessionResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val sessions =
                refreshTokenRepository.findAllByUserAndRevokedAtIsNullOrderByCreatedAtDesc(user)
        return sessions.map { token -> settingsMapper.toActiveSessionResponse(token, currentToken) }
    }

    /** Revoke a specific session */
    @Transactional
    fun revokeSession(userEmail: String, sessionId: Long) {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val token =
                refreshTokenRepository.findById(sessionId).orElse(null)
                        ?: throw ResourceNotFoundException("Session", "id", sessionId)

        if (token.user.id != user.id) {
            throw BadRequestException("Session does not belong to current user")
        }

        if (token.revokedAt != null) {
            throw BadRequestException("Session already revoked")
        }

        token.revokedAt = LocalDateTime.now()
        // No explicit save needed - dirty checking handles it
        logger.info("Revoked session $sessionId for user: ${user.id}")
    }

    /** Revoke all sessions except current */
    @Transactional
    fun revokeAllOtherSessions(userEmail: String, currentToken: String) {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val sessions =
                refreshTokenRepository.findAllByUserAndRevokedAtIsNullOrderByCreatedAtDesc(user)
        var revokedCount = 0

        sessions.forEach { token ->
            if (token.token != currentToken) {
                token.revokedAt = LocalDateTime.now()
                revokedCount++
            }
        }
        logger.info("Revoked $revokedCount other sessions for user: ${user.id}")
    }

    /** Soft delete user account */
    @Transactional
    fun deleteAccount(userEmail: String, request: DeleteAccountRequest) {
        val user = userRepository.findByEmailOrThrow(userEmail)

        // Verify password
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw BadRequestException("Invalid password")
        }

        // Verify confirmation text
        if (request.confirmationText != "DELETE") {
            throw BadRequestException("Confirmation text must be 'DELETE'")
        }

        // Soft delete
        user.isDeleted = true
        user.deletedAt = LocalDateTime.now()
        // No explicit save needed - dirty checking handles it

        // Revoke all sessions
        refreshTokenRepository.revokeAllUserTokens(user)

        logger.info("Soft deleted account for user: ${user.id}")
    }
}
