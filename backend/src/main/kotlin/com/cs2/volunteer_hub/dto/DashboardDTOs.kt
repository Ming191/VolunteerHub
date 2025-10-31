package com.cs2.volunteer_hub.dto

import java.time.LocalDateTime

data class DashboardEventItem(
    val id: Long,
    val title: String,
    val eventDateTime: LocalDateTime,
    val location: String
)

data class DashboardTrendingEventItem(
    val id: Long,
    val title: String,
    val eventDateTime: LocalDateTime,
    val location: String,
    val registrationCount: Long
)

data class DashboardPendingRegistrationItem(
    val eventId: Long,
    val eventTitle: String,
    val registeredAt: LocalDateTime
)

data class DashboardPostItem(
    val postId: Long,
    val contentPreview: String,
    val authorName: String,
    val eventName: String,
    val eventId: Long
)

data class VolunteerDashboardResponse(
    val myUpcomingEvents: List<DashboardEventItem>,
    val myPendingRegistrations: List<DashboardPendingRegistrationItem>,

    val newlyApprovedEvents: List<DashboardEventItem>,
    val trendingEvents: List<DashboardTrendingEventItem>,

    val recentWallPosts: List<DashboardPostItem>
)