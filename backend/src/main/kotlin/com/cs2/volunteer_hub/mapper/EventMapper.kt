package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.model.Event
import org.springframework.stereotype.Component

@Component
class EventMapper {
    /**
     * Map Event entity to EventResponse DTO
     */
    fun toEventResponse(event: Event): EventResponse {
        val currentVolunteers = event.getApprovedRegistrationCount()
        val availableSlots = event.maxVolunteers?.let { it - currentVolunteers }

        return EventResponse(
            id = event.id,
            title = event.title,
            description = event.description,
            location = event.location,
            eventDateTime = event.eventDateTime,
            eventEndDateTime = event.eventEndDateTime,
            status = event.status,
            category = event.category,
            maxVolunteers = event.maxVolunteers,
            minVolunteers = event.minVolunteers,
            currentVolunteers = currentVolunteers,
            availableSlots = availableSlots,
            isRegistrationOpen = event.isRegistrationOpen(),
            registrationDeadline = event.registrationDeadline,
            requirements = event.requirements,
            benefits = event.benefits,
            creatorName = event.creator.name,
            creatorEmail = event.getContactEmail(),
            creatorPhone = event.getContactPhone(),
            imageUrls = event.images.mapNotNull { it.url }
        )
    }
}
