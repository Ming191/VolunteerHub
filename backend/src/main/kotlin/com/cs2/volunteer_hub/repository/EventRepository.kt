package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.dto.DashboardTrendingEventItem
import com.cs2.volunteer_hub.model.Event
import jakarta.persistence.LockModeType
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional

@Repository
interface EventRepository : JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    @Query("""
        SELECT new com.cs2.volunteer_hub.dto.DashboardTrendingEventItem(
            e.id, e.title, e.eventDateTime, e.location, COUNT(r.id)
        )
        FROM Event e JOIN e.registrations r 
        WHERE e.status = 'PUBLISHED' AND r.registeredAt > :since
        GROUP BY e.id, e.title, e.eventDateTime, e.location
        ORDER BY COUNT(r.id) DESC
    """)
    fun findTrendingEvents(since: LocalDateTime, pageable: Pageable): List<DashboardTrendingEventItem>

    @Query("""
        SELECT e FROM Event e LEFT JOIN e.registrations r 
        WHERE e.creator.id = :creatorId 
        GROUP BY e.id 
        ORDER BY COUNT(r.id) DESC
    """)
    fun findTop3EventsByRegistrations(creatorId: Long, pageable: Pageable): List<Event>

    /**
     * Get count of approved registrations for an event
     * Optimized query to avoid loading all registrations
     */
    @Query("""
        SELECT COUNT(r) FROM Registration r 
        WHERE r.event.id = :eventId AND r.status = 'APPROVED'
    """)
    fun countApprovedRegistrations(@Param("eventId") eventId: Long): Int

    /**
     * Get count of waitlisted registrations for an event
     */
    @Query("""
        SELECT COUNT(r) FROM Registration r 
        WHERE r.event.id = :eventId AND r.status = 'WAITLISTED'
    """)
    fun countWaitlistedRegistrations(@Param("eventId") eventId: Long): Int

    /**
     * Get count of pending registrations for an event
     */
    @Query("""
        SELECT COUNT(r) FROM Registration r 
        WHERE r.event.id = :eventId AND r.status = 'PENDING'
    """)
    fun countPendingRegistrations(@Param("eventId") eventId: Long): Int

    /**
     * Find event with pessimistic write lock
     * Prevents concurrent modifications during registration
     * Use this when checking capacity to avoid race conditions
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :eventId")
    fun findByIdWithLock(@Param("eventId") eventId: Long): Optional<Event>

    /**
     * Batch get approved registration counts for multiple events
     * Returns map of eventId to count
     */
    @Query("""
        SELECT r.event.id as eventId, COUNT(r.id) as count
        FROM Registration r
        WHERE r.event.id IN :eventIds AND r.status = 'APPROVED'
        GROUP BY r.event.id
    """)
    fun countApprovedRegistrationsByEvents(@Param("eventIds") eventIds: List<Long>): List<Map<String, Any>>

    /**
     * Batch get waitlisted registration counts for multiple events
     * Returns map of eventId to count
     */
    @Query("""
        SELECT r.event.id as eventId, COUNT(r.id) as count
        FROM Registration r
        WHERE r.event.id IN :eventIds AND r.status = 'WAITLISTED'
        GROUP BY r.event.id
    """)
    fun countWaitlistedRegistrationsByEvents(@Param("eventIds") eventIds: List<Long>): List<Map<String, Any>>

    /**
     * Batch get pending registration counts for multiple events
     * Returns map of eventId to count
     */
    @Query("""
        SELECT r.event.id as eventId, COUNT(r.id) as count
        FROM Registration r
        WHERE r.event.id IN :eventIds AND r.status = 'PENDING'
        GROUP BY r.event.id
    """)
    fun countPendingRegistrationsByEvents(@Param("eventIds") eventIds: List<Long>): List<Map<String, Any>>
}