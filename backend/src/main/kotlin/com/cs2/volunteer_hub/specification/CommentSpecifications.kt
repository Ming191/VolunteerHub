package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Comment
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

/**
 * Reusable query specifications for Comment entity
 */
object CommentSpecifications {

    fun forPost(postId: Long): Specification<Comment> {
        return Specification { root, _, criteriaBuilder ->
            val postJoin = root.join<Comment, Post>("post")
            criteriaBuilder.equal(postJoin.get<Long>("id"), postId)
        }
    }

    fun byAuthor(authorId: Long): Specification<Comment> {
        return Specification { root, _, criteriaBuilder ->
            val authorJoin = root.join<Comment, User>("author")
            criteriaBuilder.equal(authorJoin.get<Long>("id"), authorId)
        }
    }

    fun createdAfter(dateTime: LocalDateTime): Specification<Comment> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), dateTime)
        }
    }

    fun createdBefore(dateTime: LocalDateTime): Specification<Comment> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), dateTime)
        }
    }

    fun contentContains(text: String): Specification<Comment> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("content")),
                "%${text.lowercase()}%"
            )
        }
    }
}
