package com.cs2.volunteer_hub.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "users",
    indexes = [
        Index(name = "idx_users_email", columnList = "email", unique = true),
        Index(name = "idx_users_role", columnList = "role"),
        Index(name = "idx_users_email_verified", columnList = "is_email_verified")
    ]
)
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id : Long = 0,
    val name: String,

    @Column(unique = true)
    var email: String,
    var passwordHash : String,

    @Enumerated(EnumType.STRING)
    var role: Role = Role.VOLUNTEER,

    var isLocked: Boolean = false,

    var isEmailVerified: Boolean = false,

    @Column(nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    var lastLoginAt: LocalDateTime? = null,

    @OneToMany(mappedBy = "creator", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val createdEvents: List<Event> = mutableListOf()
) {
    @PrePersist
    fun prePersist() {
        if (createdAt.year == 1970) {
            createdAt = LocalDateTime.now()
        }
    }
}
