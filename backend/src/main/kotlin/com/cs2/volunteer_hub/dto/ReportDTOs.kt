package com.cs2.volunteer_hub.dto

import com.cs2.volunteer_hub.model.ReportReason
import com.cs2.volunteer_hub.model.ReportStatus
import com.cs2.volunteer_hub.model.ReportType
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class ReportRequest(
        @field:NotNull(message = "Report type is required") val type: ReportType,
        @field:NotNull(message = "Target ID is required") val targetId: Long,
        @field:NotNull(message = "Reason is required") val reason: ReportReason,
        @field:Size(max = 1000, message = "Description must not exceed 1000 characters")
        val description: String? = null
)

data class ReportResponse(
        val id: Long,
        val type: ReportType,
        val targetId: Long,
        val reason: ReportReason,
        val description: String?,
        val reporter: ReporterInfo,
        val status: ReportStatus,
        val reviewedBy: ReviewerInfo?,
        val reviewNote: String?,
        val createdAt: LocalDateTime,
        val reviewedAt: LocalDateTime?
)

data class ReporterInfo(val id: Long, val name: String, val email: String)

data class ReviewerInfo(val id: Long, val name: String, val email: String)

data class ReviewReportRequest(
        @field:NotNull(message = "Status is required") val status: ReportStatus,
        @field:Size(max = 1000, message = "Review note must not exceed 1000 characters")
        val reviewNote: String? = null,
        val deleteContent: Boolean = false
)

data class ReportStatsResponse(
        val totalReports: Long,
        val pendingReports: Long,
        val underReviewReports: Long,
        val resolvedReports: Long,
        val dismissedReports: Long
)
