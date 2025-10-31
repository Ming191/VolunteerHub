package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.VolunteerDashboardResponse
import com.cs2.volunteer_hub.service.DashboardService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(private val dashboardService: DashboardService) {

    @GetMapping("/volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    fun getVolunteerDashboard(
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<VolunteerDashboardResponse> {
        val dashboardData = dashboardService.getVolunteerDashboard(currentUser.username)
        return ResponseEntity.ok(dashboardData)
    }
}