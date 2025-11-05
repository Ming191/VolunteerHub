package com.cs2.volunteer_hub.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class PostRequest(
    @field:NotBlank(message = "Content cannot be blank")
    val content: String
)

data class AuthorResponse(
    val id: Long,
    val name: String
)

data class PostResponse(
    val id: Long,
    val content: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?,
    val author: AuthorResponse,
    val totalLikes: Int,
    val totalComments: Int,
    val isLikedByCurrentUser: Boolean,
    val imageUrls: List<String>
)