package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.PublicAttendeeResponse
import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.dto.RegistrationResultResponse
import com.cs2.volunteer_hub.dto.RegistrationStatusResponse
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import org.springframework.stereotype.Component

@Component
class RegistrationMapper {
    fun toPublicAttendeeResponse(registration: Registration): PublicAttendeeResponse {
        return PublicAttendeeResponse(
                volunteerId = registration.user.id,
                name = registration.user.name,
                profilePictureUrl = registration.user.profilePictureUrl,
                bio = registration.user.bio,
                joinedAt = registration.registeredAt
        )
    }

    fun toRegistrationResponse(registration: Registration): RegistrationResponse {
        return RegistrationResponse(
                id = registration.id,
                eventId = registration.event.id,
                eventTitle = registration.event.title,
                volunteerId = registration.user.id,
                volunteerName = registration.user.name,
                status = registration.status,
                registeredAt = registration.registeredAt,
                waitlistPosition = registration.waitlistPosition
        )
    }

    /** Map Registration to RegistrationResultResponse Used when user registers for an event */
    fun toRegistrationResultResponse(registration: Registration): RegistrationResultResponse {
        val message =
                when (registration.status) {
                    RegistrationStatus.WAITLISTED ->
                            "Event is full. You've been added to the waitlist."
                    RegistrationStatus.PENDING ->
                            "Registration successful. Waiting for organizer approval."
                    RegistrationStatus.APPROVED ->
                            "Registration approved! You're confirmed for this event."
                    else -> "Registration received."
                }

        return RegistrationResultResponse(
                status = registration.status,
                message = message,
                waitlistPosition = registration.waitlistPosition,
                registrationId = registration.id
        )
    }

    /**
     * Map optional Registration to RegistrationStatusResponse Used for checking if user is
     * registered for an event
     */
    fun toRegistrationStatusResponse(registration: Registration?): RegistrationStatusResponse {
        return if (registration != null) {
            RegistrationStatusResponse(
                    registered = true,
                    status = registration.status,
                    waitlistPosition = registration.waitlistPosition,
                    registeredAt = registration.registeredAt
            )
        } else {
            RegistrationStatusResponse(
                    registered = false,
                    status = null,
                    waitlistPosition = null,
                    registeredAt = null
            )
        }
    }
}
