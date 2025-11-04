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
            gender = user.gender,
            email = user.email,
            role = user.role,
            isLocked = user.isLocked,
            isEmailVerified = user.isEmailVerified,
            createdAt = user.createdAt,
            lastLoginAt = user.lastLoginAt,
            phoneNumber = user.phoneNumber,
            bio = user.bio,
            location = user.location,
            profilePictureUrl = user.profilePictureUrl,
            dateOfBirth = user.dateOfBirth,
            skills = user.skills.toSet(),
            interests = user.interests.toSet(),
            updatedAt = user.updatedAt
        )
    }
}
