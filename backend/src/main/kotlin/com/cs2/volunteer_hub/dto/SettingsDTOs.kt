package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.ProfileVisibility
import com.cs2.volunteer_hub.model.Theme
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "User settings response")
data class UserSettingsResponse(
    @Schema(description = "Whether email notifications are enabled")
    val emailNotificationsEnabled: Boolean,
    @Schema(description = "Whether push notifications are enabled")
    val pushNotificationsEnabled: Boolean,
    @Schema(description = "Whether event reminder notifications are enabled")
    val eventReminderNotifications: Boolean,
    @Schema(description = "Whether event update notifications are enabled")
    val eventUpdateNotifications: Boolean,
    @Schema(description = "Whether comment notifications are enabled")
    val commentNotifications: Boolean,
    @Schema(description = "User's theme preference") val theme: Theme,
    @Schema(description = "User's profile visibility setting")
    val profileVisibility: ProfileVisibility
)

@Schema(description = "Request to update user settings")
data class UpdateUserSettingsRequest(
    @Schema(description = "Whether email notifications are enabled")
    val emailNotificationsEnabled: Boolean? = null,
    @Schema(description = "Whether push notifications are enabled")
    val pushNotificationsEnabled: Boolean? = null,
    @Schema(description = "Whether event reminder notifications are enabled")
    val eventReminderNotifications: Boolean? = null,
    @Schema(description = "Whether event update notifications are enabled")
    val eventUpdateNotifications: Boolean? = null,
    @Schema(description = "Whether comment notifications are enabled")
    val commentNotifications: Boolean? = null,
    @Schema(description = "User's theme preference") val theme: Theme? = null,
    @Schema(description = "User's profile visibility setting")
    val profileVisibility: ProfileVisibility? = null
)

@Schema(description = "Active session information")
data class ActiveSessionResponse(
    @Schema(description = "Session ID") val id: Long,
    @Schema(description = "IP address from which the session was created")
    val ipAddress: String?,
    @Schema(description = "User agent (browser/device info)") val userAgent: String?,
    @Schema(description = "When the session was created") val createdAt: LocalDateTime,
    @Schema(description = "When the session expires") val expiresAt: LocalDateTime,
    @Schema(description = "Whether this is the current session") val isCurrent: Boolean
)

@Schema(description = "Request to delete account")
data class DeleteAccountRequest(
    @Schema(description = "User's current password for confirmation", required = true)
    val password: String,
    @Schema(description = "Confirmation text, must be 'DELETE'", required = true)
    val confirmationText: String
)
