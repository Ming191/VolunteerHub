package com.cs2.volunteer_hub.repository

import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository

@Repository
interface EventRepository : JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    fun findAllByStatusOrderByEventDateTimeAsc(status: EventStatus): List<Event>

    // Paginated version
    fun findAllByStatusOrderByEventDateTimeAsc(status: EventStatus, pageable: Pageable): Page<Event>

    fun findTop5ByStatusOrderByCreatedAtDesc(status: EventStatus): List<Event>
}