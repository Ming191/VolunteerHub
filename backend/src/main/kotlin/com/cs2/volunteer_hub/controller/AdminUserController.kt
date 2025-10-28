package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.service.AdminService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
class AdminUserController(private val adminService: AdminService) {

    @GetMapping
    fun getAllUsers(): ResponseEntity<List<UserResponse>> {
        val users = adminService.getAllUsers()
        return ResponseEntity.ok(users)
    }

    @PatchMapping("/{id}/lock")
    fun lockUser(@PathVariable id: Long): ResponseEntity<UserResponse> {
        val updatedUser = adminService.setUserLockStatus(id, true)
        return ResponseEntity.ok(updatedUser)
    }

    @PatchMapping("/{id}/unlock")
    fun unlockUser(@PathVariable id: Long): ResponseEntity<UserResponse> {
        val updatedUser = adminService.setUserLockStatus(id, false)
        return ResponseEntity.ok(updatedUser)
    }
}