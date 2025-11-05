package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

/**
 * Reusable query specifications for Event entity
 * Uses EventStatus for better type safety and flexibility
 */
object EventSpecifications {

    /**
     * Events with a specific status
     */
    fun hasStatus(status: EventStatus): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<EventStatus>("status"), status)
        }
    }

    /**
     * Events that are published (visible to users)
     */
    fun isApproved(): Specification<Event> {
        return hasStatus(EventStatus.PUBLISHED)
    }

    /**
     * Events that are pending approval
     */
    fun isNotApproved(): Specification<Event> {
        return hasStatus(EventStatus.PENDING)
    }

    /**
     * Events that are not cancelled
     */
    fun isNotCancelled(): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.notEqual(root.get<EventStatus>("status"), EventStatus.CANCELLED)
        }
    }

    /**
     * Events created by a specific user
     */
    fun hasCreator(creatorId: Long): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Any>("creator").get<Long>("id"), creatorId)
        }
    }

    /**
     * Events happening after a specific date/time (by start time)
     */
    fun happeningAfter(dateTime: LocalDateTime): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("eventDateTime"), dateTime)
        }
    }

    /**
     * Events ending before a specific date/time
     */
    fun endingBefore(dateTime: LocalDateTime): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.lessThanOrEqualTo(root.get("endDateTime"), dateTime)
        }
    }

    /**
     * Upcoming events (starting in the future)
     */
    fun isUpcoming(): Specification<Event> {
        return happeningAfter(LocalDateTime.now())
    }

    /**
     * Past events (already ended)
     */
    fun isPast(): Specification<Event> {
        return endingBefore(LocalDateTime.now())
    }

    /**
     * Events with title, description, or location containing search term (case-insensitive)
     */
    fun searchText(searchTerm: String): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            val searchPattern = "%${searchTerm.lowercase()}%"
            criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), searchPattern)
            )
        }
    }
}
