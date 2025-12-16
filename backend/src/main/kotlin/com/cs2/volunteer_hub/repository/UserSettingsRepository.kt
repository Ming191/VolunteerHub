package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.UserSettings
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserSettingsRepository : JpaRepository<UserSettings, Long> {
    fun findByUserId(userId: Long): UserSettings?
}
