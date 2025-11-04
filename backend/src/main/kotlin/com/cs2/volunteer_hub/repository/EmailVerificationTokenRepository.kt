package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.EmailVerificationToken
import com.cs2.volunteer_hub.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface EmailVerificationTokenRepository : JpaRepository<EmailVerificationToken, Long> {
    fun findByToken(token: String): EmailVerificationToken?

    fun findByUser(user: User): EmailVerificationToken?

    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now")
    fun deleteExpiredTokens(now: LocalDateTime): Int

    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.user = :user")
    fun deleteByUser(user: User): Int
}

