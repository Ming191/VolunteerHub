package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.mapper.UserMapper
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import com.cs2.volunteer_hub.specification.EventSpecifications
import com.cs2.volunteer_hub.specification.UserSpecifications
import com.cs2.volunteer_hub.validation.EventLifecycleValidator
import java.time.LocalDateTime
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Caching
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AdminService(
        private val eventRepository: EventRepository,
        private val eventMapper: EventMapper,
        private val userRepository: UserRepository,
        private val userMapper: UserMapper,
        private val notificationService: NotificationService,
        private val cacheEvictionService: CacheEvictionService,
        private val eventLifecycleValidator: EventLifecycleValidator,
        private val eventQueueService: EventQueueService,
        private val emailQueueService: EmailQueueService
) {
    private val logger = org.slf4j.LoggerFactory.getLogger(AdminService::class.java)

    /**
     * Search and filter users using UserSpecifications Supports multiple filter combinations for
     * powerful user management
     */
    @Transactional(readOnly = true)
    fun searchUsers(
            searchText: String?,
            role: Role?,
            verified: Boolean?,
            locked: Boolean?,
            location: String?,
            registeredAfter: LocalDateTime?,
            registeredBefore: LocalDateTime?,
            pageable: Pageable
    ): Page<UserResponse> {
        // Start with a base specification
        var spec: Specification<User>? = null

        // Add text search if provided
        if (!searchText.isNullOrBlank()) {
            val textSpec = UserSpecifications.searchByText(searchText.trim())
            spec = spec?.and(textSpec) ?: textSpec
        }

        // Add role filter if provided
        if (role != null) {
            val roleSpec = UserSpecifications.hasRole(role)
            spec = spec?.and(roleSpec) ?: roleSpec
        }

        // Add verification status filter if provided
        if (verified != null) {
            val verifiedSpec = UserSpecifications.isEmailVerified(verified)
            spec = spec?.and(verifiedSpec) ?: verifiedSpec
        }

        // Add lock status filter if provided
        if (locked != null) {
            val lockedSpec = UserSpecifications.isLocked(locked)
            spec = spec?.and(lockedSpec) ?: lockedSpec
        }

        // Add location filter if provided
        if (!location.isNullOrBlank()) {
            val locationSpec = UserSpecifications.locationContains(location.trim())
            spec = spec?.and(locationSpec) ?: locationSpec
        }

        // Add date range filters if provided
        if (registeredAfter != null) {
            val afterSpec = UserSpecifications.createdAfter(registeredAfter)
            spec = spec?.and(afterSpec) ?: afterSpec
        }
        if (registeredBefore != null) {
            val beforeSpec = UserSpecifications.createdBefore(registeredBefore)
            spec = spec?.and(beforeSpec) ?: beforeSpec
        }

        logger.debug(
            "Searching users with filters - hasText: ${!searchText.isNullOrBlank()}, role: $role, verified: $verified, locked: $locked, hasLocation: ${!location.isNullOrBlank()}"
        )

        return if (spec != null) {
            userRepository.findAll(spec, pageable).map(userMapper::toUserResponse)
        } else {
            userRepository.findAll(pageable).map(userMapper::toUserResponse)
        }
    }

    @Caching(
        evict =
            [
                CacheEvict(value = ["events"], allEntries = true),
                CacheEvict(value = ["event"], key = "#eventId")]
    )
    @Transactional
    fun approveEvent(eventId: Long): EventResponse {
        val event = eventRepository.findByIdOrThrow(eventId)

        val from = event.status
        eventLifecycleValidator.validateStatusTransition(from, EventStatus.PUBLISHED, event)

        event.status = EventStatus.PUBLISHED
        val savedEvent = eventRepository.save(event)

        eventQueueService.queueEvent(
            EventLifecycleEvent(
                eventId = savedEvent.id,
                from = from,
                to = EventStatus.PUBLISHED
            )
        )

        notificationService.queuePushNotificationToUser(
            userId = savedEvent.creator.id,
            title = "Event Approved",
            body =
                "Great news! Your event '${savedEvent.title}' has been approved and is now visible to volunteers.",
            link = "/events/${savedEvent.id}"
        )

        // Send email notification
        emailQueueService.queueEventApprovedEmail(
            email = savedEvent.creator.email,
            name = savedEvent.creator.name,
            eventTitle = savedEvent.title,
            eventId = savedEvent.id
        )

        return eventMapper.toEventResponse(savedEvent)
    }

    @Transactional
    fun rejectEvent(eventId: Long, reason: String? = null): EventResponse {
        val event = eventRepository.findByIdOrThrow(eventId)

        // Validate state transition
        val from = event.status
        eventLifecycleValidator.validateStatusTransition(from, EventStatus.REJECTED, event)

        event.status = EventStatus.REJECTED
        event.rejectionReason = reason ?: "Your event has been reviewed and unfortunately cannot be approved at this time. Please contact support for more information."
        val savedEvent = eventRepository.save(event)

        // Send notifications
        notificationService.queuePushNotificationToUser(
            userId = event.creator.id,
            title = "Event Rejected",
            body = "Your event '${event.title}' has been reviewed and cannot be approved.",
            link = "/events/${event.id}"
        )

        emailQueueService.queueEventRejectedEmail(
            email = event.creator.email,
            name = event.creator.name,
            eventTitle = event.title,
            reason = event.rejectionReason!!
        )

        cacheEvictionService.evictAllEventCaches(eventId)
        return eventMapper.toEventResponse(savedEvent)
    }

    @Transactional
    fun deleteEventAsAdmin(eventId: Long) {
        val event = eventRepository.findByIdOrThrow(eventId)

        eventLifecycleValidator.validateDeletionAllowed(event)

        cacheEvictionService.evictAllEventCaches(eventId)
        eventRepository.deleteById(eventId)
    }

    @CacheEvict(value = ["users"], allEntries = true)
    @Transactional
    fun setUserLockStatus(userId: Long, locked: Boolean): UserResponse {
        val user =
            userRepository.findById(userId).orElseThrow {
                ResourceNotFoundException("User", "id", userId)
            }

        user.isLocked = locked
        val savedUser = userRepository.save(user)

        val title = if (locked) "Account Locked" else "Account Unlocked"
        val body =
            if (locked) {
                "Your account has been locked by an administrator. Please contact support for more information."
            } else {
                "Your account has been unlocked. You can now access all features again."
            }

        notificationService.queuePushNotificationToUser(
            userId = savedUser.id,
            title = title,
            body = body,
            link = null
        )

        return userMapper.toUserResponse(savedUser)
    }

    @Transactional(readOnly = true)
    fun getAllUsers(pageable: Pageable): Page<UserResponse> {
        return userRepository.findAll(pageable).map(userMapper::toUserResponse)
    }

    @Transactional(readOnly = true)
    fun getPendingEvents(pageable: Pageable): Page<EventResponse> {
        val spec = EventSpecifications.isNotApproved()
        return eventRepository.findAll(spec, pageable).map(eventMapper::toEventResponse)
    }

    @Transactional(readOnly = true)
    fun searchAllEvents(searchTerm: String, pageable: Pageable): Page<EventResponse> {
        val spec = EventSpecifications.searchText(searchTerm)
        return eventRepository.findAll(spec, pageable).map(eventMapper::toEventResponse)
    }

    @Transactional(readOnly = true)
    fun getPastEvents(pageable: Pageable): Page<EventResponse> {
        val spec = EventSpecifications.pastPublishedEvents()
        return eventRepository.findAll(spec, pageable).map(eventMapper::toEventResponse)
    }

    @Transactional(readOnly = true)
    fun getUpcomingEvents(pageable: Pageable): Page<EventResponse> {
        val spec = EventSpecifications.upcomingPublishedEvents()
        return eventRepository.findAll(spec, pageable).map(eventMapper::toEventResponse)
    }

    @Transactional(readOnly = true)
    fun getInProgressEvents(pageable: Pageable): Page<EventResponse> {
        val spec = EventSpecifications.isInProgress()
        return eventRepository.findAll(spec, pageable).map(eventMapper::toEventResponse)
    }

    @Transactional(readOnly = true)
    fun getEventsAcceptingRegistrations(pageable: Pageable): Page<EventResponse> {
        val spec = EventSpecifications.registrationOpen()
        return eventRepository.findAll(spec, pageable).map(eventMapper::toEventResponse)
    }

    @Transactional(readOnly = true)
    fun getActiveEventsByCreator(creatorId: Long, pageable: Pageable): Page<EventResponse> {
        val spec = EventSpecifications.activeEventsByCreator(creatorId)
        return eventRepository.findAll(spec, pageable).map(eventMapper::toEventResponse)
    }

    @Transactional(readOnly = true)
    fun getAllEvents(pageable: Pageable): Page<EventResponse> {
        return eventRepository.findAll(pageable).map(eventMapper::toEventResponse)
    }
}
