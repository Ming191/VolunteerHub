package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

object UserSpecifications {

    fun hasRole(role: Role): Specification<User> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Role>("role"), role)
        }
    }

    fun isEmailVerified(verified: Boolean): Specification<User> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Boolean>("isEmailVerified"), verified)
        }
    }

    fun isLocked(locked: Boolean): Specification<User> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Boolean>("isLocked"), locked)
        }
    }

    fun createdAfter(dateTime: LocalDateTime): Specification<User> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), dateTime)
        }
    }

    fun createdBefore(dateTime: LocalDateTime): Specification<User> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), dateTime)
        }
    }

    fun locationContains(location: String): Specification<User> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("location")),
                "%${location.lowercase()}%"
            )
        }
    }

    fun searchByText(searchText: String): Specification<User> {
        return Specification { root, _, criteriaBuilder ->
            val searchPattern = "%${searchText.lowercase()}%"
            criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchPattern),
                criteriaBuilder.like(root.get("phoneNumber"), searchPattern)
            )
        }
    }
}
