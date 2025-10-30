package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class EventManagerService(
    private val registrationRepository: RegistrationRepository,
    private val eventRepository: EventRepository,
    private val cacheManager: CacheManager
) {
    private fun checkEventOwnership(eventId: Long, managerEmail: String) {
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }
        if (event.creator.email != managerEmail) {
            throw UnauthorizedAccessException("You do not have permission to manage this event.")
        }
    }

    @Transactional
    fun markRegistrationAsCompleted(registrationId: Long, managerEmail: String) :  RegistrationResponse {
        val registration = registrationRepository.findById(registrationId)
            .orElseThrow { ResourceNotFoundException("Registration", "id", registrationId) }

        checkEventOwnership(registration.event.id, managerEmail)

        if (registration.status != RegistrationStatus.APPROVED) {
            throw BadRequestException("Only approved registrations can be marked as completed.")
        }
        if (registration.event.eventDateTime.isAfter(LocalDateTime.now())) {
            throw BadRequestException("Cannot mark as completed for events that have not occurred yet.")
        }

        evictRelatedCaches(registration)

        registration.status = RegistrationStatus.COMPLETED
        val savedRegistration = registrationRepository.save(registration)
        return mapToRegistrationResponse(savedRegistration)
    }

    @Cacheable(value = ["eventRegistrations"], key = "#eventId")
    @Transactional(readOnly = true)
    fun getRegistrationsForEvent(eventId: Long, managerEmail: String): List<RegistrationResponse> {
        checkEventOwnership(eventId, managerEmail)
        return registrationRepository.findAllByEventId(eventId).map(this::mapToRegistrationResponse)
    }

    @Transactional
    fun updateRegistrationStatus(
        registrationId: Long,
        newStatus: RegistrationStatus,
        managerEmail: String
    ): RegistrationResponse {
        val registration = registrationRepository.findById(registrationId)
            .orElseThrow { ResourceNotFoundException("Registration", "id", registrationId) }

        checkEventOwnership(registration.event.id, managerEmail)

        if (newStatus !in listOf(RegistrationStatus.APPROVED, RegistrationStatus.REJECTED)) {
            throw BadRequestException("Invalid status.")
        }

        evictRelatedCaches(registration)

        registration.status = newStatus
        val savedRegistration = registrationRepository.save(registration)
        return mapToRegistrationResponse(savedRegistration)
    }

    private fun evictRelatedCaches(registration: Registration) {
        cacheManager.getCache("eventRegistrations")?.evict(registration.event.id)
        cacheManager.getCache("userRegistrations")?.evict(registration.user.email)
    }

    fun mapToRegistrationResponse(registration: Registration): RegistrationResponse {
        return RegistrationResponse(
            id = registration.id,
            eventId = registration.event.id,
            eventTitle = registration.event.title,
            volunteerId = registration.user.id,
            volunteerName = registration.user.name,
            status = registration.status,
            registeredAt = registration.registeredAt
        )
    }
}