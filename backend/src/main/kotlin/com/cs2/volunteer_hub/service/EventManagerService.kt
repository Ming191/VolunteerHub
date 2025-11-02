package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.dto.RegistrationStatusUpdateMessage
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.mapper.RegistrationMapper
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class EventManagerService(
    private val registrationRepository: RegistrationRepository,
    private val eventRepository: EventRepository,
    private val cacheManager: CacheManager,
    private val rabbitTemplate: RabbitTemplate,
    private val registrationMapper: RegistrationMapper
) {
    private val logger = org.slf4j.LoggerFactory.getLogger(EventManagerService::class.java)

    private fun checkEventOwnership(eventId: Long, managerEmail: String) {
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }
        if (event.creator.email != managerEmail) {
            throw UnauthorizedAccessException("You do not have permission to manage this event.")
        }
    }

    @Transactional
    fun markRegistrationAsCompleted(registrationId: Long, managerEmail: String): RegistrationResponse {
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

        // Queue notification for status update
        queueRegistrationStatusUpdate(registrationId)

        return registrationMapper.toRegistrationResponse(savedRegistration)
    }

    /**
     * Bulk mark all approved registrations for past events as completed
     * Uses forPastEvents() specification to find eligible registrations
     * Useful for scheduled jobs or bulk operations
     */
    @Transactional
    fun bulkCompleteRegistrationsForPastEvents(managerEmail: String): Int {
        val manager = eventRepository.findAll()
            .firstOrNull { it.creator.email == managerEmail }
            ?.creator
            ?: throw ResourceNotFoundException("Manager", "email", managerEmail)

        // Use specifications to find approved registrations for past events created by this manager
        val spec = RegistrationSpecifications.forEventsCreatedBy(manager.id)
            .and(RegistrationSpecifications.hasStatus(RegistrationStatus.APPROVED))
            .and(RegistrationSpecifications.forPastEvents())

        val registrationsToComplete = registrationRepository.findAll(spec)

        if (registrationsToComplete.isEmpty()) {
            return 0
        }

        // Mark all as completed
        registrationsToComplete.forEach { registration ->
            evictRelatedCaches(registration)
            registration.status = RegistrationStatus.COMPLETED
            registrationRepository.save(registration)
            queueRegistrationStatusUpdate(registration.id)
        }

        logger.info("Bulk completed ${registrationsToComplete.size} registrations for past events by manager ${manager.id}")
        return registrationsToComplete.size
    }

    @Cacheable(value = ["eventRegistrations"], key = "#eventId")
    @Transactional(readOnly = true)
    fun getRegistrationsForEvent(eventId: Long, managerEmail: String): List<RegistrationResponse> {
        checkEventOwnership(eventId, managerEmail)

        // Use specification instead of repository method
        val spec = RegistrationSpecifications.forEvent(eventId)
        return registrationRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "registeredAt"))
            .map(registrationMapper::toRegistrationResponse)
    }

    /**
     * Get registrations by status for an event using Specification Pattern
     * More flexible than creating separate repository methods for each status
     */
    @Transactional(readOnly = true)
    fun getRegistrationsByStatus(
        eventId: Long,
        status: RegistrationStatus,
        managerEmail: String
    ): List<RegistrationResponse> {
        checkEventOwnership(eventId, managerEmail)

        val spec = RegistrationSpecifications.forEvent(eventId)
            .and(RegistrationSpecifications.hasStatus(status))

        return registrationRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "registeredAt"))
            .map(registrationMapper::toRegistrationResponse)
    }

    /**
     * Get all pending registrations for events created by this manager
     * Using specifications makes this query simple and readable
     */
    @Transactional(readOnly = true)
    fun getAllPendingRegistrations(managerEmail: String): List<RegistrationResponse> {
        val manager = eventRepository.findAll()
            .firstOrNull { it.creator.email == managerEmail }
            ?.creator
            ?: throw ResourceNotFoundException("Manager", "email", managerEmail)

        val spec = RegistrationSpecifications.forEventsCreatedBy(manager.id)
            .and(RegistrationSpecifications.hasStatus(RegistrationStatus.PENDING))

        return registrationRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "registeredAt"))
            .map(registrationMapper::toRegistrationResponse)
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

        // Queue notification for status update
        queueRegistrationStatusUpdate(registrationId)

        return registrationMapper.toRegistrationResponse(savedRegistration)
    }

    private fun queueRegistrationStatusUpdate(registrationId: Long) {
        try {
            val message = RegistrationStatusUpdateMessage(registrationId = registrationId)
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.REGISTRATION_STATUS_UPDATED_ROUTING_KEY,
                message
            )
        } catch (e: Exception) {
            logger.error("Failed to send registration status update message to RabbitMQ for registrationId: $registrationId", e)
            // Log error but don't fail the transaction
            // The registration status is still updated in the database
        }
    }

    private fun evictRelatedCaches(registration: Registration) {
        cacheManager.getCache("eventRegistrations")?.evict(registration.event.id)
        cacheManager.getCache("userRegistrations")?.evict(registration.user.email)
    }
}