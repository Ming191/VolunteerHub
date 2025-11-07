package com.cs2.volunteer_hub.dto

data class TokenResponse(
    val accessToken: String,
    val refreshToken: String,
    val accessTokenExpiresIn: Long,  // milliseconds
    val refreshTokenExpiresIn: Long, // milliseconds
    val tokenType: String = "Bearer"
)

data class RefreshTokenRequest(
    val refreshToken: String
)

