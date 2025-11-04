package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.RegistrationResultResponse
import com.cs2.volunteer_hub.dto.RegistrationStatusResponse
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ConflictException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.mapper.RegistrationMapper
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class RegistrationService(
    private val registrationRepository: RegistrationRepository,
    private val userRepository: UserRepository,
    private val eventRepository: EventRepository,
    private val notificationService: NotificationService,
    private val waitlistService: WaitlistService,
    private val registrationMapper: RegistrationMapper
) {
    private val logger = LoggerFactory.getLogger(RegistrationService::class.java)

    @CacheEvict(value = ["userRegistrations"], key = "#userEmail")
    @Transactional
    fun registerForEvent(eventId: Long, userEmail: String): RegistrationResultResponse {
        val user = userRepository.findByEmail(userEmail)
            ?: throw ResourceNotFoundException("User", "email", userEmail)

        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        if (!event.isApproved) {
            throw BadRequestException("Cannot register for unapproved event.")
        }

        if (event.eventDateTime.isBefore(LocalDateTime.now())) {
            throw BadRequestException("Cannot register for event that has already occurred.")
        }

        if (registrationRepository.existsByEventIdAndUserId(eventId, user.id)) {
            throw ConflictException("You are already registered for this event.")
        }

        val registration = Registration(
            user = user,
            event = event
        )

        // Use explicit check for waitlist
        val savedRegistration = if (waitlistService.shouldAddToWaitlist(eventId)) {
            // Event is full and waitlist is enabled - add to waitlist
            val saved = waitlistService.addToWaitlist(registration)
            logger.info("User ${user.id} added to waitlist for event ${eventId}")
            saved
        } else if (event.isFull()) {
            // Event is full but waitlist is disabled
            throw BadRequestException("Event is full and waitlist is not enabled.")
        } else {
            // Event has space - register normally
            registration.status = RegistrationStatus.PENDING
            val saved = registrationRepository.save(registration)
            logger.info("User ${user.id} registered for event ${eventId}")

            // Send notification to event creator about new registration
            if (event.creator.id != user.id) {
                notificationService.queuePushNotificationToUser(
                    userId = event.creator.id,
                    title = "New Registration",
                    body = "${user.name} has registered for your event '${event.title}'.",
                    link = "/events/${event.id}/registrations"
                )
            }
            saved
        }

        return registrationMapper.toRegistrationResultResponse(savedRegistration)
    }

    /**
     * Get user's registration status for an event
     * Includes waitlist position if applicable
     */
    @Transactional(readOnly = true)
    fun getRegistrationStatus(eventId: Long, userEmail: String): RegistrationStatusResponse {
        val user = userRepository.findByEmail(userEmail)
            ?: throw ResourceNotFoundException("User", "email", userEmail)

        val registration = registrationRepository.findByEventIdAndUserId(eventId, user.id)
            .orElse(null)

        return registrationMapper.toRegistrationStatusResponse(registration)
    }

    @CacheEvict(value = ["userRegistrations"], key = "#userEmail")
    @Transactional
    fun cancelRegistration(eventId: Long, userEmail: String) {
        val user = userRepository.findByEmail(userEmail)
            ?: throw ResourceNotFoundException("User", "email", userEmail)

        val registration = registrationRepository.findByEventIdAndUserId(eventId, user.id)
            .orElseThrow { ResourceNotFoundException("Registration", "for this event and user", "not found") }

        if (registration.event.eventDateTime.isBefore(LocalDateTime.now())) {
            throw BadRequestException("Cannot cancel registration for event that has already occurred.")
        }

        val wasApproved = registration.status == RegistrationStatus.APPROVED
        val wasWaitlisted = registration.status == RegistrationStatus.WAITLISTED

        // If waitlisted, use the helper method to properly handle removal and reordering
        if (wasWaitlisted) {
            waitlistService.removeFromWaitlist(registration)
        }

        registrationRepository.delete(registration)
        logger.info("User ${user.id} cancelled registration for event ${eventId}")

        // If this was an approved registration, try to promote someone from waitlist
        if (wasApproved) {
            val promoted = waitlistService.promoteFromWaitlist(eventId)
            if (promoted != null) {
                logger.info("Automatically promoted registration ${promoted.id} from waitlist")
            }
        }
    }
}