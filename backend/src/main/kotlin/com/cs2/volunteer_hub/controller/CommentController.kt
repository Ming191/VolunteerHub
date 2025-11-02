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
@PreAuthorize("isAuthenticated()")
@Tag(name = "Comments", description = "Comment management endpoints")
@SecurityRequirement(name = "bearerAuth")
class CommentController(private val commentService: CommentService) {

    @Operation(summary = "Create comment", description = "Add a comment to a post")
    @PostMapping(consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun createComment(
        @PathVariable postId: Long,
        @Valid @RequestBody commentRequest: CommentRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<CommentResponse> {
        val newComment = commentService.createComment(postId, commentRequest, currentUser.username)
        return ResponseEntity.status(HttpStatus.CREATED).body(newComment)
    }

    @Operation(summary = "Get comments for post", description = "Retrieve all comments for a specific post")
    @GetMapping(produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getCommentsForPost(
        @PathVariable postId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<CommentResponse>> {
        val comments = commentService.getCommentsForPost(postId, currentUser.username)
        return ResponseEntity.ok(comments)
    }
}