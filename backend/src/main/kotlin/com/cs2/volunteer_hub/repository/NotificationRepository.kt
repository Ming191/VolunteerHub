package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Notification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificationRepository : JpaRepository<Notification, Long> {
    fun findByRecipientIdOrderByCreatedAtDesc(recipientId: Long): List<Notification>
}