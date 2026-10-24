package com.cs2.volunteer_hub.dto

import com.fasterxml.jackson.annotation.JsonIgnore
import io.swagger.v3.oas.annotations.media.Schema

data class TokenResponse(
    val accessToken: String,
    @get:JsonIgnore @field:Schema(hidden = true) val refreshToken: String,
    val accessTokenExpiresIn: Long,  // milliseconds
    val refreshTokenExpiresIn: Long, // milliseconds
    val tokenType: String = "Bearer"
)

data class RefreshTokenRequest(
    val refreshToken: String
)

