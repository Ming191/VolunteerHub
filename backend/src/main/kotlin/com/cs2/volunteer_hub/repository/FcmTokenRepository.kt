package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.FcmToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FcmTokenRepository : JpaRepository<FcmToken, Long> {
    fun findAllByUserId(userId: Long): List<FcmToken>
    fun findByToken(token: String): FcmToken?
    fun deleteAllByUserId(userId: Long)
}