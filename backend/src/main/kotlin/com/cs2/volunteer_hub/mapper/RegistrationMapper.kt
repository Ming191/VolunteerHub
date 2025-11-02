package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.model.Registration
import org.springframework.stereotype.Component

@Component
class RegistrationMapper {
    fun toRegistrationResponse(registration: Registration): RegistrationResponse {
        return RegistrationResponse(
            id = registration.id,
            eventId = registration.event.id,
            eventTitle = registration.event.title,
            volunteerId = registration.user.id,
            volunteerName = registration.user.name,
            status = registration.status,
            registeredAt = registration.registeredAt
        )
    }
}
