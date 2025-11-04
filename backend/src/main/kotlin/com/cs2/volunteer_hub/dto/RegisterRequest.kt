package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.Gender
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.validation.StrongPassword
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank(message = "Username is required")
    @field:Size(min = 2, max = 100, message = "Username must be between 2 and 100 characters")
    val username: String,

    val gender: Gender,

    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:StrongPassword
    val password: String,

    val role: Role? = null
)