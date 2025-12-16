package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.PublicUserResponse
import com.cs2.volunteer_hub.service.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
@Tag(name = "User", description = "User management APIs")
class UserController(
    private val userService: UserService
) {

    @Operation(summary = "Get public user profile by ID")
    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: Long): ResponseEntity<PublicUserResponse> {
        val userProfile = userService.getPublicUserProfile(id)
        return ResponseEntity.ok(userProfile)
    }
}
