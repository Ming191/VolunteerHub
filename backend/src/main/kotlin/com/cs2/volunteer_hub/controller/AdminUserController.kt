package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.UserResponse
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.service.AdminService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Users", description = "Admin endpoints for user management")
class AdminUserController(private val adminService: AdminService) {

    @Operation(
        summary = "Get all users",
        description = "Retrieve all users in the system",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping
    fun getAllUsers(): ResponseEntity<List<UserResponse>> {
        val users = adminService.getAllUsers()
        return ResponseEntity.ok(users)
    }

    /**
     * Search and filter users with multiple criteria
     * Example: GET /api/admin/users/search?q=john&role=VOLUNTEER&verified=true&page=0&size=20
     */
    @Operation(
        summary = "Search and filter users",
        description = "Search users by text (name, email, phone), filter by role, verification status, lock status, location, and registration date range. Supports pagination.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/search")
    fun searchUsers(
        @Parameter(description = "Search text (searches name, email, phone)")
        @RequestParam(required = false) q: String?,
        @Parameter(description = "Filter by user role")
        @RequestParam(required = false) role: Role?,
        @Parameter(description = "Filter by email verification status")
        @RequestParam(required = false) verified: Boolean?,
        @Parameter(description = "Filter by account lock status")
        @RequestParam(required = false) locked: Boolean?,
        @Parameter(description = "Filter by location")
        @RequestParam(required = false) location: String?,
        @Parameter(description = "Filter users registered after this date (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) registeredAfter: LocalDateTime?,
        @Parameter(description = "Filter users registered before this date (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) registeredBefore: LocalDateTime?,
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0") page: Int,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") size: Int,
        @Parameter(description = "Sort field")
        @RequestParam(defaultValue = "createdAt") sort: String,
        @Parameter(description = "Sort direction (asc or desc)")
        @RequestParam(defaultValue = "desc") direction: String
    ): ResponseEntity<Page<UserResponse>> {
        val pageable = PageRequest.of(
            page,
            size,
            Sort.Direction.fromString(direction.uppercase()),
            sort
        )

        val users = adminService.searchUsers(
            searchText = q,
            role = role,
            verified = verified,
            locked = locked,
            location = location,
            registeredAfter = registeredAfter,
            registeredBefore = registeredBefore,
            pageable = pageable
        )

        return ResponseEntity.ok(users)
    }

    /**
     * Search users specifically by name
     * Example: GET /api/admin/users/search/name?name=smith&page=0&size=20
     */
    @Operation(
        summary = "Search users by name",
        description = "Search users specifically by name (case-insensitive partial match). More focused than general search.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/search/name")
    fun searchUsersByName(
        @Parameter(description = "Name to search for", required = true)
        @RequestParam name: String,
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0") page: Int,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<UserResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"))
        val users = adminService.searchUsersByName(name, pageable)
        return ResponseEntity.ok(users)
    }

    /**
     * Search users specifically by email
     * Example: GET /api/admin/users/search/email?email=gmail.com&page=0&size=20
     */
    @Operation(
        summary = "Search users by email",
        description = "Search users specifically by email (case-insensitive partial match). Useful for finding all users from a specific domain.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/search/email")
    fun searchUsersByEmail(
        @Parameter(description = "Email to search for", required = true)
        @RequestParam email: String,
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0") page: Int,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<UserResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "email"))
        val users = adminService.searchUsersByEmail(email, pageable)
        return ResponseEntity.ok(users)
    }

    /**
     * Search users specifically by phone number
     * Example: GET /api/admin/users/search/phone?phone=555-0123&page=0&size=20
     */
    @Operation(
        summary = "Search users by phone number",
        description = "Search users specifically by phone number (partial match). Useful for finding users by area code or phone pattern.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/search/phone")
    fun searchUsersByPhone(
        @Parameter(description = "Phone number to search for", required = true)
        @RequestParam phone: String,
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0") page: Int,
        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<UserResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"))
        val users = adminService.searchUsersByPhone(phone, pageable)
        return ResponseEntity.ok(users)
    }

    @Operation(
        summary = "Lock user account",
        description = "Lock a user account preventing them from accessing the system",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PatchMapping("/{id}/lock")
    fun lockUser(@PathVariable id: Long): ResponseEntity<UserResponse> {
        val updatedUser = adminService.setUserLockStatus(id, true)
        return ResponseEntity.ok(updatedUser)
    }

    @Operation(
        summary = "Unlock user account",
        description = "Unlock a previously locked user account",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PatchMapping("/{id}/unlock")
    fun unlockUser(@PathVariable id: Long): ResponseEntity<UserResponse> {
        val updatedUser = adminService.setUserLockStatus(id, false)
        return ResponseEntity.ok(updatedUser)
    }
}