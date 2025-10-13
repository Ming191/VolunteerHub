package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.repository.EventRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Service
class AdminService(
    private val eventRepository: EventRepository,
    private val eventService: EventService
) {
    @Transactional
    fun approveEvent(eventId: Long): EventResponse {
        val event = eventRepository.findById(eventId)
            .orElseThrow { IllegalArgumentException("Event not found with id: $eventId") }

        event.isApproved = true
        val savedEvent = eventRepository.save(event)
        return eventService.mapToEventResponse(savedEvent)
    }

    @Transactional
    fun deleteEventAsAdmin(eventId: Long) {
        if (!eventRepository.existsById(eventId)) {
            throw ResourceNotFoundException("Event", "id", eventId)
        }
        eventRepository.deleteById(eventId)
    }
}