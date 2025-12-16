package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "users",
    indexes = [
        Index(name = "idx_users_email", columnList = "email", unique = true),
        Index(name = "idx_users_role", columnList = "role"),
        Index(name = "idx_users_email_verified", columnList = "is_email_verified"),
        Index(name = "idx_users_is_deleted", columnList = "is_deleted")
    ]
)
data class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long = 0,
    var name: String,
    @Enumerated(EnumType.STRING) @Column(length = 20) var gender: Gender? = null,
    @Column(unique = true) var email: String,
    var passwordHash: String,
    @Enumerated(EnumType.STRING) var role: Role = Role.VOLUNTEER,
    var isLocked: Boolean = false,
    var isEmailVerified: Boolean = false,
    @Column(nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),
    var lastLoginAt: LocalDateTime? = null,

    // Soft delete fields
    @Column(nullable = false) var isDeleted: Boolean = false,
    var deletedAt: LocalDateTime? = null,

    // Enhanced Profile Fields
    @Column(length = 20) var phoneNumber: String? = null,
    @Column(length = 500) var bio: String? = null,
    @Column(length = 100) var location: String? = null,
    var profilePictureUrl: String? = null,
    var dateOfBirth: LocalDate? = null,
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_skills", joinColumns = [JoinColumn(name = "user_id")])
    @Column(name = "skill")
    @Enumerated(EnumType.STRING)
    var skills: MutableSet<Skill> = mutableSetOf(),
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_interests", joinColumns = [JoinColumn(name = "user_id")])
    @Column(name = "interest")
    @Enumerated(EnumType.STRING)
    var interests: MutableSet<Interest> = mutableSetOf(),
    var updatedAt: LocalDateTime = LocalDateTime.now(),
    @OneToMany(mappedBy = "creator", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val createdEvents: List<Event> = mutableListOf()
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
}
