package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Event
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventRepository : JpaRepository<Event, Long> {
    fun findAllByIsApprovedTrueOrderByEventDateTimeAsc(): List<Event>
}