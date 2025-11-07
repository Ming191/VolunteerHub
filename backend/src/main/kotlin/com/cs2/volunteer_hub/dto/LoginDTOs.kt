package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.Role
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class LoginRequest(
    @field:NotBlank @field:Email
    val email: String,
    @field:NotBlank
    val password: String
)

data class LoginResponse(
    val userId: Long,
    val email: String,
    val name: String,
    val role: Role,
    val isEmailVerified: Boolean,
    val accessToken: String,
    val refreshToken: String,
    val accessTokenExpiresIn: Long,  // milliseconds
    val refreshTokenExpiresIn: Long, // milliseconds
    val tokenType: String = "Bearer"
)

data class RegisterResponse(
    val userId: Long,
    val email: String,
    val name: String,
    val role: Role,
    val message: String
)

data class VerifyEmailResponse(
    val userId: Long,
    val email: String,
    val name: String,
    val isEmailVerified: Boolean,
    val message: String
)
