package com.cs2.volunteer_hub.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class CommentRequest(
    @field:NotBlank(message = "Content must not be blank")
    val content: String,
    val parentCommentId: Long? = null
)

data class CommentResponse(
    val id: Long,
    val content: String,
    val createdAt: LocalDateTime,
    val author: AuthorResponse,
    val parentCommentId: Long? = null,
    val replyCount: Int = 0,
    val replies: List<CommentResponse> = emptyList()
)