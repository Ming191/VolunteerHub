package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.model.EventTag
import jakarta.persistence.criteria.JoinType
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

object EventSpecifications {

    fun hasStatus(status: EventStatus): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<EventStatus>("status"), status)
        }
    }

    fun isApproved(): Specification<Event> {
        return hasStatus(EventStatus.PUBLISHED)
    }

    fun isNotApproved(): Specification<Event> {
        return hasStatus(EventStatus.PENDING)
    }

    fun isNotCancelled(): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.notEqual(root.get<EventStatus>("status"), EventStatus.CANCELLED)
        }
    }

    fun hasCreator(creatorId: Long): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Any>("creator").get<Long>("id"), creatorId)
        }
    }

    fun happeningAfter(dateTime: LocalDateTime): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("eventDateTime"), dateTime)
        }
    }

    fun endingBefore(dateTime: LocalDateTime): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.lessThanOrEqualTo(root.get("endDateTime"), dateTime)
        }
    }

    fun isUpcoming(): Specification<Event> {
        return happeningAfter(LocalDateTime.now())
    }

    fun isPast(): Specification<Event> {
        return endingBefore(LocalDateTime.now())
    }

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
     * Filter events by location (case-insensitive partial match)
     * Example: location="hanoi" matches "Hanoi", "123 Street, Hanoi", etc.
     */
    fun locationContains(location: String): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("location")),
                "%${location.lowercase()}%"
            )
        }
    }

    fun isInProgress(): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            val now = LocalDateTime.now()
            criteriaBuilder.and(
                criteriaBuilder.equal(root.get<EventStatus>("status"), EventStatus.PUBLISHED),
                criteriaBuilder.lessThan(root.get("eventDateTime"), now),
                criteriaBuilder.greaterThan(root.get("endDateTime"), now)
            )
        }
    }

    fun registrationOpen(): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            val now = LocalDateTime.now()
            val deadline = root.get<LocalDateTime?>("registrationDeadline")
            val eventStart = root.get<LocalDateTime>("eventDateTime")

            criteriaBuilder.and(
                criteriaBuilder.equal(root.get<EventStatus>("status"), EventStatus.PUBLISHED),
                criteriaBuilder.greaterThan(eventStart, now),
                criteriaBuilder.or(
                    criteriaBuilder.isNull(deadline),
                    criteriaBuilder.greaterThan(deadline, now)
                )
            )
        }
    }

    fun upcomingPublishedEvents(): Specification<Event> {
        return isApproved().and(isUpcoming())
    }

    fun pastPublishedEvents(): Specification<Event> {
        return isApproved().and(isPast())
    }

    /**
     * Filter events that have ANY of the specified tags (OR logic)
     * Example: tags=[OUTDOOR, VIRTUAL] returns events with either OUTDOOR OR VIRTUAL tag
     */
    fun hasAnyTag(tags: Set<EventTag>): Specification<Event> {
        return Specification { root, _, criteriaBuilder ->
            if (tags.isEmpty()) {
                criteriaBuilder.conjunction() // Returns true (no filtering)
            } else {
                val tagsJoin = root.join<Event, EventTag>("tags", JoinType.LEFT)
                tagsJoin.`in`(tags)
            }
        }
    }

    /**
     * Filter events that have ALL of the specified tags (AND logic)
     * Example: tags=[OUTDOOR, FAMILY_FRIENDLY] returns events with BOTH tags
     * More restrictive than hasAnyTag
     */
    fun hasAllTags(tags: Set<EventTag>): Specification<Event> {
        return Specification { root, query, criteriaBuilder ->
            if (tags.isEmpty()) {
                criteriaBuilder.conjunction() // Returns true (no filtering)
            } else {
                // For each required tag, create a subquery that checks if the event has it
                val predicates = tags.map { tag ->
                    val subquery = query.subquery(Long::class.java)
                    val subRoot = subquery.from(Event::class.java)
                    val subTagsJoin = subRoot.join<Event, EventTag>("tags", JoinType.INNER)

                    subquery.select(criteriaBuilder.literal(1L))
                        .where(
                            criteriaBuilder.and(
                                criteriaBuilder.equal(subRoot.get<Long>("id"), root.get<Long>("id")),
                                criteriaBuilder.equal(subTagsJoin, tag)
                            )
                        )

                    criteriaBuilder.exists(subquery)
                }

                criteriaBuilder.and(*predicates.toTypedArray())
            }
        }
    }

    /**
     * Events created by a specific user that are not cancelled
     */
    fun activeEventsByCreator(creatorId: Long): Specification<Event> {
        return hasCreator(creatorId).and(isNotCancelled())
    }
}
