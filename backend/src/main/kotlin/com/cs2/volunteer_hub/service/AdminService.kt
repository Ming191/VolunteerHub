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
    private val userRepository: UserRepository
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
        return eventService.mapToEventResponse(savedEvent)
    }

    @Caching(evict = [
        CacheEvict(value = ["events"], allEntries = true),
        CacheEvict(value = ["event"], key = "#eventId")
    ])
    @Transactional
    fun deleteEventAsAdmin(eventId: Long) {
        if (!eventRepository.existsById(eventId)) {
            throw ResourceNotFoundException("Event", "id", eventId)
        }
        eventRepository.deleteById(eventId)
    }

    @CacheEvict(value = ["users"], allEntries = true)
    @Transactional
    fun setUserLockStatus(userId: Long, locked: Boolean): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User", "id", userId) }

        user.isLocked = locked
        val savedUser = userRepository.save(user)
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