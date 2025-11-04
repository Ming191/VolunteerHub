package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.mapper.UserMapper
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.specification.EventSpecifications
import com.cs2.volunteer_hub.specification.UserSpecifications
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.Caching
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class AdminService(
    private val eventRepository: EventRepository,
    private val eventMapper: EventMapper,
    private val userRepository: UserRepository,
    private val userMapper: UserMapper,
    private val notificationService: NotificationService
) {
    private val logger = org.slf4j.LoggerFactory.getLogger(AdminService::class.java)

    /**
     * Search users by name specifically using UserSpecifications.nameContains()
     * More focused than general text search - only searches name field
     */
    @Transactional(readOnly = true)
    fun searchUsersByName(name: String, pageable: Pageable): Page<UserResponse> {
        val spec = UserSpecifications.nameContains(name)
        logger.info("Searching users by name: $name")
        return userRepository.findAll(spec, pageable).map(userMapper::toUserResponse)
    }

    /**
     * Search users by email specifically using UserSpecifications.emailContains()
     * Useful for finding all users from a specific email domain (e.g., "@company.com")
     */
    @Transactional(readOnly = true)
    fun searchUsersByEmail(email: String, pageable: Pageable): Page<UserResponse> {
        val spec = UserSpecifications.emailContains(email)
        logger.info("Searching users by email: $email")
        return userRepository.findAll(spec, pageable).map(userMapper::toUserResponse)
    }

    /**
     * Search users by phone number specifically using UserSpecifications.phoneNumberContains()
     * Useful for finding users by area code or partial phone number
     */
    @Transactional(readOnly = true)
    fun searchUsersByPhone(phone: String, pageable: Pageable): Page<UserResponse> {
        val spec = UserSpecifications.phoneNumberContains(phone)
        logger.info("Searching users by phone: $phone")
        return userRepository.findAll(spec, pageable).map(userMapper::toUserResponse)
    }

    /**
     * Search and filter users using UserSpecifications
     * Supports multiple filter combinations for powerful user management
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
            spec = null ?: textSpec
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

        logger.info("Searching users with filters - text: $searchText, role: $role, verified: $verified, locked: $locked, location: $location")

        return if (spec != null) {
            userRepository.findAll(spec, pageable).map(userMapper::toUserResponse)
        } else {
            userRepository.findAll(pageable).map(userMapper::toUserResponse)
        }
    }

    @Caching(evict = [
        CacheEvict(value = ["events"], allEntries = true),
        CacheEvict(value = ["event"], key = "#eventId")
    ])
    @Transactional
    fun approveEvent(eventId: Long): EventResponse {
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        event.isApproved = true
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
    fun deleteEventAsAdmin(eventId: Long) {
        val event = eventRepository.findById(eventId)
            .orElseThrow { ResourceNotFoundException("Event", "id", eventId) }

        // Send notification to event creator before deletion
        notificationService.queuePushNotificationToUser(
            userId = event.creator.id,
            title = "Event Rejected",
            body = "Your event '${event.title}' has been reviewed and unfortunately cannot be approved at this time.",
            link = null
        )

        eventRepository.deleteById(eventId)
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
        val spec = EventSpecifications.isApproved()
            .and(EventSpecifications.isPast())
        return eventRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "eventDateTime"))
            .map(eventMapper::toEventResponse)
    }
}