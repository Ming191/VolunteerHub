package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ConflictException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class RegistrationService(
    private val registrationRepository: RegistrationRepository,
    private val userRepository: UserRepository,
    private val eventRepository: EventRepository,
    private val notificationService: NotificationService
) {
    @CacheEvict(value = ["userRegistrations"], key = "#userEmail")
    @Transactional
    fun registerForEvent(eventId: Long, userEmail: String) {
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
        registrationRepository.save(registration)

        // Send notification to event creator about new registration
        if (event.creator.id != user.id) {
            notificationService.queuePushNotificationToUser(
                userId = event.creator.id,
                title = "New Registration",
                body = "${user.name} has registered for your event '${event.title}'.",
                link = "/events/${event.id}/registrations"
            )
        }
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
        registrationRepository.delete(registration)
    }
}