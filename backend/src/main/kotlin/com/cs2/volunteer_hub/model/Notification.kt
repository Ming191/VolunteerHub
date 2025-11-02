package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "notifications",
    indexes = [
        Index(name = "idx_notifications_recipient_read", columnList = "recipient_id, is_read"),
        Index(name = "idx_notifications_created_at", columnList = "created_at")
    ]
)
data class Notification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    val recipient: User,

    @Column(nullable = false, length = 512)
    var content: String,

    @Column(length = 512)
    var link: String? = null,

    var isRead: Boolean = false,

    val createdAt: LocalDateTime = LocalDateTime.now()
)