package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Notification
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

/**
 * Reusable query specifications for Notification entity
 */
object NotificationSpecifications {

    fun forUser(userId: Long): Specification<Notification> {
        return Specification { root, _, criteriaBuilder ->
            val userJoin = root.join<Notification, User>("recipient")
            criteriaBuilder.equal(userJoin.get<Long>("id"), userId)
        }
    }

    fun isRead(read: Boolean): Specification<Notification> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Boolean>("isRead"), read)
        }
    }

    fun createdAfter(dateTime: LocalDateTime): Specification<Notification> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), dateTime)
        }
    }

    fun createdBefore(dateTime: LocalDateTime): Specification<Notification> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), dateTime)
        }
    }

    fun contentContains(text: String): Specification<Notification> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("content")),
                "%${text.lowercase()}%"
            )
        }
    }

    /**
     * Get unread notifications for a specific user
     * Common use case: notification badge count
     */
    fun unreadForUser(userId: Long): Specification<Notification> {
        return forUser(userId).and(isRead(false))
    }

    /**
     * Get recent notifications for a user within a time range
     */
    fun recentForUser(userId: Long, since: LocalDateTime): Specification<Notification> {
        return forUser(userId).and(createdAfter(since))
    }
}

