package com.cs2.volunteer_hub.mapper

import com.cs2.volunteer_hub.dto.DashboardActionItem
import com.cs2.volunteer_hub.dto.DashboardEventItem
import com.cs2.volunteer_hub.dto.DashboardPendingRegistrationItem
import com.cs2.volunteer_hub.dto.DashboardPostItem
import com.cs2.volunteer_hub.dto.DashboardTopEventItem
import com.cs2.volunteer_hub.dto.DashboardTrendingEventItem
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.Post
import com.cs2.volunteer_hub.model.Registration
import org.springframework.stereotype.Component
import java.time.LocalDateTime

/**
 * Mapper for Dashboard DTOs
 * Centralizes all mapping logic for dashboard-related data transformations
 */
@Component
class DashboardMapper {

    /**
     * Map Event to DashboardEventItem
     */
    fun toDashboardEventItem(event: Event): DashboardEventItem {
        return DashboardEventItem(
            id = event.id,
            title = event.title,
            eventDateTime = event.eventDateTime,
            location = event.location
        )
    }

    /**
     * Map list of Events to list of DashboardEventItems
     */
    fun toDashboardEventItemList(events: List<Event>): List<DashboardEventItem> {
        return events.map { toDashboardEventItem(it) }
    }

    /**
     * Map Registration to DashboardPendingRegistrationItem
     */
    fun toDashboardPendingRegistrationItem(registration: Registration): DashboardPendingRegistrationItem {
        return DashboardPendingRegistrationItem(
            eventId = registration.event.id,
            eventTitle = registration.event.title,
            registeredAt = registration.registeredAt
        )
    }

    /**
     * Map list of Registrations to list of DashboardPendingRegistrationItems
     */
    fun toDashboardPendingRegistrationItemList(registrations: List<Registration>): List<DashboardPendingRegistrationItem> {
        return registrations.map { toDashboardPendingRegistrationItem(it) }
    }

    /**
     * Map Registration to DashboardActionItem (for organizer dashboard)
     */
    fun registrationToDashboardActionItem(registration: Registration): DashboardActionItem {
        return DashboardActionItem(
            id = registration.id,
            primaryText = registration.user.name,
            secondaryText = registration.event.title,
            timestamp = registration.registeredAt
        )
    }

    /**
     * Map list of Registrations to list of DashboardActionItems
     */
    fun registrationsToDashboardActionItemList(registrations: List<Registration>): List<DashboardActionItem> {
        return registrations.map { registrationToDashboardActionItem(it) }
    }

    /**
     * Map Event to DashboardActionItem (for admin dashboard)
     */
    fun eventToDashboardActionItem(event: Event): DashboardActionItem {
        return DashboardActionItem(
            id = event.id,
            primaryText = event.title,
            secondaryText = "bởi ${event.creator.name}",
            timestamp = event.createdAt
        )
    }

    /**
     * Map list of Events to list of DashboardActionItems
     */
    fun eventsToDashboardActionItemList(events: List<Event>): List<DashboardActionItem> {
        return events.map { eventToDashboardActionItem(it) }
    }

    /**
     * Map Post to DashboardPostItem
     */
    fun toDashboardPostItem(post: Post): DashboardPostItem {
        return DashboardPostItem(
            postId = post.id,
            contentPreview = post.content.take(100),
            authorName = post.author.name,
            eventName = post.event.title,
            eventId = post.event.id
        )
    }

    /**
     * Map list of Posts to list of DashboardPostItems
     */
    fun toDashboardPostItemList(posts: List<Post>): List<DashboardPostItem> {
        return posts.map { toDashboardPostItem(it) }
    }

    /**
     * Map Event to DashboardTopEventItem
     */
    fun toDashboardTopEventItem(event: Event): DashboardTopEventItem {
        return DashboardTopEventItem(
            id = event.id,
            title = event.title,
            count = event.registrations.size.toLong()
        )
    }

    /**
     * Map list of Events to list of DashboardTopEventItems
     */
    fun toDashboardTopEventItemList(events: List<Event>): List<DashboardTopEventItem> {
        return events.map { toDashboardTopEventItem(it) }
    }

    /**
     * Map Event to DashboardTrendingEventItem
     * Counts registrations after a specific date
     */
    fun toDashboardTrendingEventItem(event: Event, since: LocalDateTime): DashboardTrendingEventItem {
        val registrationCount = event.registrations.count {
            it.registeredAt.isAfter(since)
        }.toLong()

        return DashboardTrendingEventItem(
            id = event.id,
            title = event.title,
            eventDateTime = event.eventDateTime,
            location = event.location,
            registrationCount = registrationCount
        )
    }

    /**
     * Map list of Events to list of DashboardTrendingEventItems
     * Sorts by registration count descending and takes the top items
     */
    fun toDashboardTrendingEventItemList(events: List<Event>, since: java.time.LocalDateTime, limit: Int = 5): List<com.cs2.volunteer_hub.dto.DashboardTrendingEventItem> {
        return events
            .map { toDashboardTrendingEventItem(it, since) }
            .sortedByDescending { it.registrationCount }
            .take(limit)
    }
}
