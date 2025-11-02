package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.mapper.UserMapper
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.specification.EventSpecifications
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.Caching
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AdminService(
    private val eventRepository: EventRepository,
    private val eventMapper: EventMapper,
    private val userRepository: UserRepository,
    private val userMapper: UserMapper,
    private val notificationService: NotificationService,
    private val eventSearchService: EventSearchService
) {
    @Caching(evict = [
        CacheEvict(value = ["events"], allEntries = true),
        CacheEvict(value = ["event"], key = "#eventId")
    ])
    @Transactional
    fun approveEvent(eventId: Long): EventResponse {
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        event.status = EventStatus.APPROVED
        val savedEvent = eventRepository.save(event)

        // Send notification to event creator
        notificationService.queuePushNotificationToUser(
            userId = savedEvent.creator.id,
            title = "Event Approved",
            body = "Great news! Your event '${savedEvent.title}' has been approved and is now visible to volunteers.",
            link = "/events/${savedEvent.id}"
        )

        return eventMapper.toEventResponse(savedEvent)
    }

    @Caching(evict = [
        CacheEvict(value = ["events"], allEntries = true),
        CacheEvict(value = ["event"], key = "#eventId")
    ])
    @Transactional
    fun rejectEvent(eventId: Long) {
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        // Send notification to event creator before rejection
        notificationService.queuePushNotificationToUser(
            userId = event.creator.id,
            title = "Event Rejected",
            body = "Your event '${event.title}' has been reviewed and unfortunately cannot be approved at this time.",
            link = null
        )

        eventRepository.deleteById(eventId)
    }

    @Caching(evict = [
        CacheEvict(value = ["events"], allEntries = true),
        CacheEvict(value = ["event"], key = "#eventId")
    ])
    @Transactional
    fun deleteEventAsAdmin(eventId: Long) {
        rejectEvent(eventId)
    }

    @CacheEvict(value = ["users"], allEntries = true)
    @Transactional
    fun setUserLockStatus(userId: Long, locked: Boolean): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User", "id", userId) }

        user.isLocked = locked
        val savedUser = userRepository.save(user)

        // Send notification to user about account status change
        val title = if (locked) "Account Locked" else "Account Unlocked"
        val body = if (locked) {
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

    @Cacheable(value = ["users"])
    @Transactional(readOnly = true)
    fun getAllUsers(): List<UserResponse> {
        return userRepository.findAll().map(userMapper::toUserResponse)
    }

    /**
     * Get all pending events using Specification Pattern
     * This replaces the need for a dedicated repository method
     */
    @Transactional(readOnly = true)
    fun getPendingEvents(): List<EventResponse> {
        val spec = EventSpecifications.isNotApproved()
        return eventRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
            .map(eventMapper::toEventResponse)
    }

    /**
     * Search events by text (title, description, or location)
     */
    @Transactional(readOnly = true)
    fun searchAllEvents(searchTerm: String): List<EventResponse> {
        val spec = EventSpecifications.searchText(searchTerm)
        return eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime"))
            .map(eventMapper::toEventResponse)
    }

    /**
     * Get past events for historical/reporting purposes
     * Uses Specification Pattern with isPast()
     */
    @Transactional(readOnly = true)
    fun getPastEvents(): List<EventResponse> {
        val spec = EventSpecifications.hasStatus(EventStatus.APPROVED)
            .and(EventSpecifications.isPast())
        return eventRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "eventDateTime"))
            .map(eventMapper::toEventResponse)
    }

    /**
     * Get events by status (DRAFT, PENDING, APPROVED, CANCELLED, COMPLETED)
     * Uses EventSearchService for consistent query handling
     */
    @Transactional(readOnly = true)
    fun getEventsByStatus(status: EventStatus): List<EventResponse> {
        return eventSearchService.findEventsByStatus(status)
    }
}