package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.*
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.mapper.ReportMapper
import com.cs2.volunteer_hub.model.Report
import com.cs2.volunteer_hub.model.ReportStatus
import com.cs2.volunteer_hub.model.ReportType
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.*
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class ReportService(
    private val reportRepository: ReportRepository,
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val userRepository: UserRepository,
    private val reportMapper: ReportMapper,
    private val notificationService: NotificationService
) {
    private val logger = LoggerFactory.getLogger(ReportService::class.java)

    @Transactional
    fun createReport(reportRequest: ReportRequest, reporterEmail: String): ReportResponse {
        val reporter = userRepository.findByEmailOrThrow(reporterEmail)

        when (reportRequest.type) {
            ReportType.POST -> {
                if (!postRepository.existsById(reportRequest.targetId)) {
                    throw BadRequestException("Post with id ${reportRequest.targetId} not found")
                }
            }
            ReportType.COMMENT -> {
                if (!commentRepository.existsById(reportRequest.targetId)) {
                    throw BadRequestException("Comment with id ${reportRequest.targetId} not found")
                }
            }
        }

        if (reportRepository.existsByReporterAndTypeAndTarget(
                reporter.id,
                reportRequest.type,
                reportRequest.targetId
            )
        ) {
            throw BadRequestException("You have already reported this ${reportRequest.type.name.lowercase()}")
        }

        val report = Report(
            type = reportRequest.type,
            targetId = reportRequest.targetId,
            reason = reportRequest.reason,
            description = reportRequest.description,
            reporter = reporter,
            status = ReportStatus.PENDING
        )

        val savedReport = reportRepository.save(report)
        logger.info("Report created: id=${savedReport.id}, type=${savedReport.type}, targetId=${savedReport.targetId}, reporter=${reporterEmail}")

        notifyAdminsAboutNewReport(savedReport)

        return reportMapper.toReportResponse(savedReport)
    }

    @Transactional(readOnly = true)
    fun getMyReports(userEmail: String): List<ReportResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(user.id)
            .map(reportMapper::toReportResponse)
    }

    @Transactional(readOnly = true)
    fun getAllReports(
        status: ReportStatus?,
        page: Int = 0,
        size: Int = 20
    ): List<ReportResponse> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))

        val reports = if (status != null) {
            reportRepository.findByStatusOrderByCreatedAtDesc(status)
                .drop(page * size)
                .take(size)
        } else {
            reportRepository.findAll(pageable).content
        }

        return reports.map(reportMapper::toReportResponse)
    }

    @Transactional(readOnly = true)
    fun getReportById(reportId: Long): ReportResponse {
        val report = reportRepository.findByIdOrThrow(reportId)
        return reportMapper.toReportResponse(report)
    }

    @Transactional(readOnly = true)
    fun getReportsForTarget(type: ReportType, targetId: Long): List<ReportResponse> {
        return reportRepository.findByTypeAndTargetId(type, targetId)
            .map(reportMapper::toReportResponse)
    }

    @Transactional
    fun reviewReport(
        reportId: Long,
        reviewRequest: ReviewReportRequest,
        reviewerEmail: String
    ): ReportResponse {
        val report = reportRepository.findByIdOrThrow(reportId)
        val reviewer = userRepository.findByEmailOrThrow(reviewerEmail)

        if (report.status == ReportStatus.RESOLVED || report.status == ReportStatus.DISMISSED) {
            throw BadRequestException("Cannot review a report that is already ${report.status.name.lowercase()}")
        }

        report.status = reviewRequest.status
        report.reviewedBy = reviewer
        report.reviewNote = reviewRequest.reviewNote
        report.reviewedAt = LocalDateTime.now()

        val updatedReport = reportRepository.save(report)
        logger.info("Report reviewed: id=${reportId}, newStatus=${reviewRequest.status}, reviewer=${reviewerEmail}")

        notifyReporterAboutReview(updatedReport)

        return reportMapper.toReportResponse(updatedReport)
    }

    @Transactional(readOnly = true)
    fun getReportStats(): ReportStatsResponse {
        val allReports = reportRepository.findAll()

        return ReportStatsResponse(
            totalReports = allReports.size.toLong(),
            pendingReports = allReports.count { it.status == ReportStatus.PENDING }.toLong(),
            underReviewReports = allReports.count { it.status == ReportStatus.UNDER_REVIEW }.toLong(),
            resolvedReports = allReports.count { it.status == ReportStatus.RESOLVED }.toLong(),
            dismissedReports = allReports.count { it.status == ReportStatus.DISMISSED }.toLong()
        )
    }

    private fun notifyAdminsAboutNewReport(report: Report) {
        try {
            val admins = userRepository.findAll().filter { it.role == Role.ADMIN }
            admins.forEach { admin ->
                notificationService.queuePushNotificationToUser(
                    userId = admin.id,
                    title = "New Report Submitted",
                    body = "A new ${report.type.name.lowercase()} report has been submitted for review (ID: ${report.targetId})",
                    link = "/admin/reports/${report.id}"
                )
            }
        } catch (e: Exception) {
            logger.error("Failed to notify admins about report ${report.id}", e)
        }
    }

    private fun notifyReporterAboutReview(report: Report) {
        try {
            val statusMessage = when (report.status) {
                ReportStatus.RESOLVED -> "Your report has been reviewed and action has been taken."
                ReportStatus.DISMISSED -> "Your report has been reviewed and dismissed."
                ReportStatus.UNDER_REVIEW -> "Your report is now under review."
                else -> "Your report status has been updated."
            }

            notificationService.queuePushNotificationToUser(
                userId = report.reporter.id,
                title = "Report Status Update",
                body = statusMessage,
                link = "/reports/${report.id}"
            )
        } catch (e: Exception) {
            logger.error("Failed to notify reporter about review for report ${report.id}", e)
        }
    }
}
