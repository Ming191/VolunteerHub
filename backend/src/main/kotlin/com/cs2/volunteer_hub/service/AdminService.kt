package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.Caching
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AdminService(
    private val eventRepository: EventRepository,
    private val eventService: EventService,
    private val userRepository: UserRepository,
    private val notificationService: NotificationService
) {
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

        return eventService.mapToEventResponse(savedEvent)
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

        return mapToUserResponse(savedUser)
    }

    private fun mapToUserResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id,
            name = user.name,
            email = user.email,
            role = user.role,
            isLocked = user.isLocked
        )
    }

    @Cacheable(value = ["users"])
    @Transactional(readOnly = true)
    fun getAllUsers(): List<UserResponse> {
        return userRepository.findAll().map(this::mapToUserResponse)
    }
}