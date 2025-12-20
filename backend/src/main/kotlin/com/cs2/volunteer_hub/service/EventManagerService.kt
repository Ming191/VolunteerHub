package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.RegistrationResponse
import com.cs2.volunteer_hub.dto.RegistrationStatusUpdateMessage
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.mapper.RegistrationMapper
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import java.time.LocalDateTime
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class EventManagerService(
        private val registrationRepository: RegistrationRepository,
        private val userRepository: UserRepository,
        private val rabbitTemplate: RabbitTemplate,
        private val registrationMapper: RegistrationMapper,
        private val waitlistService: WaitlistService,
        private val authorizationService: AuthorizationService,
        private val cacheEvictionService: CacheEvictionService,
        private val emailQueueService: EmailQueueService
) {
    private val logger = org.slf4j.LoggerFactory.getLogger(EventManagerService::class.java)

    /**
     * Search and filter registrations for a specific event Supports multiple filters: text search,
     * status, date range Returns paginated results
     */
    @Transactional(readOnly = true)
    fun searchEventRegistrations(
            eventId: Long,
            searchText: String?,
            status: RegistrationStatus?,
            registeredAfter: LocalDateTime?,
            registeredBefore: LocalDateTime?,
            pageable: Pageable,
            managerEmail: String
    ): Page<RegistrationResponse> {
        authorizationService.requireEventOwnership(eventId, managerEmail)

        logger.info(
                "Searching registrations for event $eventId with filters - text: $searchText, status: $status, after: $registeredAfter, before: $registeredBefore"
        )

        // OPTIMIZED: First get registration IDs with filters, then fetch with associations
        val registrationIds = registrationRepository.findRegistrationIdsByFilters(
            eventId = eventId,
            status = status,
            searchText = searchText?.trim(),
            registeredAfter = registeredAfter,
            registeredBefore = registeredBefore,
            pageable = pageable
        )

        if (registrationIds.isEmpty()) {
            return Page.empty(pageable)
        }

        // Load registrations with all associations in single query
        val registrationsWithAssociations = registrationRepository.findByIdsWithAssociations(registrationIds)
        
        // Maintain original order from query
        val registrationMap = registrationsWithAssociations.associateBy { it.id }
        val orderedRegistrations = registrationIds.mapNotNull { registrationMap[it] }

        val registrationResponses = orderedRegistrations.map(registrationMapper::toRegistrationResponse)

        // Get total count for pagination
        var spec: Specification<Registration> = RegistrationSpecifications.forEvent(eventId)
        if (!searchText.isNullOrBlank()) {
            spec = spec.and(RegistrationSpecifications.userSearchText(searchText.trim()))
        }
        if (status != null) {
            spec = spec.and(RegistrationSpecifications.hasStatus(status))
        }
        if (registeredAfter != null) {
            spec = spec.and(RegistrationSpecifications.registeredAfter(registeredAfter))
        }
        if (registeredBefore != null) {
            spec = spec.and(RegistrationSpecifications.registeredBefore(registeredBefore))
        }
        val totalCount = registrationRepository.count(spec)

        return org.springframework.data.domain.PageImpl(registrationResponses, pageable, totalCount)
    }

    @Transactional
    fun markRegistrationAsCompleted(
            registrationId: Long,
            managerEmail: String
    ): RegistrationResponse {
        val registration = registrationRepository.findByIdOrThrow(registrationId)

        authorizationService.requireEventOwnership(registration.event.id, managerEmail)

        if (registration.status != RegistrationStatus.APPROVED) {
            throw BadRequestException("Only approved registrations can be marked as completed.")
        }
        if (!registration.event.isPast()) {
            throw BadRequestException(
                    "Cannot mark as completed for events that have not ended yet."
            )
        }

        cacheEvictionService.evictRelatedCaches(registration)
        cacheEvictionService.evictEventRegistrations(registration.event.id)
        cacheEvictionService.evictDashboardCaches(registration.user.email)
        cacheEvictionService.evictDashboardCaches(registration.event.creator.email)

        registration.status = RegistrationStatus.COMPLETED
        val savedRegistration = registrationRepository.save(registration)

        queueRegistrationStatusUpdate(registrationId, RegistrationStatus.COMPLETED)

        return registrationMapper.toRegistrationResponse(savedRegistration)
    }

    /**
     * Bulk mark all approved registrations for past events as completed Uses forPastEvents()
     * specification to find eligible registrations Useful for scheduled jobs or bulk operations
     */
    @Transactional
    fun bulkCompleteRegistrationsForPastEvents(managerEmail: String): Int {
        val manager = userRepository.findByEmailOrThrow(managerEmail)
        val spec =
                RegistrationSpecifications.forEventsCreatedBy(manager.id)
                        .and(RegistrationSpecifications.hasStatus(RegistrationStatus.APPROVED))
                        .and(RegistrationSpecifications.forPastEvents())
        val registrationsToComplete = registrationRepository.findAll(spec)
        if (registrationsToComplete.isEmpty()) {
            return 0
        }
        registrationsToComplete.forEach { registration ->
            registration.status = RegistrationStatus.COMPLETED
        }
        registrationRepository.saveAll(registrationsToComplete)
        
        // Collect unique event IDs and user emails for efficient cache eviction
        val eventIds = registrationsToComplete.map { it.event.id }.toSet()
        val userEmails = registrationsToComplete.map { it.user.email }.toSet()
        
        // Evict caches in bulk
        eventIds.forEach { eventId ->
            cacheEvictionService.evictEventRegistrations(eventId)
        }
        userEmails.forEach { userEmail ->
            cacheEvictionService.evictDashboardCaches(userEmail)
        }
        cacheEvictionService.evictDashboardCaches(manager.email)
        
        registrationsToComplete.forEach { registration ->
            cacheEvictionService.evictRelatedCaches(registration)
            queueRegistrationStatusUpdate(registration.id, RegistrationStatus.COMPLETED)
        }

        logger.info(
                "Bulk completed ${registrationsToComplete.size} registrations for past events by manager ${manager.id}"
        )
        return registrationsToComplete.size
    }

    /** Get waitlist for a specific event */
    @Transactional(readOnly = true)
    fun getEventWaitlist(eventId: Long, managerEmail: String): List<RegistrationResponse> {
        authorizationService.requireEventOwnership(eventId, managerEmail)
        return waitlistService.getWaitlistResponsesForEvent(eventId)
    }

    /** Manually promote someone from waitlist */
    @Transactional
    fun promoteFromWaitlist(eventId: Long, managerEmail: String): RegistrationResponse {
        authorizationService.requireEventOwnership(eventId, managerEmail)

        val promoted =
                waitlistService.promoteFromWaitlist(eventId)
                        ?: throw BadRequestException("No one on waitlist or event is full")

        cacheEvictionService.evictRelatedCaches(promoted)
        return registrationMapper.toRegistrationResponse(promoted)
    }

    @Cacheable(value = ["eventRegistrations"], key = "#eventId")
    @Transactional(readOnly = true)
    fun getRegistrationsForEvent(eventId: Long, managerEmail: String): List<RegistrationResponse> {
        authorizationService.requireEventOwnership(eventId, managerEmail)

        // Use JOIN FETCH query to eagerly load user and event in a single query
        val registrations = registrationRepository.findAllByEventIdWithAssociations(eventId)

        // Sort in memory since we're using custom query
        return registrations
                .sortedByDescending { it.registeredAt }
                .map(registrationMapper::toRegistrationResponse)
    }

    /**
     * Get registrations by status for an event using NEW Composite Specification Uses
     * approvedForEvent(), pendingForEvent(), or waitlistedForEvent()
     */
    @Transactional(readOnly = true)
    fun getRegistrationsByStatus(
            eventId: Long,
            status: RegistrationStatus,
            managerEmail: String
    ): List<RegistrationResponse> {
        authorizationService.requireEventOwnership(eventId, managerEmail)

        // Use JOIN FETCH query to eagerly load associations in single query
        val registrations =
                registrationRepository.findAllByEventIdAndStatusWithAssociations(eventId, status)

        return registrations
                .sortedByDescending { it.registeredAt }
                .map(registrationMapper::toRegistrationResponse)
    }

    /**
     * Get all pending registrations for events created by this manager Uses NEW composite
     * specifications for cleaner code
     */
    @Transactional(readOnly = true)
    fun getAllPendingRegistrations(managerEmail: String): List<RegistrationResponse> {
        val manager = userRepository.findByEmailOrThrow(managerEmail)

        // Use JOIN FETCH query to eagerly load associations
        val registrations =
                registrationRepository.findAllByEventCreatorIdAndStatusWithAssociations(
                        manager.id,
                        RegistrationStatus.PENDING
                )

        return registrations
                .sortedByDescending { it.registeredAt }
                .map(registrationMapper::toRegistrationResponse)
    }

    /**
     * Get all approved registrations for manager's events Uses NEW composite specification
     * isApproved()
     */
    @Transactional(readOnly = true)
    fun getAllApprovedRegistrations(managerEmail: String): List<RegistrationResponse> {
        val manager = userRepository.findByEmailOrThrow(managerEmail)

        // Use JOIN FETCH query to eagerly load associations
        val registrations =
                registrationRepository.findAllByEventCreatorIdAndStatusWithAssociations(
                        manager.id,
                        RegistrationStatus.APPROVED
                )

        return registrations
                .sortedByDescending { it.registeredAt }
                .map(registrationMapper::toRegistrationResponse)
    }

    /**
     * Get all active registrations (approved + waitlisted) for an event Uses NEW composite
     * specification activeForEvent()
     */
    @Transactional(readOnly = true)
    fun getActiveRegistrations(eventId: Long, managerEmail: String): List<RegistrationResponse> {
        authorizationService.requireEventOwnership(eventId, managerEmail)

        // Use JOIN FETCH query to eagerly load associations
        val registrations =
                registrationRepository.findActiveRegistrationsByEventIdWithAssociations(eventId)

        return registrations
                .sortedByDescending { it.registeredAt }
                .map(registrationMapper::toRegistrationResponse)
    }

    /** Get all completed registrations for an event Uses NEW specification isCompleted() */
    @Transactional(readOnly = true)
    fun getCompletedRegistrations(eventId: Long, managerEmail: String): List<RegistrationResponse> {
        authorizationService.requireEventOwnership(eventId, managerEmail)

        // Use JOIN FETCH query to eagerly load associations
        val registrations =
                registrationRepository.findCompletedRegistrationsByEventIdWithAssociations(eventId)

        return registrations
                .sortedByDescending { it.registeredAt }
                .map(registrationMapper::toRegistrationResponse)
    }

    /**
     * Get all completed registrations across all manager's events Useful for analytics and
     * reporting
     */
    @Transactional(readOnly = true)
    fun getAllCompletedRegistrationsForManager(managerEmail: String): List<RegistrationResponse> {
        val manager = userRepository.findByEmailOrThrow(managerEmail)

        // Use JOIN FETCH query to eagerly load associations
        val registrations =
                registrationRepository.findCompletedRegistrationsByCreatorIdWithAssociations(
                        manager.id
                )

        return registrations
                .sortedByDescending { it.registeredAt }
                .map(registrationMapper::toRegistrationResponse)
    }

    /** Update registration status (approve/reject) and handle waitlist promotion */
    @Transactional
    fun updateRegistrationStatus(
            registrationId: Long,
            newStatus: RegistrationStatus,
            managerEmail: String
    ): RegistrationResponse {
        val registration = registrationRepository.findByIdOrThrow(registrationId)

        authorizationService.requireEventOwnership(registration.event.id, managerEmail)

        if (newStatus !in listOf(RegistrationStatus.APPROVED, RegistrationStatus.REJECTED)) {
            throw BadRequestException("Invalid status.")
        }

        val oldStatus = registration.status

        cacheEvictionService.evictRelatedCaches(registration)
        cacheEvictionService.evictEventRegistrations(registration.event.id)
        cacheEvictionService.evictDashboardCaches(registration.user.email)
        cacheEvictionService.evictDashboardCaches(registration.event.creator.email)

        registration.status = newStatus
        val savedRegistration = registrationRepository.save(registration)

        // Queue notification for status update
        queueRegistrationStatusUpdate(registrationId, newStatus)

        // Send email notification - COMMENTED OUT FOR DEBUGGING
        // emailQueueService.queueRegistrationStatusEmail(
        //    email = savedRegistration.user.email,
        //    name = savedRegistration.user.name,
        //    eventTitle = savedRegistration.event.title,
        //    status = newStatus.name
        // )

        // If rejecting or cancelling an approved registration, promote from waitlist
        if (oldStatus == RegistrationStatus.APPROVED && newStatus == RegistrationStatus.REJECTED) {
            waitlistService.promoteFromWaitlist(registration.event.id)
        }

        return registrationMapper.toRegistrationResponse(savedRegistration)
    }

    private fun queueRegistrationStatusUpdate(registrationId: Long, status: RegistrationStatus) {
        try {
            val message =
                    RegistrationStatusUpdateMessage(
                            registrationId = registrationId,
                            status = status
                    )
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.REGISTRATION_STATUS_UPDATED_ROUTING_KEY,
                    message
            )
        } catch (e: Exception) {
            logger.error(
                    "Failed to send registration status update message to RabbitMQ for registrationId: $registrationId",
                    e
            )
        }
    }
}
