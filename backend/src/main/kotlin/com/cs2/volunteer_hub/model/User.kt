package com.cs2.volunteer_hub.model

import jakarta.persistence.*

@Entity
@Table(
    name = "users",
    indexes = [
        Index(name = "idx_users_email", columnList = "email", unique = true),
        Index(name = "idx_users_role", columnList = "role")
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

    @OneToMany(mappedBy = "creator", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val createdEvents: List<Event> = mutableListOf()
)
