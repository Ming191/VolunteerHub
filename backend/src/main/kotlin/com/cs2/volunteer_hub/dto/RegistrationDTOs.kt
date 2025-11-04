package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.RegistrationStatus
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class RegistrationResponse(
    val id: Long,
    val eventId: Long,
    val eventTitle: String,
    val volunteerId: Long,
    val volunteerName: String,
    val status: RegistrationStatus,
    val registeredAt: LocalDateTime,
    val waitlistPosition: Int?
)

data class UpdateStatusRequest(
    @field:NotBlank
    val status: RegistrationStatus
)

/**
 * Response returned when registering for an event
 * Provides immediate feedback about registration status
 */
data class RegistrationResultResponse(
    val status: RegistrationStatus,
    val message: String,
    val waitlistPosition: Int?,
    val registrationId: Long
)

/**
 * Response for checking user's registration status for an event
 */
data class RegistrationStatusResponse(
    val registered: Boolean,
    val status: RegistrationStatus?,
    val waitlistPosition: Int?,
    val registeredAt: LocalDateTime?
)
