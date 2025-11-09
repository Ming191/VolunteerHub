package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.PagePostResponse
import com.cs2.volunteer_hub.dto.PostRequest
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.service.PostService
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/posts")
@PreAuthorize("isAuthenticated()")
class PostController(private val postService: PostService) {
    @PostMapping(value = ["/event/{eventId}"], consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun createPostForEvent(
        @PathVariable eventId: Long,
        @RequestPart("request") @Valid postRequest: PostRequest,
        @RequestPart("files", required = false) files: List<MultipartFile>?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PostResponse> {
        val newPost = postService.createPost(eventId, postRequest, files, currentUser.username)
        return ResponseEntity.status(HttpStatus.CREATED).body(newPost)
    }

    @GetMapping("/event/{eventId}")
    fun getPostsForEvent(
        @PathVariable eventId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "createdAt") sort: String,
        @RequestParam(defaultValue = "desc") direction: String,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PagePostResponse> {
        val pageable = PageRequest.of(
            page,
            size,
            Sort.Direction.fromString(direction.uppercase()),
            sort
        )
        val posts = postService.getPostsForEvent(eventId, currentUser.username, pageable)
        return ResponseEntity.ok(PagePostResponse.from(posts))
    }

    /**
     * Get recent posts from all events the user is registered for (feed/dashboard)
     * Example: GET /api/posts/feed?days=14&page=0&size=20
     */
    @GetMapping("/feed")
    fun getRecentPostsFeed(
        @RequestParam(defaultValue = "7") days: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "createdAt") sort: String,
        @RequestParam(defaultValue = "desc") direction: String,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PagePostResponse> {
        val pageable = PageRequest.of(
            page,
            size,
            Sort.Direction.fromString(direction.uppercase()),
            sort
        )
        val posts = postService.getRecentPostsForUser(currentUser.username, days, pageable)
        return ResponseEntity.ok(PagePostResponse.from(posts))
    }

    @PutMapping("/{postId}")
    fun updatePost(
        @PathVariable postId: Long,
        @Valid @RequestBody postRequest: PostRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PostResponse> {
        val updatedPost = postService.updatePost(postId, postRequest, currentUser.username)
        return ResponseEntity.ok(updatedPost)
    }

    @DeleteMapping("/{postId}")
    fun deletePost(
        @PathVariable postId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        postService.deletePost(postId, currentUser.username)
        return ResponseEntity.noContent().build()
    }
}