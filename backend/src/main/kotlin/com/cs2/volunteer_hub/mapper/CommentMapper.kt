package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.AuthorResponse
import com.cs2.volunteer_hub.dto.CommentResponse
import com.cs2.volunteer_hub.model.Comment
import org.springframework.stereotype.Component

@Component
class CommentMapper {
    /**
     * Map Comment entity to CommentResponse DTO
     */
    fun toCommentResponse(comment: Comment): CommentResponse {
        return CommentResponse(
            id = comment.id,
            content = comment.content,
            createdAt = comment.createdAt,
            author = AuthorResponse(id = comment.author.id, name = comment.author.name)
        )
    }

    /**
     * Map list of Comment entities to list of CommentResponse DTOs
     */
    fun toCommentResponseList(comments: List<Comment>): List<CommentResponse> {
        return comments.map { toCommentResponse(it) }
    }
}

