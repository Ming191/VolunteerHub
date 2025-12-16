package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.ActiveSessionResponse
import com.cs2.volunteer_hub.dto.UserSettingsResponse
import com.cs2.volunteer_hub.model.RefreshToken
import com.cs2.volunteer_hub.model.UserSettings
import org.springframework.stereotype.Component

@Component
class SettingsMapper {

    /** Map UserSettings entity to UserSettingsResponse DTO */
    fun toUserSettingsResponse(settings: UserSettings): UserSettingsResponse {
        return UserSettingsResponse(
            emailNotificationsEnabled = settings.emailNotificationsEnabled,
            pushNotificationsEnabled = settings.pushNotificationsEnabled,
            eventReminderNotifications = settings.eventReminderNotifications,
            eventUpdateNotifications = settings.eventUpdateNotifications,
            commentNotifications = settings.commentNotifications,
            theme = settings.theme,
            profileVisibility = settings.profileVisibility
        )
    }

    /** Map RefreshToken entity to ActiveSessionResponse DTO */
    fun toActiveSessionResponse(token: RefreshToken, currentToken: String?): ActiveSessionResponse {
        return ActiveSessionResponse(
            id = token.id,
            ipAddress = token.ipAddress,
            userAgent = token.userAgent,
            createdAt = token.createdAt,
            expiresAt = token.expiresAt,
            isCurrent = token.token == currentToken
        )
    }
}
