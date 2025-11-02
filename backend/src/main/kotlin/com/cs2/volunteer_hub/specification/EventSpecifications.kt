package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.*
import jakarta.persistence.criteria.JoinType
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

/**
 * Reusable query specifications for Event entity
 * Only includes commonly used specifications to avoid bloat
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
     * Events in a specific category
     */
    fun hasCategory(category: EventCategory): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<EventCategory>("category"), category)
        }
    }

    /**
     * Events that are approved
     * Now uses status field instead of deprecated isApproved
     */
    fun isApproved(): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<EventStatus>("status"), EventStatus.APPROVED)
        }
    }

    /**
     * Events that are not approved (pending approval)
     * Now uses status field instead of deprecated isApproved
     */
    fun isNotApproved(): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.notEqual(root.get<EventStatus>("status"), EventStatus.APPROVED)
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
     * Events with available volunteer slots
     * Uses a subquery to accurately count approved registrations at the database level
     *
     * This filters events where:
     * 1. maxVolunteers is NULL (unlimited capacity), OR
     * 2. The count of APPROVED registrations is less than maxVolunteers
     */
    fun hasAvailableSlots(): Specification<Event> {
        return Specification { root, query, criteriaBuilder ->
            // Subquery to count approved registrations for each event
            val subquery = query?.subquery(Long::class.java) ?: return@Specification null
            val registrationRoot = subquery.from(Registration::class.java)

            subquery.select(criteriaBuilder.count(registrationRoot.get<Long>("id")))
            subquery.where(
                criteriaBuilder.and(
                    criteriaBuilder.equal(registrationRoot.get<Event>("event"), root),
                    criteriaBuilder.equal(
                        registrationRoot.get<RegistrationStatus>("status"),
                        RegistrationStatus.APPROVED
                    )
                )
            )

            // Return events where:
            // - maxVolunteers is NULL (unlimited), OR
            // - approved registration count < maxVolunteers
            criteriaBuilder.or(
                criteriaBuilder.isNull(root.get<Int>("maxVolunteers")),
                criteriaBuilder.lessThan(subquery, root.get("maxVolunteers"))
            )
        }
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

    /**
     * Events with registrations after a specific date
     * Useful for finding trending/popular events
     */
    fun hasRegistrationsAfter(since: LocalDateTime): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            val registrationsJoin = root.join<Event, Registration>("registrations", JoinType.INNER)
            criteriaBuilder.greaterThan(registrationsJoin.get("registeredAt"), since)
        }
    }

    /**
     * Events created by a specific user with their registration counts
     * Used for finding organizer's most popular events
     */
    fun byCreatorWithRegistrations(creatorId: Long): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            root.join<Event, Registration>("registrations", JoinType.LEFT)
            criteriaBuilder.equal(root.get<User>("creator").get<Long>("id"), creatorId)
        }
    }
}
