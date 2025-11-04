package com.cs2.volunteer_hub.model

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "registrations",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "event_id"])],
    indexes = [
        Index(name = "idx_registrations_status", columnList = "status"),
        Index(name = "idx_registrations_event_status", columnList = "event_id, status"),
        Index(name = "idx_registrations_user_status", columnList = "user_id, status"),
        Index(name = "idx_registrations_registered_at", columnList = "registered_at"),
        Index(name = "idx_registrations_waitlist", columnList = "event_id, status, waitlist_position")
    ]
)
data class Registration(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonBackReference("event-registrations")
    val event: Event,

    @Enumerated(EnumType.STRING)
    var status: RegistrationStatus = RegistrationStatus.PENDING,

    val registeredAt: LocalDateTime = LocalDateTime.now(),

    /**
     * Position in waitlist queue (1 = first in line)
     * null = not on waitlist
     */
    var waitlistPosition: Int? = null
)
