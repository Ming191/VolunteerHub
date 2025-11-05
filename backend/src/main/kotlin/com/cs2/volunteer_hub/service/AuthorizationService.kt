package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import org.springframework.stereotype.Service

/**
 * Centralized authorization service
 * Eliminates duplicate ownership and permission checking across services
 */
@Service
class AuthorizationService(
    private val eventRepository: EventRepository,
    private val registrationRepository: RegistrationRepository
) {
    /**
     * Verify event ownership and return the event
     * Throws UnauthorizedAccessException if user is not the creator
     */
    fun requireEventOwnership(eventId: Long, userEmail: String): Event {
        val event = eventRepository.findByIdOrThrow(eventId)
        if (event.creator.email != userEmail) {
            throw UnauthorizedAccessException("You do not have permission to manage this event.")
        }
        return event
    }

    /**
     * Verify user has permission to post in an event
     * User must be an approved member of the event
     */
    fun requireEventPostPermission(eventId: Long, userId: Long): Event {
        val event = eventRepository.findByIdOrThrow(eventId)

        if (!event.isApproved) {
            throw UnauthorizedAccessException("Cannot interact with unapproved events.")
        }

        val registration = registrationRepository.findByEventIdAndUserId(eventId, userId)
        if (!registration.isPresent || registration.get().status != RegistrationStatus.APPROVED) {
            throw UnauthorizedAccessException("You must be an approved member of the event to post.")
        }

        return event
    }

    /**
     * Check if user owns the event (returns boolean)
     */
    fun isEventOwner(eventId: Long, userEmail: String): Boolean {
        val event = eventRepository.findByIdOrThrow(eventId)
        return event.creator.email == userEmail
    }
}

