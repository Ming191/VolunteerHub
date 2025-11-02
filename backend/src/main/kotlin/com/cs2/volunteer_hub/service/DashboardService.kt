package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.AdminDashboardResponse
import com.cs2.volunteer_hub.dto.DashboardActionItem
import com.cs2.volunteer_hub.dto.DashboardEventItem
import com.cs2.volunteer_hub.dto.DashboardPendingRegistrationItem
import com.cs2.volunteer_hub.dto.DashboardPostItem
import com.cs2.volunteer_hub.dto.DashboardTopEventItem
import com.cs2.volunteer_hub.dto.OrganizerDashboardResponse
import com.cs2.volunteer_hub.dto.VolunteerDashboardResponse
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.model.Role
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.specification.EventSpecifications
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class DashboardService(
    private val userRepository: UserRepository,
    private val eventRepository: EventRepository,
    private val registrationRepository: RegistrationRepository,
    private val postRepository: PostRepository
) {
    @Cacheable(value = ["volunteer_dashboard"], key = "#userEmail")
    @Transactional(readOnly = true)
    fun getVolunteerDashboard(userEmail: String): VolunteerDashboardResponse {
        val user = userRepository.findByEmail(userEmail)!!

        val myUpcomingEvents = registrationRepository.findTop3ByUserIdAndStatusOrderByEventEventDateTimeAsc(user.id, RegistrationStatus.APPROVED)
            .map { it.event }
            .map { event -> DashboardEventItem(event.id, event.title, event.eventDateTime, event.location) }

        val myPendingRegistrations = registrationRepository.findTop3ByUserIdAndStatusOrderByEventEventDateTimeAsc(user.id, RegistrationStatus.PENDING)
            .map { reg -> DashboardPendingRegistrationItem(reg.event.id, reg.event.title, reg.registeredAt) }

        val newlyApprovedEvents = eventRepository.findTop5ByIsApprovedTrueOrderByCreatedAtDesc()
            .map { event -> DashboardEventItem(event.id, event.title, event.eventDateTime, event.location) }

        val trendingEvents = eventRepository.findTrendingEvents(LocalDateTime.now().minusDays(7), PageRequest.of(0, 5))

        val approvedEventIds = registrationRepository.findAllByUserIdAndStatus(user.id, RegistrationStatus.APPROVED)
            .map { it.event.id }

        val recentWallPosts = if (approvedEventIds.isNotEmpty()) {
            postRepository.findRecentPostsInEvents(approvedEventIds, PageRequest.of(0, 5))
                .map { post ->
                    DashboardPostItem(
                        postId = post.id,
                        contentPreview = post.content.take(100),
                        authorName = post.author.name,
                        eventName = post.event.title,
                        eventId = post.event.id
                    )
                }
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

        val pendingRegistrationsCount = registrationRepository.countPendingRegistrationsByCreatorId(user.id)

        // Use specifications instead of repository method
        val eventsPendingApprovalSpec = EventSpecifications.hasCreator(user.id)
            .and(EventSpecifications.isNotApproved())
        val eventsPendingAdminApprovalCount = eventRepository.count(eventsPendingApprovalSpec)

        val stats = mapOf(
            "pendingRegistrations" to pendingRegistrationsCount,
            "eventsPendingAdminApproval" to eventsPendingAdminApprovalCount
        )

        // Use specifications to get pending events
        val eventsPendingAdminApproval = eventRepository.findAll(eventsPendingApprovalSpec)
            .map { event -> DashboardEventItem(event.id, event.title, event.eventDateTime, event.location) }

        val recentPendingRegistrations = registrationRepository.findRecentPendingRegistrationsByCreatorId(user.id, PageRequest.of(0, 5))
            .map { reg ->
                DashboardActionItem(
                    id = reg.id,
                    primaryText = reg.user.name,
                    secondaryText = reg.event.title,
                    timestamp = reg.registeredAt
                )
            }

        val topEventsByRegistration = eventRepository.findTop3EventsByRegistrations(user.id, PageRequest.of(0, 3))
            .map { event ->
                DashboardTopEventItem(
                    id = event.id,
                    title = event.title,
                    count = event.registrations.size.toLong()
                )
            }

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

        // Use specification instead of repository method
        val spec = EventSpecifications.isNotApproved()
        val eventsToApprove = eventRepository.findAll(spec)
            .map { event -> DashboardActionItem(
                id = event.id,
                primaryText = event.title,
                secondaryText = "bởi " + event.creator.name,
                timestamp = event.createdAt
            )}

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
