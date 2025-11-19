package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

object PostSpecifications {

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
