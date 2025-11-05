package com.cs2.volunteer_hub.listener

import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.service.EmailQueueService
import com.cs2.volunteer_hub.service.EventLifecycleEvent
import com.cs2.volunteer_hub.specification.RegistrationSpecifications
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * Listener for event lifecycle changes
 * Reacts to status changes by sending notifications, updating metrics, etc.
 */
@Component
class EventLifecycleListener(
    private val emailQueueService: EmailQueueService,
    private val registrationRepository: RegistrationRepository
) {
    private val logger = LoggerFactory.getLogger(EventLifecycleListener::class.java)

    /**
     * Handle event cancellation by notifying all registered participants
     */
    @Async
    @EventListener
    @Transactional(readOnly = true)
    fun handleEventCancellation(event: EventLifecycleEvent) {
        if (event.to != EventStatus.CANCELLED) return

        logger.info("Handling event cancellation for event ${event.eventId}")

        val spec = RegistrationSpecifications.approvedForEvent(event.eventId)
        val registrations = registrationRepository.findAll(spec)

        registrations.forEach { registration ->
            emailQueueService.queueEventCancelledEmail(
                email = registration.user.email,
                name = registration.user.name,
                eventTitle = registration.event.title,
                cancelReason = event.reason ?: "No reason provided"
            )
            logger.info("Queued cancellation email for user ${registration.user.email}")
        }
        logger.info("Processed cancellation notifications for ${registrations.size} participants")
    }

    /**
     * Handle event publication (approval) - can be extended to send notifications
     */
    @Async
    @EventListener
    fun handleEventPublication(event: EventLifecycleEvent) {
        if (event.to != EventStatus.PUBLISHED) return

        logger.info("Event ${event.eventId} has been published")
        // Additional logic for event publication can be added here
        // e.g., send notification to followers, update search index, etc.
    }

    /**
     * Log all lifecycle changes for audit purposes
     */
    @Async
    @EventListener
    fun logLifecycleChange(event: EventLifecycleEvent) {
        logger.info(
            "Event lifecycle change: Event ${event.eventId} changed from ${event.from} to ${event.to}" +
                    if (event.reason != null) " (reason: ${event.reason})" else ""
        )
    }
}
