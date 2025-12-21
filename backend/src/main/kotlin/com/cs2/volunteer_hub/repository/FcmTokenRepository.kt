package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.FcmToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface FcmTokenRepository : JpaRepository<FcmToken, Long> {
    fun findAllByUserId(userId: Long): List<FcmToken>
    fun findByToken(token: String): FcmToken?
    fun deleteAllByUserId(userId: Long)
    
    /**
     * Find stale tokens older than the specified date
     * PERFORMANCE: Filters in database instead of loading all tokens
     */
    @Query("SELECT f FROM FcmToken f WHERE f.createdAt < :cutoffDate")
    fun findStaleTokens(@Param("cutoffDate") cutoffDate: LocalDateTime): List<FcmToken>
}