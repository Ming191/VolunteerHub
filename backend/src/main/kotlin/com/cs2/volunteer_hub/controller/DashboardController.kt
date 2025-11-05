package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.AdminDashboardResponse
import com.cs2.volunteer_hub.dto.OrganizerDashboardResponse
import com.cs2.volunteer_hub.dto.VolunteerDashboardResponse
import com.cs2.volunteer_hub.service.DashboardService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard endpoints for different user roles")
class DashboardController(private val dashboardService: DashboardService) {
    @Operation(summary = "Get volunteer dashboard", description = "Retrieve dashboard data for volunteers")
    @GetMapping("/volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    fun getVolunteerDashboard(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<VolunteerDashboardResponse> {
        val dashboardData = dashboardService.getVolunteerDashboard(currentUser.username)
        return ResponseEntity.ok(dashboardData)
    }

    @Operation(summary = "Get organizer dashboard", description = "Retrieve dashboard data for event organizers")
    @GetMapping("/organizer")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun getOrganizerDashboard(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<OrganizerDashboardResponse> {
        val dashboardData = dashboardService.getOrganizerDashboard(currentUser.username)
        return ResponseEntity.ok(dashboardData)
    }

    @Operation(summary = "Get admin dashboard", description = "Retrieve dashboard data for administrators")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    fun getAdminDashboard(): ResponseEntity<AdminDashboardResponse> {
        val dashboardData = dashboardService.getAdminDashboard()
        return ResponseEntity.ok(dashboardData)
    }

    @Operation(
        summary = "Get events accepting registrations",
        description = "Retrieve all events currently open for registration (published, not started, registration deadline not passed)"
    )
    @GetMapping("/events/accepting-registrations")
    fun getEventsAcceptingRegistrations(): ResponseEntity<List<Any>> {
        val events = dashboardService.getEventsAcceptingRegistrations()
        return ResponseEntity.ok(events)
    }

    @Operation(
        summary = "Get in-progress events",
        description = "Retrieve all events currently in progress (started but not yet ended)"
    )
    @GetMapping("/events/in-progress")
    fun getInProgressEvents(): ResponseEntity<List<Any>> {
        val events = dashboardService.getInProgressEventsForDashboard()
        return ResponseEntity.ok(events)
    }
}