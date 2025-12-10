package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.AdminDashboardResponse
import com.cs2.volunteer_hub.dto.OrganizerDashboardResponse
import com.cs2.volunteer_hub.dto.VolunteerDashboardResponse
import com.cs2.volunteer_hub.mapper.DashboardMapper
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.*
import com.cs2.volunteer_hub.specification.EventSpecifications
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import java.time.LocalDateTime
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
    @Transactional(readOnly = true)
    fun getVolunteerDashboard(userEmail: String): VolunteerDashboardResponse {
        val user = userRepository.findByEmailOrThrow(userEmail)

        val approvedSpec =
                RegistrationSpecifications.byUser(user.id)
                        .and(RegistrationSpecifications.isApproved())
        val myUpcomingEvents =
                registrationRepository
                        .findAll(approvedSpec, Sort.by(Sort.Direction.ASC, "event.eventDateTime"))
                        .take(3)
                        .map { it.event }
                        .let { dashboardMapper.toDashboardEventItemList(it) }

        val pendingSpec =
                RegistrationSpecifications.byUser(user.id)
                        .and(RegistrationSpecifications.isPending())
        val myPendingRegistrations =
                registrationRepository
                        .findAll(pendingSpec, Sort.by(Sort.Direction.ASC, "event.eventDateTime"))
                        .take(3)
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

        val approvedEventIds = registrationRepository.findAll(approvedSpec).map { it.event.id }

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

        val stats =
                mapOf(
                        "pendingRegistrations" to pendingRegistrationsCount,
                        "eventsPendingAdminApproval" to eventsPendingAdminApprovalCount
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

    // @Cacheable("admin_dashboard")
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
}
