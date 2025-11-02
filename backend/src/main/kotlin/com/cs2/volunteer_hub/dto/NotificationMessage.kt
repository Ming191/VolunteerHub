package com.cs2.volunteer_hub.dto

data class NotificationMessage(
    val userId: Long,
    val title: String,
    val body: String,
    val link: String? = null
)

data class RegistrationStatusUpdateMessage(
    val registrationId: Long
)

