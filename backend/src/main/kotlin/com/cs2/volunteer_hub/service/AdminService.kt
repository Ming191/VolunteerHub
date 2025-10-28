package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.model.User
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.stream.Collectors

@Service
class AdminService(
    private val eventRepository: EventRepository,
    private val eventService: EventService,
    private val userRepository: UserRepository,
) {
    @Transactional
    fun approveEvent(eventId: Long): EventResponse {
        val event = eventRepository.findById(eventId)
            .orElseThrow { IllegalArgumentException("Event not found with id: $eventId") }

        event.isApproved = true
        val savedEvent = eventRepository.save(event)
        return eventService.mapToEventResponse(savedEvent)
    }

    @Transactional
    fun deleteEventAsAdmin(eventId: Long) {
        if (!eventRepository.existsById(eventId)) {
            throw ResourceNotFoundException("Event", "id", eventId)
        }
        eventRepository.deleteById(eventId)
    }

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

    @Transactional(readOnly = true)
    fun getAllUsers(): List<UserResponse> {
        return userRepository.findAll().stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList())
    }
}