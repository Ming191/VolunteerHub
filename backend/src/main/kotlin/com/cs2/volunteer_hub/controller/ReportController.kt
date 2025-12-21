package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.ReportRequest
import com.cs2.volunteer_hub.dto.ReportResponse
import com.cs2.volunteer_hub.service.ReportService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Reports", description = "Report management endpoints")
@SecurityRequirement(name = "bearerAuth")
class ReportController(private val reportService: ReportService) {

    @Operation(
        summary = "Submit a report",
        description = "Report a post or comment for inappropriate content"
    )
    @PostMapping(consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun submitReport(
        @Valid @RequestBody reportRequest: ReportRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<ReportResponse> {
        val report = reportService.createReport(reportRequest, currentUser.username)
        return ResponseEntity.status(HttpStatus.CREATED).body(report)
    }

    @Operation(
        summary = "Get my reports",
        description = "Retrieve all reports submitted by the current user"
    )
    @GetMapping(path = ["/my"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getMyReports(
        @AuthenticationPrincipal currentUser: UserDetails,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<ReportResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val reports = reportService.getMyReports(currentUser.username, pageable)
        return ResponseEntity.ok(reports)
    }

    @Operation(
        summary = "Get report by ID",
        description = "Retrieve details of a specific report"
    )
    @GetMapping(path = ["/{reportId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EVENT_ORGANIZER')")
    fun getReportById(
        @PathVariable reportId: Long
    ): ResponseEntity<ReportResponse> {
        val report = reportService.getReportById(reportId)
        return ResponseEntity.ok(report)
    }
}
