package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "reports",
    indexes = [
        Index(name = "idx_reports_status", columnList = "status"),
        Index(name = "idx_reports_type_target", columnList = "report_type, target_id"),
        Index(name = "idx_reports_reporter", columnList = "reporter_id"),
        Index(name = "idx_reports_created", columnList = "created_at")
    ]
)
data class Report(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 20)
    val type: ReportType,

    @Column(name = "target_id", nullable = false)
    val targetId: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    val reason: ReportReason,

    @Column(columnDefinition = "TEXT")
    val description: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    val reporter: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: ReportStatus = ReportStatus.PENDING,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    var reviewedBy: User? = null,

    @Column(columnDefinition = "TEXT")
    var reviewNote: String? = null,

    val createdAt: LocalDateTime = LocalDateTime.now(),

    var reviewedAt: LocalDateTime? = null
)
