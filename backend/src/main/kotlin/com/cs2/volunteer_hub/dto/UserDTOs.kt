package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.Gender
import com.cs2.volunteer_hub.model.Interest
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.model.Skill
import java.time.LocalDate
import java.time.LocalDateTime

data class UserResponse(
    val id: Long,
    val name: String,
    val gender: Gender?,
    val email: String,
    val role: Role,
    val isLocked: Boolean,
    val isEmailVerified: Boolean,
    val createdAt: LocalDateTime,
    val lastLoginAt: LocalDateTime?,
    val phoneNumber: String?,
    val bio: String?,
    val location: String?,
    val profilePictureUrl: String?,
    val dateOfBirth: LocalDate?,
    val skills: Set<Skill>,
    val interests: Set<Interest>,
    val updatedAt: LocalDateTime
)
