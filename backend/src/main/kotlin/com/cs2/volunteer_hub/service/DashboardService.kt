package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.AdminDashboardResponse
import com.cs2.volunteer_hub.dto.OrganizerDashboardResponse
import com.cs2.volunteer_hub.dto.VolunteerDashboardResponse
import com.cs2.volunteer_hub.mapper.DashboardMapper
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.specification.EventSpecifications
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class DashboardService(
    private val userRepository: UserRepository,
    private val eventRepository: EventRepository,
    private val registrationRepository: RegistrationRepository,
    private val postRepository: PostRepository,
    private val dashboardMapper: DashboardMapper
) {
    @Cacheable(value = ["volunteer_dashboard"], key = "#userEmail")
    @Transactional(readOnly = true)
    fun getVolunteerDashboard(userEmail: String): VolunteerDashboardResponse {
        val user = userRepository.findByEmail(userEmail)!!

        // Get upcoming events for approved registrations
        val myUpcomingEvents = registrationRepository
            .findTop3ByUserIdAndStatusOrderByEventEventDateTimeAsc(user.id, RegistrationStatus.APPROVED)
            .map { it.event }
            .let { dashboardMapper.toDashboardEventItemList(it) }

        // Get pending registrations
        val myPendingRegistrations = registrationRepository
            .findTop3ByUserIdAndStatusOrderByEventEventDateTimeAsc(user.id, RegistrationStatus.PENDING)
            .let { dashboardMapper.toDashboardPendingRegistrationItemList(it) }

        // Get newly approved events
        val newlyApprovedEvents = eventRepository
            .findTop5ByIsApprovedTrueOrderByCreatedAtDesc()
            .let { dashboardMapper.toDashboardEventItemList(it) }

        // Get trending events
        val trendingEvents = eventRepository.findTrendingEvents(
            LocalDateTime.now().minusDays(7),
            PageRequest.of(0, 5)
        )

        // Get recent posts from approved event registrations
        val approvedEventIds = registrationRepository
            .findAllByUserIdAndStatus(user.id, RegistrationStatus.APPROVED)
            .map { it.event.id }

        val recentWallPosts = if (approvedEventIds.isNotEmpty()) {
            postRepository
                .findRecentPostsInEvents(approvedEventIds, PageRequest.of(0, 5))
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

    @Cacheable(value = ["organizer_dashboard"], key = "#userEmail")
    @Transactional(readOnly = true)
    fun getOrganizerDashboard(userEmail: String): OrganizerDashboardResponse {
        val user = userRepository.findByEmail(userEmail)!!

        // Use Specification Pattern for pending registrations count
        val pendingRegistrationsSpec = RegistrationSpecifications.forEventsCreatedBy(user.id)
            .and(RegistrationSpecifications.hasStatus(RegistrationStatus.PENDING))
        val pendingRegistrationsCount = registrationRepository.count(pendingRegistrationsSpec)

        // Use specifications for events pending admin approval
        val eventsPendingApprovalSpec = EventSpecifications.hasCreator(user.id)
            .and(EventSpecifications.isNotApproved())
        val eventsPendingAdminApprovalCount = eventRepository.count(eventsPendingApprovalSpec)

        val stats = mapOf(
            "pendingRegistrations" to pendingRegistrationsCount,
            "eventsPendingAdminApproval" to eventsPendingAdminApprovalCount
        )

        // Get pending events using mapper
        val eventsPendingAdminApproval = eventRepository
            .findAll(eventsPendingApprovalSpec)
            .let { dashboardMapper.toDashboardEventItemList(it) }

        // Get recent pending registrations using mapper
        val recentPendingRegistrations = registrationRepository
            .findAll(
                pendingRegistrationsSpec,
                Sort.by(Sort.Direction.DESC, "registeredAt")
            )
            .take(5)
            .let { dashboardMapper.registrationsToDashboardActionItemList(it) }

        // Get top events by registration count using mapper
        val topEventsByRegistration = eventRepository
            .findTop3EventsByRegistrations(user.id, PageRequest.of(0, 3))
            .let { dashboardMapper.toDashboardTopEventItemList(it) }

        return OrganizerDashboardResponse(
            stats = stats,
            eventsPendingAdminApproval = eventsPendingAdminApproval,
            recentPendingRegistrations = recentPendingRegistrations,
            topEventsByRegistration = topEventsByRegistration
        )
    }

    @Cacheable("admin_dashboard")
    @Transactional(readOnly = true)
    fun getAdminDashboard(): AdminDashboardResponse {
        val userRoleCounts = userRepository.countUsersByRole()
            .associate { (role, count) -> (role as Role).name to (count as Long) }

        val totalEvents = eventRepository.count()
        val totalRegistrations = registrationRepository.count()
        val totalUsers = userRepository.count()

        // Use specification and mapper for events to approve
        val spec = EventSpecifications.isNotApproved()
        val eventsToApprove = eventRepository
            .findAll(spec)
            .let { dashboardMapper.eventsToDashboardActionItemList(it) }

        return AdminDashboardResponse(
            stats = mapOf(
                "totalUsers" to totalUsers,
                "totalEvents" to totalEvents,
                "totalRegistrations" to totalRegistrations
            ),
            userRoleCounts = userRoleCounts,
            eventsToApprove = eventsToApprove
        )
    }
}
