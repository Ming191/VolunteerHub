package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.SystemMetricsResponse
import com.cs2.volunteer_hub.service.MetricsService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Controller for system metrics (admin only)
 */
@RestController
@RequestMapping("/api/admin/metrics")
@Tag(name = "Admin Metrics", description = "System metrics endpoints for administrators")
class AdminMetricsController(
    private val metricsService: MetricsService
) {

    @Operation(
        summary = "Get system metrics",
        description = "Retrieve comprehensive system metrics including request stats, system health, and API performance"
    )
    @GetMapping("/system")
    @PreAuthorize("hasRole('ADMIN')")
    fun getSystemMetrics(): ResponseEntity<SystemMetricsResponse> {
        val metrics = metricsService.getSystemMetrics()
        return ResponseEntity.ok(metrics)
    }
}
