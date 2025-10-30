package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.CommentRequest
import com.cs2.volunteer_hub.dto.CommentResponse
import com.cs2.volunteer_hub.service.CommentService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@PreAuthorize("isAuthenticated()")
class CommentController(private val commentService: CommentService) {

    @PostMapping
    fun createComment(
        @PathVariable postId: Long,
        @Valid @RequestBody commentRequest: CommentRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<CommentResponse> {
        val newComment = commentService.createComment(postId, commentRequest, currentUser.username)
        return ResponseEntity.status(HttpStatus.CREATED).body(newComment)
    }

    @GetMapping
    fun getCommentsForPost(
        @PathVariable postId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<CommentResponse>> {
        val comments = commentService.getCommentsForPost(postId, currentUser.username)
        return ResponseEntity.ok(comments)
    }
}