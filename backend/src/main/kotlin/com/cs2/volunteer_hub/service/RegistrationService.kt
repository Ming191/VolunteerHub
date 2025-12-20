package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.RegistrationResultResponse
import com.cs2.volunteer_hub.dto.RegistrationStatusResponse
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ConflictException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.mapper.RegistrationMapper
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
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
    private val registrationMapper: RegistrationMapper,
    private val eventCapacityService: EventCapacityService
) {
    private val logger = LoggerFactory.getLogger(RegistrationService::class.java)

    @CacheEvict(value = ["userRegistrations", "volunteerDashboard", "organizerDashboard", "organizerAnalytics"], key = "#userEmail")
    @Transactional
    fun registerForEvent(eventId: Long, userEmail: String): RegistrationResultResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)

        val spec = RegistrationSpecifications.forEvent(eventId)
            .and(RegistrationSpecifications.byUser(user.id))

        if (registrationRepository.exists(spec)) {
            throw ConflictException("You are already registered for this event.")
        }

        val event = eventRepository.findByIdWithLock(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        if (!event.isRegistrationOpen()) {
            when {
                event.status != EventStatus.PUBLISHED ->
                    throw BadRequestException("Cannot register for unapproved event.")
                event.eventDateTime.isBefore(LocalDateTime.now()) ->
                    throw BadRequestException("Cannot register for event that has already occurred.")
                else ->
                    throw BadRequestException("Registration deadline has passed.")
            }
        }

        val registration = Registration(
            user = user,
            event = event
        )

        val currentApproved = eventCapacityService.getApprovedCount(eventId)
        val isFull = event.maxParticipants?.let { currentApproved >= it } ?: false

        val savedRegistration = if (isFull && event.waitlistEnabled) {
            val saved = waitlistService.addToWaitlist(registration)
            logger.info("User ${user.id} added to waitlist for event $eventId (capacity: $currentApproved/${event.maxParticipants})")
            saved
        } else if (isFull) {
            throw BadRequestException("Event is full and waitlist is not enabled.")
        } else {
            registration.status = RegistrationStatus.PENDING
            val saved = registrationRepository.save(registration)
            logger.info("User ${user.id} registered for event $eventId (capacity: ${currentApproved + 1}/${event.maxParticipants ?: "unlimited"})")

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
        val user = userRepository.findByEmailOrThrow(userEmail)

        val spec = RegistrationSpecifications.forEvent(eventId)
            .and(RegistrationSpecifications.byUser(user.id))

        val registration = registrationRepository.findOne(spec).orElse(null)

        return registrationMapper.toRegistrationStatusResponse(registration)
    }

    @CacheEvict(value = ["userRegistrations", "volunteerDashboard", "organizerDashboard", "organizerAnalytics"], key = "#userEmail")
    @Transactional
    fun cancelRegistration(eventId: Long, userEmail: String) {
        val user = userRepository.findByEmailOrThrow(userEmail)

        val spec = RegistrationSpecifications.forEvent(eventId)
            .and(RegistrationSpecifications.byUser(user.id))

        val registration = registrationRepository.findOne(spec)
            .orElseThrow { ResourceNotFoundException("Registration", "for this event and user", "not found") }

        if (registration.event.eventDateTime.isBefore(LocalDateTime.now())) {
            throw BadRequestException("Cannot cancel registration for event that has already occurred.")
        }

        val wasApproved = registration.status == RegistrationStatus.APPROVED
        val wasWaitlisted = registration.status == RegistrationStatus.WAITLISTED

        if (wasWaitlisted) {
            waitlistService.removeFromWaitlist(registration)
        }

        registrationRepository.delete(registration)
        logger.info("User ${user.id} cancelled registration for event $eventId")

        if (wasApproved) {
            val promoted = waitlistService.promoteFromWaitlist(eventId)
            if (promoted != null) {
                logger.info("Automatically promoted registration ${promoted.id} from waitlist")
            }
        }
    }
}