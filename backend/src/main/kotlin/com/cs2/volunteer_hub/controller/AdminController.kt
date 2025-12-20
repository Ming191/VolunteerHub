package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.service.AdminService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
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

    /**
     * Get all pending events awaiting approval
     * Uses Specification Pattern for flexible querying
     */
    @GetMapping("/events/pending")
    fun getPendingEvents(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<EventResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val pendingEvents = adminService.getPendingEvents(pageable)
        return ResponseEntity.ok(pendingEvents)
    }

    /**
     * Search all events by text (title, description, or location)
     * Example: GET /api/admin/events/search?q=volunteer
     */
    @GetMapping("/events/search")
    fun searchAllEvents(
        @RequestParam q: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<EventResponse>> {
        val trimmed = q.trim()
        if (trimmed.isEmpty()) {
            return ResponseEntity.badRequest().build()
        }
        if (trimmed.length > 100) {
            return ResponseEntity.badRequest().build()
        }
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "eventDateTime"))
        val events = adminService.searchAllEvents(trimmed, pageable)
        return ResponseEntity.ok(events)
    }

    /**
     * Get past events for historical records and reporting
     * Example: GET /api/admin/events/past
     */
    @GetMapping("/events/past")
    fun getPastEvents(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<EventResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "eventDateTime"))
        val events = adminService.getPastEvents(pageable)
        return ResponseEntity.ok(events)
    }

    /**
     * Get upcoming published events
     * Example: GET /api/admin/events/upcoming
     */
    @GetMapping("/events/upcoming")
    fun getUpcomingEvents(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<EventResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "eventDateTime"))
        val events = adminService.getUpcomingEvents(pageable)
        return ResponseEntity.ok(events)
    }

    /**
     * Get events currently in progress (started but not ended)
     * Example: GET /api/admin/events/in-progress
     */
    @GetMapping("/events/in-progress")
    fun getInProgressEvents(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<EventResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "eventDateTime"))
        val events = adminService.getInProgressEvents(pageable)
        return ResponseEntity.ok(events)
    }

    /**
     * Get events currently accepting registrations
     * Example: GET /api/admin/events/accepting-registrations
     */
    @GetMapping("/events/accepting-registrations")
    fun getEventsAcceptingRegistrations(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<EventResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "eventDateTime"))
        val events = adminService.getEventsAcceptingRegistrations(pageable)
        return ResponseEntity.ok(events)
    }

    /**
     * Get all active (non-cancelled) events by a specific creator/organizer
     * Useful for viewing an organizer's event portfolio
     * Example: GET /api/admin/users/123/events
     */
    @GetMapping("/users/{userId}/events")
    fun getActiveEventsByCreator(
        @PathVariable userId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<EventResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val events = adminService.getActiveEventsByCreator(userId, pageable)
        return ResponseEntity.ok(events)
    }
}
