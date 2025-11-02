package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

/**
 * Reusable query specifications for Event entity
 * Only includes commonly used specifications to avoid bloat
 */
object EventSpecifications {

    /**
     * Events that are approved
     */
    fun isApproved(): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Boolean>("isApproved"), true)
        }
    }

    /**
     * Events that are not approved (pending approval)
     */
    fun isNotApproved(): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Boolean>("isApproved"), false)
        }
    }

    /**
     * Events created by a specific user
     */
    fun hasCreator(creatorId: Long): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            val creatorJoin = root.join<Event, User>("creator")
            criteriaBuilder.equal(creatorJoin.get<Long>("id"), creatorId)
        }
    }

    /**
     * Events happening after a specific date/time
     */
    fun happeningAfter(dateTime: LocalDateTime): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("eventDateTime"), dateTime)
        }
    }

    /**
     * Events happening before a specific date/time
     */
    fun happeningBefore(dateTime: LocalDateTime): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.lessThanOrEqualTo(root.get("eventDateTime"), dateTime)
        }
    }

    /**
     * Upcoming events (happening in the future)
     */
    fun isUpcoming(): Specification<Event> {
        return happeningAfter(LocalDateTime.now())
    }

    /**
     * Past events (already happened)
     */
    fun isPast(): Specification<Event> {
        return happeningBefore(LocalDateTime.now())
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
