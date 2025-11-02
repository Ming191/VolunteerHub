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
        Index(name = "idx_events_creator_id", columnList = "creator_id"),
        Index(name = "idx_events_created_at", columnList = "created_at"),
        Index(name = "idx_events_status", columnList = "status"),
        Index(name = "idx_events_category", columnList = "category"),
        Index(name = "idx_events_status_datetime", columnList = "status, event_date_time"),
        Index(name = "idx_events_status_creator", columnList = "status, creator_id")
    ]
)
data class Event(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    var title: String,

    @Column(length = 1000)
    var description: String,

    var location: String,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var eventDateTime: LocalDateTime,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var eventEndDateTime: LocalDateTime? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: EventStatus = EventStatus.PENDING,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var category: EventCategory = EventCategory.OTHER,

    var maxVolunteers: Int? = null,
    var minVolunteers: Int? = null,

    @field:JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var registrationDeadline: LocalDateTime? = null,

    // Additional metadata
    @Column(length = 500)
    var requirements: String? = null,

    @Column(length = 500)
    var benefits: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonBackReference
    val creator: User,

    @OneToMany(mappedBy = "event", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("event-images")
    val images: MutableList<Image> = mutableListOf(),

    @OneToMany(mappedBy = "event", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("event-registrations")
    val registrations: MutableList<Registration> = mutableListOf(),

    @Column(nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Version
    var version: Long = 0
) {
    @PrePersist
    fun prePersist() {
        if (createdAt.year == 1970) {
            createdAt = LocalDateTime.now()
        }
    }

    fun isRegistrationOpen(): Boolean {
        if (status != EventStatus.APPROVED) return false

        val now = LocalDateTime.now()

        registrationDeadline?.let {
            if (now.isAfter(it)) return false
        }

        if (now.isAfter(eventDateTime)) return false

        // Check if max capacity reached
        maxVolunteers?.let {
            val approvedCount = registrations.count { reg -> reg.status == RegistrationStatus.APPROVED }
            if (approvedCount >= it) return false
        }

        return true
    }

    fun getApprovedRegistrationCount(): Int {
        return registrations.count { it.status == RegistrationStatus.APPROVED }
    }

    fun hasAvailableSlots(): Boolean {
        maxVolunteers?.let {
            return getApprovedRegistrationCount() < it
        }
        return true
    }

    fun getContactEmail(): String = creator.email

    fun getContactPhone(): String? = creator.phone
}
