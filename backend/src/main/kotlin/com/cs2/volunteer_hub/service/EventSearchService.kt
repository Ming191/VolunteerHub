package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventCategory
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.specification.EventSpecifications
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service for advanced event searching using Specification Pattern
 * Use this when you need flexible, dynamic queries
 */
@Service
class EventSearchService(
    private val eventRepository: EventRepository,
    private val eventMapper: EventMapper
) {

    /**
     * Search approved events with optional filters
     * Example: Search upcoming events containing "volunteer" in Hanoi area
     */
    @Transactional(readOnly = true)
    fun searchApprovedEvents(
        searchText: String? = null,
        onlyUpcoming: Boolean = false
    ): List<EventResponse> {
        var spec: Specification<Event> = EventSpecifications.isApproved()

        if (searchText != null && searchText.isNotBlank()) {
            spec = spec.and(EventSpecifications.searchText(searchText))
        }

        if (onlyUpcoming) {
            spec = spec.and(EventSpecifications.isUpcoming())
        }

        return eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime"))
            .map(eventMapper::toEventResponse)
    }

    /**
     * Advanced search with category, status, and availability filters
     * Example: Find upcoming environmental events with available slots
     */
    @Transactional(readOnly = true)
    fun searchEvents(
        searchText: String? = null,
        category: EventCategory? = null,
        status: EventStatus? = null,
        onlyUpcoming: Boolean = false,
        onlyWithAvailableSlots: Boolean = false
    ): List<EventResponse> {
        // Filter by status (defaults to APPROVED if not specified)
        var spec: Specification<Event> = if (status != null) {
            EventSpecifications.hasStatus(status)
        } else {
            EventSpecifications.hasStatus(EventStatus.APPROVED)
        }

        // Filter by category
        category?.let {
            spec = spec.and(EventSpecifications.hasCategory(it))
        }

        // Filter by search text
        if (searchText != null && searchText.isNotBlank()) {
            spec = spec.and(EventSpecifications.searchText(searchText))
        }

        // Filter for upcoming events only
        if (onlyUpcoming) {
            spec = spec.and(EventSpecifications.isUpcoming())
        }

        // Filter for events with available slots (uses subquery)
        if (onlyWithAvailableSlots) {
            spec = spec.and(EventSpecifications.hasAvailableSlots())
        }

        return eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime"))
            .map(eventMapper::toEventResponse)
    }

    /**
     * Find events by category
     * Example: Get all environmental events
     */
    @Transactional(readOnly = true)
    fun findEventsByCategory(
        category: EventCategory,
        onlyApproved: Boolean = true
    ): List<EventResponse> {
        var spec = EventSpecifications.hasCategory(category)

        if (onlyApproved) {
            spec = spec.and(EventSpecifications.hasStatus(EventStatus.APPROVED))
        }

        return eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime"))
            .map(eventMapper::toEventResponse)
    }

    /**
     * Find events with available volunteer slots
     * Uses efficient subquery to check capacity at database level
     */
    @Transactional(readOnly = true)
    fun findEventsWithAvailableSlots(
        onlyUpcoming: Boolean = true
    ): List<EventResponse> {
        var spec = EventSpecifications.hasStatus(EventStatus.APPROVED)
            .and(EventSpecifications.hasAvailableSlots())

        if (onlyUpcoming) {
            spec = spec.and(EventSpecifications.isUpcoming())
        }

        return eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime"))
            .map(eventMapper::toEventResponse)
    }

    /**
     * Find events by status
     * Useful for admin to see pending, cancelled, or completed events
     */
    @Transactional(readOnly = true)
    fun findEventsByStatus(status: EventStatus): List<EventResponse> {
        val spec = EventSpecifications.hasStatus(status)

        return eventRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
            .map(eventMapper::toEventResponse)
    }

    /**
     * Find events that need more volunteers (below minimum)
     * Useful for highlighting events that need attention
     */
    @Transactional(readOnly = true)
    fun findEventsNeedingVolunteers(): List<EventResponse> {
        val spec = EventSpecifications.hasStatus(EventStatus.APPROVED)
            .and(EventSpecifications.isUpcoming())
            .and(EventSpecifications.hasAvailableSlots())

        return eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime"))
            .map(eventMapper::toEventResponse)
            .filter { event ->
                // Filter events below minimum volunteers requirement
                event.minVolunteers?.let { min ->
                    event.currentVolunteers < min
                } ?: false
            }
    }
}
