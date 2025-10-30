package com.cs2.volunteer_hub.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class CommentRequest(
    @field:NotBlank(message = "Nội dung bình luận không được để trống")
    val content: String
)

data class CommentResponse(
    val id: Long,
    val content: String,
    val createdAt: LocalDateTime,
    val author: AuthorResponse
)