package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "refresh_tokens",
    indexes = [
        Index(name = "idx_refresh_tokens_token", columnList = "token", unique = true),
        Index(name = "idx_refresh_tokens_user_id", columnList = "user_id"),
        Index(name = "idx_refresh_tokens_expires_at", columnList = "expires_at")
    ]
)
data class RefreshToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 500)
    var token: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false)
    val expiresAt: LocalDateTime,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    var revokedAt: LocalDateTime? = null,

    @Column(length = 500)
    var replacedByToken: String? = null,

    /**
     * IP address from which the token was created
     */
    @Column(length = 50)
    var ipAddress: String? = null,

    /**
     * User agent (browser/device info)
     */
    @Column(length = 500)
    var userAgent: String? = null
) {
    val isExpired: Boolean
        get() = LocalDateTime.now().isAfter(expiresAt)

    val isRevoked: Boolean
        get() = revokedAt != null
}

