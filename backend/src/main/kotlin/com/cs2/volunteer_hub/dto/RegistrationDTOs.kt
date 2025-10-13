package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.RegistrationStatus
import java.time.LocalDateTime

data class RegistrationResponse(
    val id: Long,
    val eventId: Long,
    val eventTitle: String,
    val volunteerId: Long,
    val volunteerName: String,
    val status: RegistrationStatus,
    val registeredAt: LocalDateTime,
)