package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.*
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.mapper.ReportMapper
import com.cs2.volunteer_hub.model.Report
import com.cs2.volunteer_hub.model.ReportStatus
import com.cs2.volunteer_hub.model.ReportType
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.*
import com.cs2.volunteer_hub.specification.ReportSpecifications
import com.cs2.volunteer_hub.specification.UserSpecifications
import java.time.LocalDateTime
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ReportService(
        private val reportRepository: ReportRepository,
        private val postRepository: PostRepository,
        private val commentRepository: CommentRepository,
        private val userRepository: UserRepository,
        private val reportMapper: ReportMapper,
        private val notificationService: NotificationService,
        @org.springframework.context.annotation.Lazy private val postService: PostService,
        @org.springframework.context.annotation.Lazy private val commentService: CommentService
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
            throw BadRequestException(
                    "You have already reported this ${reportRequest.type.name.lowercase()}"
            )
        }

        val report =
                Report(
                        type = reportRequest.type,
                        targetId = reportRequest.targetId,
                        reason = reportRequest.reason,
                        description = reportRequest.description,
                        reporter = reporter,
                        status = ReportStatus.PENDING
                )

        val savedReport = reportRepository.save(report)
        logger.info(
                "Report created: id=${savedReport.id}, type=${savedReport.type}, targetId=${savedReport.targetId}, reporter=${reporterEmail}"
        )

        notifyAdminsAboutNewReport(savedReport)

        return reportMapper.toReportResponse(savedReport)
    }

    @Transactional(readOnly = true)
    fun getMyReports(userEmail: String, pageable: Pageable): Page<ReportResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val spec = ReportSpecifications.byReporterId(user.id)
        return reportRepository.findAll(spec, pageable).map(reportMapper::toReportResponse)
    }

    @Transactional(readOnly = true)
    fun getAllReports(status: ReportStatus?, page: Int = 0, size: Int = 20): List<ReportResponse> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))

        val reports = if (status != null) {
            val spec = ReportSpecifications.byStatus(status)
            reportRepository.findAll(spec, pageable).content
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
        return reportRepository
                .findByTypeAndTargetId(type, targetId)
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
            throw BadRequestException(
                    "Cannot review a report that is already ${report.status.name.lowercase()}"
            )
        }

        report.status = reviewRequest.status
        report.reviewedBy = reviewer
        report.reviewNote = reviewRequest.reviewNote
        report.reviewedAt = LocalDateTime.now()

        if (reviewRequest.deleteContent && reviewRequest.status == ReportStatus.RESOLVED) {
            try {
                var contentAuthor: com.cs2.volunteer_hub.model.User? = null

                // Fetch author before deletion
                when (report.type) {
                    ReportType.POST -> {
                        contentAuthor =
                                postRepository.findById(report.targetId).orElse(null)?.author
                    }
                    ReportType.COMMENT -> {
                        contentAuthor =
                                commentRepository.findById(report.targetId).orElse(null)?.author
                    }
                }

                when (report.type) {
                    ReportType.POST -> {
                        postService.adminDeletePost(report.targetId)
                        report.reviewNote = "${report.reviewNote ?: ""} [CONTENT DELETED]"
                    }
                    ReportType.COMMENT -> {
                        commentService.adminDeleteComment(report.targetId)
                        report.reviewNote = "${report.reviewNote ?: ""} [CONTENT DELETED]"
                    }
                }

                // Notify author if found
                if (contentAuthor != null) {
                    notifyReportedUserAboutDeletion(contentAuthor, report)
                }
            } catch (e: Exception) {
                logger.error("Failed to delete content for report $reportId", e)
            }
        }

        val updatedReport = reportRepository.save(report)
        logger.info(
                "Report reviewed: id=${reportId}, newStatus=${reviewRequest.status}, reviewer=${reviewerEmail}"
        )

        notifyReporterAboutReview(updatedReport)

        return reportMapper.toReportResponse(updatedReport)
    }

    @Transactional(readOnly = true)
    fun getReportStats(): ReportStatsResponse {
        return ReportStatsResponse(
                totalReports = reportRepository.count(),
                pendingReports = reportRepository.countByStatus(ReportStatus.PENDING),
                underReviewReports = reportRepository.countByStatus(ReportStatus.UNDER_REVIEW),
                resolvedReports = reportRepository.countByStatus(ReportStatus.RESOLVED),
                dismissedReports = reportRepository.countByStatus(ReportStatus.DISMISSED)
        )
    }

    private fun notifyAdminsAboutNewReport(report: Report) {
        try {
            val spec = UserSpecifications.hasRole(Role.ADMIN)
            val admins = userRepository.findAll(spec)
            admins.forEach { admin ->
                notificationService.queuePushNotificationToUser(
                        userId = admin.id,
                        title = "New Report Submitted",
                        body =
                                "A new ${report.type.name.lowercase()} report has been submitted for review (ID: ${report.targetId})",
                        link = "/admin/reports/${report.id}"
                )
            }
        } catch (e: Exception) {
            logger.error("Failed to notify admins about report ${report.id}", e)
        }
    }

    private fun notifyReporterAboutReview(report: Report) {
        try {
            val statusMessage =
                    when (report.status) {
                        ReportStatus.RESOLVED ->
                                "Your report has been reviewed and action has been taken."
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
    private fun notifyReportedUserAboutDeletion(
            user: com.cs2.volunteer_hub.model.User,
            report: Report
    ) {
        try {
            notificationService.queuePushNotificationToUser(
                    userId = user.id,
                    title = "Content Removed",
                    body =
                            "Your ${report.type.name.lowercase()} has been removed due to a violation of our community guidelines (Reason: ${report.reason.name.lowercase().replace("_", " ")}).",
                    link = "/notifications"
            )
        } catch (e: Exception) {
            logger.error("Failed to notify reported user ${user.id} about deletion", e)
        }
    }
}
