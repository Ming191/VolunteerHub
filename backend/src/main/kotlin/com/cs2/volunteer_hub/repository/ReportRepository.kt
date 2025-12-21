package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Report
import com.cs2.volunteer_hub.model.ReportStatus
import com.cs2.volunteer_hub.model.ReportType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ReportRepository : JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {

    fun findByReporterIdOrderByCreatedAtDesc(reporterId: Long): List<Report>

    fun findByStatusOrderByCreatedAtDesc(status: ReportStatus): List<Report>

    fun findByTypeAndTargetId(type: ReportType, targetId: Long): List<Report>

    fun countByStatus(status: ReportStatus): Long

    @Query("""
        SELECT COUNT(r) > 0 FROM Report r 
        WHERE r.reporter.id = :reporterId 
        AND r.type = :type 
        AND r.targetId = :targetId
    """)
    fun existsByReporterAndTypeAndTarget(reporterId: Long, type: ReportType, targetId: Long): Boolean

}



