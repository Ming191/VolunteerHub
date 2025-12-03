package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "pending_messages",
    indexes = [
        Index(name = "idx_pending_messages_status", columnList = "status"),
        Index(name = "idx_pending_messages_created", columnList = "created_at"),
        Index(name = "idx_pending_messages_retry", columnList = "status, next_retry_at")
    ]
)
data class PendingMessage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    val exchange: String,

    @Column(nullable = false, length = 100)
    val routingKey: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    val messagePayload: String,

    @Column(nullable = false, length = 50)
    val messageType: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: PendingMessageStatus = PendingMessageStatus.PENDING,

    @Column(nullable = false)
    var retryCount: Int = 0,

    @Column(nullable = false)
    val maxRetries: Int = 5,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    var nextRetryAt: LocalDateTime? = null,

    var processedAt: LocalDateTime? = null,

    @Column(columnDefinition = "TEXT")
    var errorMessage: String? = null
)

enum class PendingMessageStatus {
    PENDING,
    PROCESSING,
    SENT,
    FAILED,
    EXPIRED
}
