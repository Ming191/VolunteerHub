package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Registration
import com.cs2.volunteer_hub.model.RegistrationStatus
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface RegistrationRepository : JpaRepository<Registration, Long> {
    fun existsByEventIdAndUserId(eventId: Long, userId: Long): Boolean
    fun findByEventIdAndUserId(eventId: Long, userId: Long): Optional<Registration>
    fun findAllByEventId(eventId: Long): List<Registration>
    fun findAllByUserEmailOrderByEventEventDateTimeDesc(email: String): List<Registration>
    fun findTop3ByUserIdAndStatusOrderByEventEventDateTimeAsc(userId: Long, status: RegistrationStatus): List<Registration>
    fun findAllByUserIdAndStatus(userId: Long, status: RegistrationStatus): List<Registration>

    @Query("""
        SELECT count(r.id) FROM Registration r 
        WHERE r.event.creator.id = :creatorId AND r.status = 'PENDING'
    """)
    fun countPendingRegistrationsByCreatorId(creatorId: Long): Long

    @Query("""
        SELECT r FROM Registration r 
        WHERE r.event.creator.id = :creatorId AND r.status = 'PENDING' 
        ORDER BY r.registeredAt DESC
    """)
    fun findRecentPendingRegistrationsByCreatorId(creatorId: Long, pageable: Pageable): List<Registration>
}