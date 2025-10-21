package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.service.AdminService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(private val adminService: AdminService) {
    @PatchMapping("/events/{id}/approve")
    fun approveEvent(@PathVariable id: Long): ResponseEntity<EventResponse> {
        val approvedEvent = adminService.approveEvent(id)
        return ResponseEntity.ok(approvedEvent)
    }

    @DeleteMapping("/events/{id}")
    fun deleteEventAsAdmin(@PathVariable id: Long): ResponseEntity<Unit> {
        adminService.deleteEventAsAdmin(id)
        return ResponseEntity.noContent().build()
    }
}