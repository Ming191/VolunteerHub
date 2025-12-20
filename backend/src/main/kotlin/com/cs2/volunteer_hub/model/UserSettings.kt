package com.cs2.volunteer_hub.model

import jakarta.persistence.*

@Entity
@Table(
    name = "user_settings",
    indexes = [
        Index(name = "idx_user_settings_user_id", columnList = "user_id")
    ]
)
data class UserSettings(
    @Id val userId: Long = 0,

    // Notification Preferences
    @Column(nullable = false) var emailNotificationsEnabled: Boolean = true,
    @Column(nullable = false) var pushNotificationsEnabled: Boolean = true,
    @Column(nullable = false) var eventReminderNotifications: Boolean = true,
    @Column(nullable = false) var eventUpdateNotifications: Boolean = true,
    @Column(nullable = false) var commentNotifications: Boolean = true,

    // Appearance
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    var theme: Theme = Theme.SYSTEM,

    // Privacy
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    var profileVisibility: ProfileVisibility = ProfileVisibility.PUBLIC,
    
    @Version
    @Column(nullable = false)
    var version: Long = 0,
    
    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    val user: User? = null
)
