package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import org.springframework.stereotype.Service

/**
 * Centralized authorization service Eliminates duplicate ownership and permission checking across
 * services
 */
@Service
class AuthorizationService(
        private val eventRepository: EventRepository,
        private val registrationRepository: RegistrationRepository,
        private val userRepository: UserRepository
) {
    /**
     * Verify event ownership and return the event Throws UnauthorizedAccessException if user is not
     * the creator
     */
    fun requireEventOwnership(eventId: Long, userEmail: String): Event {
        val event = eventRepository.findByIdOrThrow(eventId)
        if (event.creator.email != userEmail) {
            throw UnauthorizedAccessException("You do not have permission to manage this event.")
        }
        return event
    }

    /**
     * Verify user has permission to post in an event User must be an approved member of the event
     */
    fun requireEventPostPermission(eventId: Long, userId: Long): Event {
        val event = eventRepository.findByIdOrThrow(eventId)

        // Allow creator to post updates even if event is unapproved
        if (!event.isApproved && event.creator.id != userId) {
            throw UnauthorizedAccessException("Cannot interact with unapproved events.")
        }

        // If creator, bypass registration check
        if (event.creator.id == userId) {
            return event
        }

        val spec =
                RegistrationSpecifications.forEvent(eventId)
                        .and(RegistrationSpecifications.byUser(userId))
                        .and(RegistrationSpecifications.isApproved())

        if (!registrationRepository.exists(spec)) {
            throw UnauthorizedAccessException(
                    "You must be an approved member of the event to post."
            )
        }

        return event
    }

    /**
     * Verify user has permission to read posts in an event Access is allowed if the event is
     * approved, regardless of user registration.
     */
    fun requireEventReadPermission(eventId: Long, userId: Long? = null): Event {
        val event = eventRepository.findByIdOrThrow(eventId)

        // Only PUBLISHED events are public. Owner/admin can inspect unpublished events.
        val privileged = userId != null && (
            event.creator.id == userId || userRepository.findById(userId).orElse(null)?.role == Role.ADMIN
        )
        if (event.status != EventStatus.PUBLISHED && !privileged) {
            // 404 semantics prevent probing hidden event IDs.
            throw com.cs2.volunteer_hub.exception.ResourceNotFoundException("Event", "id", eventId)
        }

        return event
    }
}
