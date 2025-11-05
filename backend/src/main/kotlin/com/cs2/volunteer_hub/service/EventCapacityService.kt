package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.repository.EventRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service for managing event capacity and related calculations
 * Provides optimized methods for checking capacity without loading all registrations
 */
@Service
class EventCapacityService(
    private val eventRepository: EventRepository
) {

    /**
     * Get current count of approved registrations (confirmed participants)
     */
    @Transactional(readOnly = true)
    fun getApprovedCount(eventId: Long): Int {
        return eventRepository.countApprovedRegistrations(eventId)
    }

    /**
     * Get current waitlist count
     */
    @Transactional(readOnly = true)
    fun getWaitlistCount(eventId: Long): Int {
        return eventRepository.countWaitlistedRegistrations(eventId)
    }

    /**
     * Get current pending count
     */
    @Transactional(readOnly = true)
    fun getPendingCount(eventId: Long): Int {
        return eventRepository.countPendingRegistrations(eventId)
    }

    /**
     * Batch get capacity stats for multiple events
     * Solves N+1 query problem when mapping multiple events to DTOs
     */
    @Transactional(readOnly = true)
    fun getCapacityStatsForEvents(eventIds: List<Long>): Map<Long, CapacityStats> {
        if (eventIds.isEmpty()) return emptyMap()

        val approvedCounts = eventRepository.countApprovedRegistrationsByEvents(eventIds)
            .associate { map ->
                (map["eventId"] as Long) to (map["count"] as Long).toInt()
            }

        val waitlistCounts = eventRepository.countWaitlistedRegistrationsByEvents(eventIds)
            .associate { map ->
                (map["eventId"] as Long) to (map["count"] as Long).toInt()
            }

        val pendingCounts = eventRepository.countPendingRegistrationsByEvents(eventIds)
            .associate { map ->
                (map["eventId"] as Long) to (map["count"] as Long).toInt()
            }

        return eventIds.associateWith { eventId ->
            CapacityStats(
                approvedCount = approvedCounts[eventId] ?: 0,
                waitlistCount = waitlistCounts[eventId] ?: 0,
                pendingCount = pendingCounts[eventId] ?: 0
            )
        }
    }

    /**
     * Check if event has reached maximum capacity
     */
    @Transactional(readOnly = true)
    fun isFull(eventId: Long, maxParticipants: Int?): Boolean {
        return maxParticipants?.let { getApprovedCount(eventId) >= it } ?: false
    }

    /**
     * Get available spots remaining
     */
    @Transactional(readOnly = true)
    fun getAvailableSpots(eventId: Long, maxParticipants: Int?): Int? {
        return maxParticipants?.let { it - getApprovedCount(eventId) }
    }

    /**
     * Validate capacity change for an event
     * Ensures new capacity is not less than current approved registrations
     */
    @Transactional(readOnly = true)
    fun validateCapacityChange(eventId: Long, newMaxParticipants: Int?) {
        if (newMaxParticipants == null) {
            // Changing to unlimited is always allowed
            return
        }

        if (newMaxParticipants < 1) {
            throw BadRequestException("Maximum participants must be at least 1")
        }

        val currentApproved = getApprovedCount(eventId)
        if (newMaxParticipants < currentApproved) {
            throw BadRequestException(
                "Cannot reduce capacity to $newMaxParticipants. " +
                "There are already $currentApproved approved registrations. " +
                "Please cancel some registrations first."
            )
        }
    }
}

/**
 * Data class holding capacity statistics for an event
 */
data class CapacityStats(
    val approvedCount: Int,
    val waitlistCount: Int,
    val pendingCount: Int
)
