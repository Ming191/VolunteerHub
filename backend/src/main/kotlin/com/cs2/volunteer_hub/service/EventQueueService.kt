package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.model.EventStatus
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.time.Instant

/**
 * Service for publishing event lifecycle changes
 * Other components can listen to these events for notifications, metrics, etc.
 */
@Service
class EventQueueService(
    private val applicationEventPublisher: ApplicationEventPublisher
) {
    private val logger = LoggerFactory.getLogger(EventQueueService::class.java)

    /**
     * Queue/publish an event lifecycle change event
     */
    fun queueEvent(event: EventLifecycleEvent) {
        applicationEventPublisher.publishEvent(event)
        logger.info("Event lifecycle change published: Event ${event.eventId} status changed from ${event.from} to ${event.to}")
    }
}

/**
 * Event published when event status changes
 */
data class EventLifecycleEvent(
    val eventId: Long,
    val from: EventStatus,
    val to: EventStatus,
    val occurredAt: Instant = Instant.now(),
    val reason: String? = null
)

