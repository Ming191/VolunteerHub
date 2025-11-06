package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.ReportResponse
import com.cs2.volunteer_hub.dto.ReportStatsResponse
import com.cs2.volunteer_hub.dto.ReviewReportRequest
import com.cs2.volunteer_hub.model.ReportStatus
import com.cs2.volunteer_hub.model.ReportType
import com.cs2.volunteer_hub.service.ReportService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasAuthority('ADMIN')")
@Tag(name = "Admin - Reports", description = "Admin endpoints for managing reports")
@SecurityRequirement(name = "bearerAuth")
class AdminReportController(private val reportService: ReportService) {

    @Operation(
        summary = "Get all reports",
        description = "Retrieve all reports with optional status filter and pagination"
    )
    @GetMapping(produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getAllReports(
        @RequestParam(required = false) status: ReportStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<List<ReportResponse>> {
        val reports = reportService.getAllReports(status, page, size)
        return ResponseEntity.ok(reports)
    }

    @Operation(
        summary = "Get reports for specific target",
        description = "Retrieve all reports for a specific post or comment"
    )
    @GetMapping(path = ["/target"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getReportsForTarget(
        @RequestParam type: ReportType,
        @RequestParam targetId: Long
    ): ResponseEntity<List<ReportResponse>> {
        val reports = reportService.getReportsForTarget(type, targetId)
        return ResponseEntity.ok(reports)
    }

    @Operation(
        summary = "Review a report",
        description = "Update the status of a report and add review notes"
    )
    @PutMapping(path = ["/{reportId}/review"], consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun reviewReport(
        @PathVariable reportId: Long,
        @Valid @RequestBody reviewRequest: ReviewReportRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<ReportResponse> {
        val report = reportService.reviewReport(reportId, reviewRequest, currentUser.username)
        return ResponseEntity.ok(report)
    }

    @Operation(
        summary = "Get report statistics",
        description = "Retrieve statistics about all reports"
    )
    @GetMapping(path = ["/stats"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getReportStats(): ResponseEntity<ReportStatsResponse> {
        val stats = reportService.getReportStats()
        return ResponseEntity.ok(stats)
    }
}

