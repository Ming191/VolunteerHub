package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.AuthorResponse
import com.cs2.volunteer_hub.dto.CommentResponse
import com.cs2.volunteer_hub.model.Comment
import org.springframework.stereotype.Component

@Component
class CommentMapper {
    /**
     * Map Comment entity to CommentResponse DTO (without replies for flat structure)
     */
    fun toCommentResponse(comment: Comment): CommentResponse {
        return CommentResponse(
            id = comment.id,
            content = comment.content,
            createdAt = comment.createdAt,
            author = AuthorResponse(id = comment.author.id, name = comment.author.name),
            parentCommentId = comment.parentComment?.id,
            replyCount = comment.replies.size,
            replies = emptyList()
        )
    }

    /**
     * Map Comment entity to CommentResponse DTO with nested replies
     */
    fun toCommentResponseWithReplies(comment: Comment): CommentResponse {
        val replies = comment.replies
            .sortedBy { it.createdAt }
            .map { toCommentResponseWithReplies(it) }

        return CommentResponse(
            id = comment.id,
            content = comment.content,
            createdAt = comment.createdAt,
            author = AuthorResponse(id = comment.author.id, name = comment.author.name),
            parentCommentId = comment.parentComment?.id,
            replyCount = comment.replies.size,
            replies = replies
        )
    }

    /**
     * Map list of Comment entities to list of CommentResponse DTOs
     */
    fun toCommentResponseList(comments: List<Comment>): List<CommentResponse> {
        return comments.map { toCommentResponse(it) }
    }

    /**
     * Map list of Comment entities to nested CommentResponse structure
     * Only returns top-level comments with their nested replies
     */
    fun toNestedCommentResponseList(comments: List<Comment>): List<CommentResponse> {
        return comments
            .filter { it.parentComment == null } // Only top-level comments
            .sortedBy { it.createdAt }
            .map { toCommentResponseWithReplies(it) }
    }
}
