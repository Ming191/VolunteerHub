package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.EventRepository
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.stream.Collectors

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val userRepository: UserRepository
) {
    @Transactional
    fun createEvent(request: CreateEventRequest, creatorEmail: String): EventResponse {
        val creator = userRepository.findByEmail(creatorEmail)
            ?: throw UsernameNotFoundException("User not found with email: $creatorEmail")

        val newEvent = Event(
            title = request.title,
            description = request.description,
            location = request.location,
            eventDateTime = request.eventDateTime,
            creator = creator,
            isApproved = false
        )

        val savedEvent = eventRepository.save(newEvent)

        return mapToEventResponse(savedEvent)
    }

    @Transactional(readOnly = true)
    fun getAllApprovedEvents(): List<EventResponse> {
        return eventRepository.findAllByIsApprovedTrueOrderByEventDateTimeAsc()
            .stream()
            .map(this::mapToEventResponse)
            .collect(Collectors.toList())
    }

    @Transactional(readOnly = true)
    fun getEventById(id: Long): EventResponse {
        val event = eventRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Event", "id", id) }

        if (!event.isApproved) {
            throw ResourceNotFoundException("Event", "id", id)
        }
        return mapToEventResponse(event)
    }

    @Transactional
    fun updateEvent(id: Long, request: UpdateEventRequest, currentUserEmail: String): EventResponse {
        val event = eventRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Event", "id", id) }

        if (event.creator.email != currentUserEmail) {
            throw UnauthorizedAccessException("You do not have permission to edit this event.")
        }

        request.title?.let { event.title = it }
        request.description?.let { event.description = it }
        request.location?.let { event.location = it }
        request.eventDateTime?.let { event.eventDateTime = it }

        val updatedEvent = eventRepository.save(event)
        return mapToEventResponse(updatedEvent)
    }

    @Transactional
    fun deleteEvent(id: Long, currentUserEmail: String) {
        val event = eventRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Event", "id", id) }

        if (event.creator.email != currentUserEmail) {
            throw UnauthorizedAccessException("You do not have permission to delete this event.")
        }
        eventRepository.delete(event)
    }

    private fun mapToEventResponse(event: Event): EventResponse {
        return EventResponse(
            id = event.id,
            title = event.title,
            description = event.description,
            location = event.location,
            eventDateTime = event.eventDateTime,
            isApproved = event.isApproved,
            creatorName = event.creator.username
        )
    }
}