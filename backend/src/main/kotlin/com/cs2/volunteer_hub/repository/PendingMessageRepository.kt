package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.PendingMessage
import com.cs2.volunteer_hub.model.PendingMessageStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface PendingMessageRepository : JpaRepository<PendingMessage, Long> {
    
    fun findByStatus(status: PendingMessageStatus): List<PendingMessage>
    
    @Query("""
        SELECT pm FROM PendingMessage pm 
        WHERE pm.status = :status 
        AND (pm.nextRetryAt IS NULL OR pm.nextRetryAt <= :now)
        AND pm.retryCount < pm.maxRetries
        ORDER BY pm.createdAt ASC
    """)
    fun findMessagesReadyForRetry(
        @Param("status") status: PendingMessageStatus,
        @Param("now") now: LocalDateTime
    ): List<PendingMessage>
    
    @Query("""
        SELECT pm FROM PendingMessage pm 
        WHERE pm.status IN ('SENT', 'EXPIRED', 'FAILED')
        AND pm.createdAt < :cutoffDate
    """)
    fun findOldCompletedMessages(@Param("cutoffDate") cutoffDate: LocalDateTime): List<PendingMessage>
    
    fun countByStatus(status: PendingMessageStatus): Long
}
