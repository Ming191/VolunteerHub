package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.service.LikeService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/posts/{postId}/like")
@PreAuthorize("isAuthenticated()")
class LikeController(
    private val likeService: LikeService
) {
    @PostMapping
    fun toggleLike(
        @PathVariable postId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        val isLiked = likeService.toggleLike(postId, currentUser.username)
        val post = likeService.postRepository.findById(postId).get()
        return ResponseEntity.ok(mapOf("isLiked" to isLiked, "totalLikes" to post.likes.size))
    }
}