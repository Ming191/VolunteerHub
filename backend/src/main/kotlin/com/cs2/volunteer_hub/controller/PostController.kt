package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.PostRequest
import com.cs2.volunteer_hub.dto.PostResponse
import com.cs2.volunteer_hub.service.PostService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/events/{eventId}/posts")
@PreAuthorize("isAuthenticated()")
class PostController(private val postService: PostService) {

    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun createPost(
        @PathVariable eventId: Long,
        @RequestPart("request") @Valid postRequest: PostRequest,
        @RequestPart("files", required = false) files: List<MultipartFile>?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<PostResponse> {
        val newPost = postService.createPost(eventId, postRequest, files, currentUser.username)
        return ResponseEntity.status(HttpStatus.CREATED).body(newPost)
    }

    @GetMapping
    fun getPostsForEvent(
        @PathVariable eventId: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<List<PostResponse>> {
        val posts = postService.getPostsForEvent(eventId, currentUser.username)
        return ResponseEntity.ok(posts)
    }
}