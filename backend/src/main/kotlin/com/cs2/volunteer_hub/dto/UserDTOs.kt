package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.Role

data class UserResponse(
    val id: Long,
    val name: String,
    val email: String,
    val role: Role,
    val isLocked: Boolean
)