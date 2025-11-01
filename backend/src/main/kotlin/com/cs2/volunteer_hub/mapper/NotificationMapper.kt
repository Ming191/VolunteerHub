package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.NotificationResponse
import com.cs2.volunteer_hub.model.Notification
import org.springframework.stereotype.Component

@Component
class NotificationMapper {
    fun toNotificationResponse(notification: Notification): NotificationResponse {
        return NotificationResponse(
            id = notification.id,
            content = notification.content,
            link = notification.link,
            isRead = notification.isRead,
            createdAt = notification.createdAt
        )
    }
}