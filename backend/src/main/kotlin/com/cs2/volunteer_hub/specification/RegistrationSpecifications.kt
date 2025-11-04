package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

/**
 * Reusable query specifications for Registration entity
 */
object RegistrationSpecifications {

    fun forEvent(eventId: Long): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            val eventJoin = root.join<Registration, Event>("event")
            criteriaBuilder.equal(eventJoin.get<Long>("id"), eventId)
        }
    }

    fun byUser(userId: Long): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            val userJoin = root.join<Registration, User>("user")
            criteriaBuilder.equal(userJoin.get<Long>("id"), userId)
        }
    }

    fun hasStatus(status: RegistrationStatus): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<RegistrationStatus>("status"), status)
        }
    }

    fun forEventsCreatedBy(creatorId: Long): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            val eventJoin = root.join<Registration, Event>("event")
            val creatorJoin = eventJoin.join<Event, User>("creator")
            criteriaBuilder.equal(creatorJoin.get<Long>("id"), creatorId)
        }
    }

    fun forPastEvents(): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            val eventJoin = root.join<Registration, Event>("event")
            criteriaBuilder.lessThan(
                eventJoin.get("eventDateTime"),
                LocalDateTime.now()
            )
        }
    }

    fun registeredAfter(dateTime: LocalDateTime): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("registeredAt"), dateTime)
        }
    }

    fun registeredBefore(dateTime: LocalDateTime): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.lessThanOrEqualTo(root.get("registeredAt"), dateTime)
        }
    }

    /**
     * Search registrations by user name
     */
    fun userNameContains(name: String): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            val userJoin = root.join<Registration, User>("user")
            criteriaBuilder.like(
                criteriaBuilder.lower(userJoin.get("name")),
                "%${name.lowercase()}%"
            )
        }
    }

    /**
     * Search registrations by user email
     */
    fun userEmailContains(email: String): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            val userJoin = root.join<Registration, User>("user")
            criteriaBuilder.like(
                criteriaBuilder.lower(userJoin.get("email")),
                "%${email.lowercase()}%"
            )
        }
    }

    /**
     * Search registrations by user phone number
     */
    fun userPhoneContains(phone: String): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            val userJoin = root.join<Registration, User>("user")
            criteriaBuilder.like(
                userJoin.get("phoneNumber"),
                "%$phone%"
            )
        }
    }

    /**
     * Search registrations by user text (name, email, or phone)
     * Most useful for general search functionality
     */
    fun userSearchText(searchText: String): Specification<Registration> {
        return Specification { root, _, criteriaBuilder ->
            val userJoin = root.join<Registration, User>("user")
            val searchPattern = "%${searchText.lowercase()}%"
            criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(userJoin.get("name")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(userJoin.get("email")), searchPattern),
                criteriaBuilder.like(userJoin.get("phoneNumber"), searchPattern)
            )
        }
    }
}
