package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.model.User
import org.springframework.stereotype.Component

@Component
class UserMapper {
    /**
     * Map User entity to UserResponse DTO
     */
    fun toUserResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id,
            name = user.name,
            email = user.email,
            role = user.role,
            isLocked = user.isLocked,
            isEmailVerified = user.isEmailVerified,
            createdAt = user.createdAt,
            lastLoginAt = user.lastLoginAt
        )
    }

    /**
     * Map list of User entities to list of UserResponse DTOs
     */
    fun toUserResponseList(users: List<User>): List<UserResponse> {
        return users.map { toUserResponse(it) }
    }
}
