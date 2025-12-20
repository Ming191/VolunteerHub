package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.AdminDashboardResponse
import com.cs2.volunteer_hub.dto.OrganizerAnalyticsResponse
import com.cs2.volunteer_hub.dto.OrganizerDashboardResponse
import com.cs2.volunteer_hub.dto.VolunteerDashboardResponse
import com.cs2.volunteer_hub.mapper.DashboardMapper
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.*
import com.cs2.volunteer_hub.specification.EventSpecifications
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import java.time.LocalDateTime
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DashboardService(
        private val userRepository: UserRepository,
        private val eventRepository: EventRepository,
        private val registrationRepository: RegistrationRepository,
        private val postRepository: PostRepository,
        private val dashboardMapper: DashboardMapper
) {
    @Cacheable(value = ["volunteerDashboard"], key = "#userEmail")
    @Transactional(readOnly = true)
    fun getVolunteerDashboard(userEmail: String): VolunteerDashboardResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)

        val approvedSpec =
                RegistrationSpecifications.byUser(user.id)
                        .and(RegistrationSpecifications.isApproved())
        val myUpcomingEvents =
                registrationRepository
                        .findAll(approvedSpec, PageRequest.of(0, 3, Sort.by(Sort.Direction.ASC, "event.eventDateTime")))
                        .content
                        .map { it.event }
                        .let { dashboardMapper.toDashboardEventItemList(it) }

        val pendingSpec =
                RegistrationSpecifications.byUser(user.id)
                        .and(RegistrationSpecifications.isPending())
        val myPendingRegistrations =
                registrationRepository
                        .findAll(pendingSpec, PageRequest.of(0, 3, Sort.by(Sort.Direction.ASC, "event.eventDateTime")))
                        .content
                        .let { dashboardMapper.toDashboardPendingRegistrationItemList(it) }

        val newEventsSpec = EventSpecifications.upcomingPublishedEvents()
        val newlyApprovedEvents =
                eventRepository.findAll(
                                newEventsSpec,
                                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
                        )
                        .content
                        .let { dashboardMapper.toDashboardEventItemList(it) }

        val trendingEvents =
                eventRepository.findTrendingEvents(
                        LocalDateTime.now().minusDays(7),
                        PageRequest.of(0, 5)
                )

        // OPTIMIZED: Derive event IDs directly from approved registrations to avoid extra query
        val approvedRegistrations = registrationRepository.findAll(approvedSpec)
        val approvedEventIds =
                approvedRegistrations
                        .map { it.event.id }
                        .distinct()

        val recentWallPosts =
                if (approvedEventIds.isNotEmpty()) {
                    postRepository.findRecentPostsInEvents(approvedEventIds, PageRequest.of(0, 5))
                            .let { dashboardMapper.toDashboardPostItemList(it) }
                } else {
                    emptyList()
                }

        return VolunteerDashboardResponse(
                myUpcomingEvents = myUpcomingEvents,
                myPendingRegistrations = myPendingRegistrations,
                newlyApprovedEvents = newlyApprovedEvents,
                trendingEvents = trendingEvents,
                recentWallPosts = recentWallPosts
        )
    }

    /** Get events currently accepting registrations Uses NEW specification registrationOpen() */
    @Transactional(readOnly = true)
    fun getEventsAcceptingRegistrations(): List<Any> {
        val spec = EventSpecifications.registrationOpen()
        return eventRepository
                .findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime"))
                .take(10)
                .let { dashboardMapper.toDashboardEventItemList(it) }
    }

    /** Get in-progress events for live tracking Uses NEW specification isInProgress() */
    @Transactional(readOnly = true)
    fun getInProgressEventsForDashboard(): List<Any> {
        val spec = EventSpecifications.isInProgress()
        return eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDateTime")).let {
            dashboardMapper.toDashboardEventItemList(it)
        }
    }

    @Cacheable(value = ["organizerDashboard"], key = "#userEmail")
    @Transactional(readOnly = true)
    fun getOrganizerDashboard(userEmail: String): OrganizerDashboardResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)

        val pendingRegistrationsSpec =
                RegistrationSpecifications.forEventsCreatedBy(user.id)
                        .and(RegistrationSpecifications.hasStatus(RegistrationStatus.PENDING))
        val pendingRegistrationsCount = registrationRepository.count(pendingRegistrationsSpec)

        val eventsPendingApprovalSpec =
                EventSpecifications.hasCreator(user.id).and(EventSpecifications.isNotApproved())
        val eventsPendingAdminApprovalCount = eventRepository.count(eventsPendingApprovalSpec)

        val totalEventsSpec = EventSpecifications.hasCreator(user.id)
        val totalEventsCount = eventRepository.count(totalEventsSpec)

        val stats =
                mapOf(
                        "pendingRegistrations" to pendingRegistrationsCount,
                        "eventsPendingAdminApproval" to eventsPendingAdminApprovalCount,
                        "totalEvents" to totalEventsCount
                )

        val eventsPendingAdminApproval =
                eventRepository.findAll(eventsPendingApprovalSpec).let {
                    dashboardMapper.toDashboardEventItemList(it)
                }

        val recentPendingRegistrations =
                registrationRepository
                        .findAll(
                                pendingRegistrationsSpec,
                                Sort.by(Sort.Direction.DESC, "registeredAt")
                        )
                        .take(5)
                        .let { dashboardMapper.registrationsToDashboardActionItemList(it) }

        val topEventsByRegistration =
                eventRepository.findTop3EventsByRegistrations(user.id, PageRequest.of(0, 3)).let {
                    dashboardMapper.toDashboardTopEventItemList(it)
                }

        return OrganizerDashboardResponse(
                stats = stats,
                eventsPendingAdminApproval = eventsPendingAdminApproval,
                recentPendingRegistrations = recentPendingRegistrations,
                topEventsByRegistration = topEventsByRegistration
        )
    }

    @Cacheable("adminDashboard")
    @Transactional(readOnly = true)
    fun getAdminDashboard(): AdminDashboardResponse {
        val userRoleCounts =
                userRepository.countUsersByRole().associate { (role, count) ->
                    (role as Role).name to (count as Long)
                }

        val totalEvents = eventRepository.count()
        val totalRegistrations = registrationRepository.count()
        val totalUsers = userRepository.count()

        // Use specification and mapper for events to approve
        val spec = EventSpecifications.isNotApproved()
        val eventsToApprove =
                eventRepository.findAll(spec).let {
                    dashboardMapper.eventsToDashboardActionItemList(it)
                }

        return AdminDashboardResponse(
                stats =
                        mapOf(
                                "totalUsers" to totalUsers,
                                "totalEvents" to totalEvents,
                                "totalRegistrations" to totalRegistrations
                        ),
                userRoleCounts = userRoleCounts,
                eventsToApprove = eventsToApprove
        )
    }

    @Cacheable(value = ["organizerAnalytics"], key = "#userEmail")
    @Transactional(readOnly = true)
    fun getOrganizerAnalytics(userEmail: String): OrganizerAnalyticsResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)

        // Count all events created by this organizer
        val totalEvents = eventRepository.count(EventSpecifications.hasCreator(user.id))

        // Count active events (approved and event date is in the future)
        val now = LocalDateTime.now()
        val activeEventsSpec = 
                EventSpecifications.hasCreator(user.id)
                        .and(EventSpecifications.isApproved())
                        .and(EventSpecifications.happeningAfter(now))
        val activeEvents = eventRepository.count(activeEventsSpec)

        // Get top 5 events by registration count
        val topEvents = eventRepository.findTop3EventsByRegistrations(user.id, PageRequest.of(0, 5))
                .let { dashboardMapper.toDashboardTopEventItemList(it) }

        // OPTIMIZED: Get registration breakdown by status in single query
        val statusCounts = registrationRepository.countRegistrationsByStatusForCreator(user.id)
                .associate { map ->
                    (map["status"] as RegistrationStatus).name to (map["count"] as Long)
                }
        
        // Calculate total registrations from status counts
        val totalRegistrations = statusCounts.values.sum()

        // Ensure all statuses are present in the map (even with 0 count)
        val registrationsByStatus = RegistrationStatus.values().associate { status ->
            status.name to (statusCounts[status.name] ?: 0L)
        }

        // Calculate average registration rate
        val avgRegistrationRate = if (totalEvents > 0) {
            (totalRegistrations.toDouble() / totalEvents.toDouble()) * 100
        } else {
            0.0
        }

        return OrganizerAnalyticsResponse(
                totalEvents = totalEvents,
                totalRegistrations = totalRegistrations,
                activeEvents = activeEvents,
                avgRegistrationRate = avgRegistrationRate,
                topEvents = topEvents,
                registrationsByStatus = registrationsByStatus
        )
    }
}
