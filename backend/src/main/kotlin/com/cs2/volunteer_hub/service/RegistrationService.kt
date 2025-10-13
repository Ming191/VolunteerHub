package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import org.apache.coyote.BadRequestException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class RegistrationService(
    private val registrationRepository: RegistrationRepository,
    private val userRepository: UserRepository,
    private val eventRepository: EventRepository
) {
    @Transactional
    fun registerForEvent(eventId: Long, userEmail: String) {
        val user = userRepository.findByEmail(userEmail)
            ?: throw IllegalArgumentException("User not found with email: $userEmail")
        val event = eventRepository.findById(eventId)
            .orElseThrow { IllegalArgumentException("Event not found with id: $eventId") }
        if (!event.isApproved) {
            throw IllegalArgumentException("Cannot register for an unapproved event.")
        }
        if (registrationRepository.existsByEventIdAndUserId(eventId, user.id)) {
            throw IllegalArgumentException("User is already registered for this event.")
        }
        val registration = Registration(
            user = user,
            event = event
        )
        registrationRepository.save(registration)
    }

    @Transactional
    fun cancelRegistration(eventId: Long, userEmail: String) {
        val user = userRepository.findByEmail(userEmail)
            ?: throw ResourceNotFoundException("User", "email", userEmail)

        val registration = registrationRepository.findByEventIdAndUserId(eventId, user.id)
            .orElseThrow { ResourceNotFoundException("Registration", "event and user", "does not exist") }

        if (registration.status == RegistrationStatus.APPROVED) {

        }
        if (registration.event.eventDateTime.isBefore(LocalDateTime.now())) {
            throw BadRequestException("Cannot cancel registration for an event that has already occurred.")
        }
        registrationRepository.delete(registration)
    }
}
