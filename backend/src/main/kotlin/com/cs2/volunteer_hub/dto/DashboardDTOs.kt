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

data class DashboardActionItem(
    val id: Long,
    val primaryText: String,
    val secondaryText: String,
    val timestamp: LocalDateTime
)

data class DashboardTopEventItem(
    val id: Long,
    val title: String,
    val count: Long
)

data class OrganizerDashboardResponse(
    val stats: Map<String, Long>,
    val eventsPendingAdminApproval: List<DashboardEventItem>,
    val recentPendingRegistrations: List<DashboardActionItem>,
    val topEventsByRegistration: List<DashboardTopEventItem>
)

data class AdminDashboardResponse(
    val stats: Map<String, Long>,
    val userRoleCounts: Map<String, Long>,
    val eventsToApprove: List<DashboardActionItem>
)

data class OrganizerAnalyticsResponse(
    val totalEvents: Long,
    val totalRegistrations: Long,
    val activeEvents: Long,
    val avgRegistrationRate: Double,
    val topEvents: List<DashboardTopEventItem>,
    val registrationsByStatus: Map<String, Long>
)
