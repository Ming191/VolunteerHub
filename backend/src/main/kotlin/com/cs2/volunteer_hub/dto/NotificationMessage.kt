package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.RegistrationStatus

data class NotificationMessage(
        val userId: Long,
        val title: String,
        val body: String,
        val link: String? = null
)

data class RegistrationStatusUpdateMessage(
        val registrationId: Long,
        val status: RegistrationStatus
)
