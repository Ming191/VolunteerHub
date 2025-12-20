package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.PagePostResponse
import com.cs2.volunteer_hub.dto.PostRequest
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.service.PostService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
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
@Tag(name = "Posts", description = "Post management endpoints")
@SecurityRequirement(name = "bearerAuth")
class PostController(private val postService: PostService) {

    @Operation(
            summary = "Create post for event",
            description =
                    "Create a new post for a specific event. Optionally upload up to 5 images with the post."
    )
    @PreAuthorize("isAuthenticated()")
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

    @Operation(
            summary = "Get posts for event",
            description = "Retrieve all posts for a specific event with pagination and sorting"
    )
    @GetMapping("/event/{eventId}")
    fun getPostsForEvent(
            @PathVariable eventId: Long,
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(defaultValue = "20") size: Int,
            @RequestParam(defaultValue = "createdAt") sort: String,
            @RequestParam(defaultValue = "desc") direction: String,
            @AuthenticationPrincipal currentUser: UserDetails?
    ): ResponseEntity<PagePostResponse> {
        val pageable =
                PageRequest.of(page, size, Sort.Direction.fromString(direction.uppercase()), sort)
        val posts = postService.getPostsForEvent(eventId, currentUser?.username, pageable)
        return ResponseEntity.ok(PagePostResponse.from(posts))
    }

    @Operation(
            summary = "Get recent posts feed",
            description =
                    "Get recent posts from all events the user is registered for (feed/dashboard). Filter by days and paginate results."
    )
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/feed")
    fun getRecentPostsFeed(
            @RequestParam(defaultValue = "7") days: Long,
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(defaultValue = "20") size: Int,
            @RequestParam(defaultValue = "createdAt") sort: String,
            @RequestParam(defaultValue = "desc") direction: String,
            @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PagePostResponse> {
        val pageable =
                PageRequest.of(page, size, Sort.Direction.fromString(direction.uppercase()), sort)
        val posts = postService.getRecentPostsForUser(currentUser.username, days, pageable)
        return ResponseEntity.ok(PagePostResponse.from(posts))
    }

    @Operation(
            summary = "Get my posts",
            description = "Get all posts created by the current user with pagination and sorting"
    )
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/my-posts")
    fun getMyPosts(
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(defaultValue = "20") size: Int,
            @RequestParam(defaultValue = "createdAt") sort: String,
            @RequestParam(defaultValue = "desc") direction: String,
            @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PagePostResponse> {
        val pageable =
                PageRequest.of(page, size, Sort.Direction.fromString(direction.uppercase()), sort)
        val posts = postService.getPostsByUser(currentUser.username, pageable)
        return ResponseEntity.ok(PagePostResponse.from(posts))
    }

    @Operation(
            summary = "Get posts by user ID",
            description = "Get all posts created by a specific user with pagination and sorting"
    )
    @GetMapping("/user/{userId}")
    fun getPostsByUserId(
            @PathVariable userId: Long,
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(defaultValue = "20") size: Int,
            @RequestParam(defaultValue = "createdAt") sort: String,
            @RequestParam(defaultValue = "desc") direction: String,
            @AuthenticationPrincipal currentUser: UserDetails?
    ): ResponseEntity<PagePostResponse> {
        val pageable =
                PageRequest.of(page, size, Sort.Direction.fromString(direction.uppercase()), sort)
        val posts = postService.getPostsByUserId(userId, currentUser?.username, pageable)
        return ResponseEntity.ok(PagePostResponse.from(posts))
    }

    @Operation(
            summary = "Update post",
            description =
                    "Update the content of an existing post. Only the author can update their own posts."
    )
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{postId}")
    fun updatePost(
            @PathVariable postId: Long,
            @Valid @RequestBody postRequest: PostRequest,
            @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PostResponse> {
        val updatedPost = postService.updatePost(postId, postRequest, currentUser.username)
        return ResponseEntity.ok(updatedPost)
    }

    @Operation(
            summary = "Delete post",
            description = "Delete a post. Only the author can delete their own posts."
    )
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{postId}")
    fun deletePost(
            @PathVariable postId: Long,
            @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        postService.deletePost(postId, currentUser.username)
        return ResponseEntity.noContent().build()
    }
}
