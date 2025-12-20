package com.cs2.volunteer_hub.specification

import com.cs2.volunteer_hub.model.Report
import com.cs2.volunteer_hub.model.ReportStatus
import org.springframework.data.jpa.domain.Specification

object ReportSpecifications {
    
    fun byReporterId(reporterId: Long): Specification<Report> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<Long>("reporter").get<Long>("id"), reporterId)
        }
    }
    
    fun byStatus(status: ReportStatus): Specification<Report> {
        return Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(root.get<ReportStatus>("status"), status)
        }
    }
}
