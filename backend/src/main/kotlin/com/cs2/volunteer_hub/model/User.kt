package com.cs2.volunteer_hub.model

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id : Long = 0,
    val username: String,

    @Column(unique = true)
    var email: String,
    var passwordHash : String,

    @Enumerated(EnumType.STRING)
    var role: Role = Role.VOLUNTEER,

    @OneToMany(mappedBy = "creator", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val createdEvents: List<Event> = mutableListOf()
)
