package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventTag
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.specification.EventSpecifications
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
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
     *
     * @param searchText Text to search in title, description, location
     * @param onlyUpcoming Filter for upcoming events only
     * @param tags Set of tags to filter by
     * @param matchAllTags If true, events must have ALL tags (AND). If false, events must have ANY tag (OR)
     * @param location Filter by specific location (case-insensitive partial match)
     * @param pageable Pagination and sorting parameters
     */
    @Transactional(readOnly = true)
    fun searchApprovedEvents(
        searchText: String? = null,
        onlyUpcoming: Boolean = false,
        tags: Set<EventTag>? = null,
        matchAllTags: Boolean = false,
        location: String? = null,
        pageable: Pageable
    ): Page<EventResponse> {
        var spec: Specification<Event> = EventSpecifications.isApproved()

        if (searchText != null && searchText.isNotBlank()) {
            spec = spec.and(EventSpecifications.searchText(searchText))
        }

        if (onlyUpcoming) {
            spec = spec.and(EventSpecifications.isUpcoming())
        }

        if (!tags.isNullOrEmpty()) {
            val tagSpec = if (matchAllTags) {
                EventSpecifications.hasAllTags(tags)
            } else {
                EventSpecifications.hasAnyTag(tags)
            }
            spec = spec.and(tagSpec)
        }

        if (!location.isNullOrBlank()) {
            spec = spec.and(EventSpecifications.locationContains(location.trim()))
        }

        val eventPage = eventRepository.findAll(spec, pageable)
        val eventResponses = eventMapper.toEventResponseList(eventPage.content)

        return PageImpl(
            eventResponses,
            pageable,
            eventPage.totalElements
        )
    }
}
