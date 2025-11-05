package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.model.Event
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

        val events = eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime"))
        return eventMapper.toEventResponseList(events)
    }
}
