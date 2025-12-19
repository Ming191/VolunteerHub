package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.CommentRequest
import com.cs2.volunteer_hub.dto.CommentResponse
import com.cs2.volunteer_hub.service.CommentService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@Tag(name = "Comments", description = "Comment management endpoints")
@SecurityRequirement(name = "bearerAuth")
class CommentController(private val commentService: CommentService) {

    @Operation(
            summary = "Create comment or reply",
            description =
                    "Add a comment to a post. Include parentCommentId in the request body to create a reply to an existing comment."
    )
    @PreAuthorize("isAuthenticated()")
    @PostMapping(
            consumes = [MediaType.APPLICATION_JSON_VALUE],
            produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun createComment(
            @PathVariable postId: Long,
            @Valid @RequestBody commentRequest: CommentRequest,
            @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<CommentResponse> {
        val newComment = commentService.createComment(postId, commentRequest, currentUser.username)
        return ResponseEntity.status(HttpStatus.CREATED).body(newComment)
    }

    @Operation(
            summary = "Get comments for post (flat)",
            description = "Retrieve all comments for a specific post in a flat structure"
    )
    @GetMapping(produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getCommentsForPost(
            @PathVariable postId: Long,
            @AuthenticationPrincipal currentUser: UserDetails?
    ): ResponseEntity<List<CommentResponse>> {
        val comments = commentService.getCommentsForPost(postId, currentUser?.username)
        return ResponseEntity.ok(comments)
    }

    @Operation(
            summary = "Get comments with nested replies",
            description = "Retrieve all comments for a post with nested reply structure"
    )
    @GetMapping(path = ["/nested"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getNestedCommentsForPost(
            @PathVariable postId: Long,
            @AuthenticationPrincipal currentUser: UserDetails?
    ): ResponseEntity<List<CommentResponse>> {
        val comments = commentService.getNestedCommentsForPost(postId, currentUser?.username)
        return ResponseEntity.ok(comments)
    }

    @Operation(
            summary = "Get replies for a comment",
            description = "Retrieve all replies for a specific comment"
    )
    @GetMapping(path = ["/{commentId}/replies"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getRepliesForComment(
            @PathVariable postId: Long,
            @PathVariable commentId: Long,
            @AuthenticationPrincipal currentUser: UserDetails?
    ): ResponseEntity<List<CommentResponse>> {
        val replies = commentService.getRepliesForComment(commentId, currentUser?.username)
        return ResponseEntity.ok(replies)
    }

    @Operation(
        summary = "Update comment",
        description = "Update the content of an existing comment. Only the author can update their own comments."
    )
    @PreAuthorize("isAuthenticated()")
    @PutMapping(
        path = ["/{commentId}"],
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun updateComment(
            @PathVariable postId: Long,
            @PathVariable commentId: Long,
            @Valid @RequestBody commentRequest: CommentRequest,
            @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<CommentResponse> {
        val updatedComment = commentService.updateComment(
                postId,
                commentId,
                commentRequest.content,
                currentUser.username
            )
        return ResponseEntity.ok(updatedComment)
    }

    @Operation(
        summary = "Delete comment",
        description = "Delete a comment. Only the author can delete their own comments."
    )
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{commentId}")
    fun deleteComment(
        @PathVariable postId: Long,
        @PathVariable commentId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        commentService.deleteComment(postId, commentId, currentUser.username)
        return ResponseEntity.noContent().build()
    }
}
