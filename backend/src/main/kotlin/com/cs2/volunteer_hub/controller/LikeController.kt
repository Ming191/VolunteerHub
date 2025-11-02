package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.service.LikeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/posts/{postId}/like")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Likes", description = "Post like/unlike endpoints")
@SecurityRequirement(name = "bearerAuth")
class LikeController(
    private val likeService: LikeService
) {
    @Operation(summary = "Toggle like", description = "Like or unlike a post (toggle)")
    @PostMapping(produces = [MediaType.APPLICATION_JSON_VALUE])
    fun toggleLike(
        @PathVariable postId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        val isLiked = likeService.toggleLike(postId, currentUser.username)
        val post = likeService.postRepository.findById(postId).get()
        return ResponseEntity.ok(mapOf("isLiked" to isLiked, "totalLikes" to post.likes.size))
    }
}