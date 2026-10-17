package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

object PostSpecifications {

    /** Enforce event visibility inside the database query, before pagination/counting. */
    fun visibleInEventsTo(viewerId: Long?, isAdmin: Boolean): Specification<Post> {
        return Specification { root, _, cb ->
            if (isAdmin) {
                cb.conjunction()
            } else {
                val event = root.join<Post, Event>("event")
                val publicEvent = cb.equal(event.get<EventStatus>("status"), EventStatus.PUBLISHED)
                if (viewerId == null) {
                    publicEvent
                } else {
                    cb.or(
                        publicEvent,
                        cb.equal(event.get<Any>("creator").get<Long>("id"), viewerId)
                    )
                }
            }
        }
    }

    fun forEvent(eventId: Long): Specification<Post> {
        return Specification { root, _, criteriaBuilder ->
            val eventJoin = root.join<Post, Event>("event")
            criteriaBuilder.equal(eventJoin.get<Long>("id"), eventId)
        }
    }

    fun forEvents(eventIds: List<Long>): Specification<Post> {
        return Specification { root, _, _ ->
            val eventJoin = root.join<Post, Event>("event")
            eventJoin.get<Long>("id").`in`(eventIds)
        }
    }

    fun createdAfter(dateTime: LocalDateTime): Specification<Post> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), dateTime)
        }
    }

    fun byAuthor(userId: Long): Specification<Post> {
        return Specification { root, _, criteriaBuilder ->
            val authorJoin = root.join<Post, User>("author")
            criteriaBuilder.equal(authorJoin.get<Long>("id"), userId)
        }
    }
}
