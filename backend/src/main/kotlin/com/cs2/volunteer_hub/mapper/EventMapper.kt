package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.service.EventCapacityService
import org.springframework.stereotype.Component

@Component
class EventMapper(
    private val eventCapacityService: EventCapacityService
) {
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
            endDateTime = event.endDateTime,
            registrationDeadline = event.registrationDeadline,
            isApproved = event.isApproved,
            creatorName = event.creator.name,
            maxParticipants = event.maxParticipants,
            waitlistEnabled = event.waitlistEnabled,
            approvedCount = eventCapacityService.getApprovedCount(event.id),
            waitlistCount = eventCapacityService.getWaitlistCount(event.id),
            availableSpots = eventCapacityService.getAvailableSpots(event.id, event.maxParticipants),
            isFull = eventCapacityService.isFull(event.id, event.maxParticipants),
            isInProgress = event.isInProgress()
        )
    }

    /**
     * Map list of Event entities to list of EventResponse DTOs
     */
    fun toEventResponseList(events: List<Event>): List<EventResponse> {
        return events.map { toEventResponse(it) }
    }
}
