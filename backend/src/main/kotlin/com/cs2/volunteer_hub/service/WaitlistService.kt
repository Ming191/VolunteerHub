package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.mapper.RegistrationMapper
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service for managing event waitlists
 * Handles automatic promotion from waitlist when spots become available
 */
@Service
class WaitlistService(
    private val registrationRepository: RegistrationRepository,
    private val eventRepository: EventRepository,
    private val registrationMapper: RegistrationMapper,
    private val notificationService: NotificationService,
    private val eventCapacityService: EventCapacityService
) {
    private val logger = LoggerFactory.getLogger(WaitlistService::class.java)

    /**
     * Add a registration to the waitlist
     * Automatically assigns the next available position
     */
    @Transactional
    fun addToWaitlist(registration: Registration): Registration {
        val event = registration.event

        // Get current max position in waitlist
        val currentMaxPosition = getWaitlistForEvent(event.id)
            .maxOfOrNull { it.waitlistPosition ?: 0 } ?: 0

        registration.status = RegistrationStatus.WAITLISTED
        registration.waitlistPosition = currentMaxPosition + 1

        val saved = registrationRepository.save(registration)

        logger.info("Added registration ${saved.id} to waitlist for event ${event.id} at position ${saved.waitlistPosition}")

        // Notify user they're on waitlist
        notificationService.queuePushNotificationToUser(
            userId = registration.user.id,
            title = "Added to Waitlist",
            body = "You're #${saved.waitlistPosition} on the waitlist for '${event.title}'. We'll notify you if a spot opens up!",
            link = "/events/${event.id}"
        )

        return saved
    }

    /**
     * Get all waitlisted registrations for an event, ordered by position
     */
    @Transactional(readOnly = true)
    fun getWaitlistForEvent(eventId: Long): List<Registration> {
        val spec = RegistrationSpecifications.waitlistedForEvent(eventId)
        return registrationRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "waitlistPosition"))
    }

    /**
     * Get waitlist as DTO responses
     */
    @Transactional(readOnly = true)
    fun getWaitlistResponsesForEvent(eventId: Long): List<RegistrationResponse> {
        return getWaitlistForEvent(eventId).map(registrationMapper::toRegistrationResponse)
    }

    /**
     * Promote the first person from waitlist to approved
     * Called when a spot becomes available (someone cancels or is rejected)
     */
    @Transactional
    fun promoteFromWaitlist(eventId: Long): Registration? {
        val event = eventRepository.findByIdOrThrow(eventId)

        // Check if event still has capacity
        if (eventCapacityService.isFull(eventId, event.maxParticipants)) {
            logger.warn("Cannot promote from waitlist - event $eventId is still full")
            return null
        }

        // Get first person on waitlist
        val waitlist = getWaitlistForEvent(eventId)
        if (waitlist.isEmpty()) {
            logger.info("No one on waitlist for event $eventId")
            return null
        }

        val firstInLine = waitlist.first()
        firstInLine.status = RegistrationStatus.APPROVED
        firstInLine.waitlistPosition = null

        val promoted = registrationRepository.save(firstInLine)

        logger.info("Promoted registration ${promoted.id} from waitlist for event $eventId")

        // Reorder remaining waitlist
        reorderWaitlist(eventId)

        // Notify the promoted user
        notificationService.queuePushNotificationToUser(
            userId = promoted.user.id,
            title = "You're In! Spot Available",
            body = "Great news! A spot opened up for '${event.title}'. Your registration has been approved!",
            link = "/events/${event.id}"
        )

        return promoted
    }

    /**
     * Reorder waitlist positions after someone is removed
     * Ensures positions are sequential (1, 2, 3...) with no gaps
     */
    @Transactional
    fun reorderWaitlist(eventId: Long) {
        val waitlist = getWaitlistForEvent(eventId)

        waitlist.forEachIndexed { index, registration ->
            val newPosition = index + 1
            if (registration.waitlistPosition != newPosition) {
                registration.waitlistPosition = newPosition
                registrationRepository.save(registration)

                // Notify about position change
                notificationService.queuePushNotificationToUser(
                    userId = registration.user.id,
                    title = "Waitlist Position Updated",
                    body = "You moved up! You're now #${newPosition} on the waitlist for '${registration.event.title}'.",
                    link = "/events/${eventId}"
                )
            }
        }

        logger.info("Reordered waitlist for event $eventId - ${waitlist.size} registrations")
    }

    /**
     * Remove a registration from waitlist and reorder
     */
    @Transactional
    fun removeFromWaitlist(registration: Registration) {
        if (registration.status != RegistrationStatus.WAITLISTED) {
            return
        }

        val eventId = registration.event.id
        registration.waitlistPosition = null
        registrationRepository.save(registration)

        // Reorder remaining waitlist
        reorderWaitlist(eventId)

        logger.info("Removed registration ${registration.id} from waitlist for event $eventId")
    }

    /**
     * Check if event has waitlist enabled and space available
     */
    @Transactional(readOnly = true)
    fun shouldAddToWaitlist(eventId: Long): Boolean {
        val event = eventRepository.findByIdOrThrow(eventId)
        return eventCapacityService.isFull(eventId, event.maxParticipants) && event.waitlistEnabled
    }
}
