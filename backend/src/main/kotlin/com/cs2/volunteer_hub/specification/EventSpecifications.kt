package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
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
     * Events created by a specific user that are not cancelled
     */
    fun activeEventsByCreator(creatorId: Long): Specification<Event> {
        return hasCreator(creatorId).and(isNotCancelled())
    }
}
