package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.DashboardEventItem
import com.cs2.volunteer_hub.dto.DashboardPendingRegistrationItem
import com.cs2.volunteer_hub.dto.DashboardPostItem
import com.cs2.volunteer_hub.dto.VolunteerDashboardResponse
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
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
}
