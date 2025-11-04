package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "email_verification_tokens",
    indexes = [
        Index(name = "idx_verification_token", columnList = "token", unique = true),
        Index(name = "idx_verification_user_id", columnList = "user_id"),
        Index(name = "idx_verification_expires_at", columnList = "expires_at")
    ]
)
data class EmailVerificationToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val token: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false)
    val expiresAt: LocalDateTime,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    var verifiedAt: LocalDateTime? = null
)

