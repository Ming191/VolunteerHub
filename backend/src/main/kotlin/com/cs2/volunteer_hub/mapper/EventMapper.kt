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
        return EventResponse(
            id = event.id,
            title = event.title,
            imageUrls = event.images.mapNotNull { it.url },
            description = event.description,
            location = event.location,
            eventDateTime = event.eventDateTime,
            isApproved = event.isApproved,
            creatorName = event.creator.name
        )
    }

    /**
     * Map list of Event entities to list of EventResponse DTOs
     */
    fun toEventResponseList(events: List<Event>): List<EventResponse> {
        return events.map { toEventResponse(it) }
    }
}

