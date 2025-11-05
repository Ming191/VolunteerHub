package com.cs2.volunteer_hub.model

import com.fasterxml.jackson.annotation.JsonBackReference
import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "events",
    indexes = [
        Index(name = "idx_events_status_datetime", columnList = "status, event_date_time"),
        Index(name = "idx_events_creator_id", columnList = "creator_id"),
        Index(name = "idx_events_creator_status", columnList = "creator_id, status"),
        Index(name = "idx_events_created_at", columnList = "created_at"),
        Index(name = "idx_events_end_datetime", columnList = "end_date_time"),
        Index(name = "idx_events_location", columnList = "location")
    ]
)
data class Event(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    var title: String,

    @Column(length = 3000)
    var description: String,

    @Column(length = 500)
    var location: String,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var eventDateTime: LocalDateTime,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var endDateTime: LocalDateTime,

    /**
     * Deadline for registrations (null = can register until event starts)
     */
    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var registrationDeadline: LocalDateTime? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: EventStatus = EventStatus.PENDING,

    /**
     * Maximum number of participants allowed for this event
     * null = unlimited capacity
     */
    var maxParticipants: Int? = null,

    /**
     * Whether waitlist is enabled when event reaches capacity
     * If false, registrations are rejected when full
     */
    var waitlistEnabled: Boolean = true,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonBackReference
    val creator: User,

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "event_tags",
        joinColumns = [JoinColumn(name = "event_id")],
        indexes = [Index(name = "idx_event_tags_tag", columnList = "tag")]
    )
    @Column(name = "tag")
    @Enumerated(EnumType.STRING)
    var tags: MutableSet<EventTag> = mutableSetOf(),

    @OneToMany(mappedBy = "event", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("event-images")
    val images: MutableList<Image> = mutableListOf(),

    @OneToMany(mappedBy = "event", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("event-registrations")
    val registrations: MutableList<Registration> = mutableListOf(),

    @Column(nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    /**
     * Reason provided by admin when rejecting event
     */
    @Column(length = 500)
    var rejectionReason: String? = null,

    /**
     * Timestamp when event was cancelled
     */
    var cancelledAt: LocalDateTime? = null,

    /**
     * Reason for event cancellation
     */
    @Column(length = 500)
    var cancelReason: String? = null,

    @Version
    var version: Long = 0
) {
    @PrePersist
    fun prePersist() {
        if (createdAt.year == 1970) {
            createdAt = LocalDateTime.now()
        }
        updatedAt = LocalDateTime.now()
    }

    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }

    /**
     * Check if event can accept registrations
     * Considers event status, registration deadline, and whether event has started
     */
    fun isRegistrationOpen(): Boolean {
        if (status != EventStatus.PUBLISHED) return false
        if (eventDateTime.isBefore(LocalDateTime.now())) return false

        val deadline = registrationDeadline ?: eventDateTime
        return LocalDateTime.now().isBefore(deadline)
    }

    /**
     * Check if event has ended
     */
    fun isPast(): Boolean {
        return endDateTime.isBefore(LocalDateTime.now())
    }

    /**
     * Check if event is currently in progress
     */
    fun isInProgress(): Boolean {
        val now = LocalDateTime.now()
        return status == EventStatus.PUBLISHED &&
                eventDateTime.isBefore(now) &&
                endDateTime.isAfter(now)
    }

    /**
     * Check if event is approved/published
     */
    val isApproved: Boolean
        get() = status == EventStatus.PUBLISHED
}
