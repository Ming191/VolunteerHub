package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.RefreshToken
import com.cs2.volunteer_hub.model.User
import java.time.LocalDateTime
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.repository.query.Param
import jakarta.persistence.LockModeType
import org.springframework.stereotype.Repository

@Repository
interface RefreshTokenRepository : JpaRepository<RefreshToken, Long> {
    fun findByToken(token: String): RefreshToken?

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.token = :token")
    fun findByTokenForUpdate(@Param("token") token: String): RefreshToken?

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revokedAt = :revokedAt WHERE rt.familyId = :familyId AND rt.revokedAt IS NULL")
    fun revokeFamily(@Param("familyId") familyId: String, @Param("revokedAt") revokedAt: LocalDateTime)

    fun findAllByUserAndRevokedAtIsNullOrderByCreatedAtDesc(user: User): List<RefreshToken>

    fun findByUserAndIpAddressAndUserAgentAndRevokedAtIsNull(
            user: User,
            ipAddress: String?,
            userAgent: String?
    ): List<RefreshToken>

    @Modifying(clearAutomatically = true)
    @Query(
            "UPDATE RefreshToken rt SET rt.revokedAt = :revokedAt WHERE rt.user = :user AND rt.revokedAt IS NULL"
    )
    fun revokeAllUserTokens(user: User, revokedAt: LocalDateTime = LocalDateTime.now())

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :date")
    fun deleteExpiredTokens(date: LocalDateTime = LocalDateTime.now())
}
