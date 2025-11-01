package com.cs2.volunteer_hub.dto

import java.time.LocalDateTime

data class NotificationResponse(
    val id: Long,
    val content: String,
    val link: String?,
    val isRead: Boolean,
    val createdAt: LocalDateTime
)