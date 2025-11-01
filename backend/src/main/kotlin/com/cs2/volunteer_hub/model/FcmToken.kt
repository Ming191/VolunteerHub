package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "fcm_tokens")
data class FcmToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 512)
    val token: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    val createdAt: LocalDateTime = LocalDateTime.now()
)