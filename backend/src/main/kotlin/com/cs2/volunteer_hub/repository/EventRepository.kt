package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.dto.DashboardTrendingEventItem
import com.cs2.volunteer_hub.model.Event
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface EventRepository : JpaRepository<Event, Long> {
    fun findAllByIsApprovedTrueOrderByEventDateTimeAsc(): List<Event>

    fun findTop5ByIsApprovedTrueOrderByCreatedAtDesc(): List<Event>

    @Query("""
        SELECT new com.cs2.volunteer_hub.dto.DashboardTrendingEventItem(
            e.id, e.title, e.eventDateTime, e.location, COUNT(r.id)
        )
        FROM Event e JOIN e.registrations r 
        WHERE e.isApproved = true AND r.registeredAt > :since
        GROUP BY e.id, e.title, e.eventDateTime, e.location
        ORDER BY COUNT(r.id) DESC
    """)
    fun findTrendingEvents(since: LocalDateTime, pageable: Pageable): List<DashboardTrendingEventItem>

    fun countByCreatorIdAndIsApprovedFalse(creatorId: Long): Long

    fun findByCreatorIdAndIsApprovedFalse(creatorId: Long): List<Event>

    @Query("""
        SELECT e FROM Event e LEFT JOIN e.registrations r 
        WHERE e.creator.id = :creatorId 
        GROUP BY e.id 
        ORDER BY COUNT(r.id) DESC
    """)
    fun findTop3EventsByRegistrations(creatorId: Long, pageable: Pageable): List<Event>

    fun findByIsApprovedFalse(): List<Event>
}