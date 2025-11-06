package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.ReportResponse
import com.cs2.volunteer_hub.dto.ReporterInfo
import com.cs2.volunteer_hub.dto.ReviewerInfo
import com.cs2.volunteer_hub.model.Report
import org.springframework.stereotype.Component

@Component
class ReportMapper {
    fun toReportResponse(report: Report): ReportResponse {
        return ReportResponse(
            id = report.id,
            type = report.type,
            targetId = report.targetId,
            reason = report.reason,
            description = report.description,
            reporter = ReporterInfo(
                id = report.reporter.id,
                name = report.reporter.name,
                email = report.reporter.email
            ),
            status = report.status,
            reviewedBy = report.reviewedBy?.let {
                ReviewerInfo(
                    id = it.id,
                    name = it.name,
                    email = it.email
                )
            },
            reviewNote = report.reviewNote,
            createdAt = report.createdAt,
            reviewedAt = report.reviewedAt
        )
    }
}

