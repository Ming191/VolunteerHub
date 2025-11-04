package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.Interest
import com.cs2.volunteer_hub.model.Skill
import com.cs2.volunteer_hub.validation.StrongPassword
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Past
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDate

data class UpdateProfileRequest(
    @field:Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    val name: String?,

    @field:Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid phone number format")
    val phoneNumber: String?,

    @field:Size(max = 500, message = "Bio must not exceed 500 characters")
    val bio: String?,

    @field:Size(max = 100, message = "Location must not exceed 100 characters")
    val location: String?,

    @field:Past(message = "Date of birth must be in the past")
    val dateOfBirth: LocalDate?,

    val skills: Set<Skill>?,

    val interests: Set<Interest>?
)

data class ChangePasswordRequest(
    @field:NotBlank(message = "Current password is required")
    val currentPassword: String,

    @field:StrongPassword
    val newPassword: String
)
