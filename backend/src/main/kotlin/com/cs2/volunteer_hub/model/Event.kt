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
        Index(name = "idx_events_approved_datetime", columnList = "is_approved, event_date_time"),
        Index(name = "idx_events_creator_id", columnList = "creator_id"),
        Index(name = "idx_events_creator_approved", columnList = "creator_id, is_approved"),
        Index(name = "idx_events_created_at", columnList = "created_at")
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

    var isApproved: Boolean = false,

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
}

