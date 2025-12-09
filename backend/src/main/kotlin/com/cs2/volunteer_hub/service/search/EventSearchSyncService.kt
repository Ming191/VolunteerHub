package com.cs2.volunteer_hub.service.search

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.ChangeType
import com.cs2.volunteer_hub.dto.EventChangedMessage
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.search.EventDocument
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.search.EventElasticsearchRepository
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class EventSearchSyncService(
        private val eventRepository: EventRepository,
        private val eventElasticsearchRepository: EventElasticsearchRepository
) {

    private val logger = LoggerFactory.getLogger(EventSearchSyncService::class.java)

    @RabbitListener(queues = [RabbitMQConfig.EVENT_CHANGED_QUEUE])
    @Transactional
    fun handleEventChange(message: EventChangedMessage) {
        logger.info("Received event change message: $message")

        try {
            when (message.type) {
                ChangeType.DELETED -> {
                    eventElasticsearchRepository.deleteById(message.eventId.toString())
                    logger.info("Deleted event from search index: ${message.eventId}")
                }
                else -> {
                    // For CREATED, UPDATED, CANCELLED - we fetch fresh data and index
                    val event = eventRepository.findById(message.eventId).orElse(null)
                    if (event != null) {
                        val document = toEventDocument(event)
                        eventElasticsearchRepository.save(document)
                        logger.info("Indexed event to search index: ${message.eventId}")
                    } else {
                        // Edge case: Event might have been deleted right after update was queued
                        // Safe to delete from index just in case
                        eventElasticsearchRepository.deleteById(message.eventId.toString())
                        logger.warn(
                                "Event not found for indexing, removed from index: ${message.eventId}"
                        )
                    }
                }
            }
        } catch (e: Exception) {
            logger.error("Failed to sync event to Elasticsearch: ${message.eventId}", e)
            // Throwing exception triggers DLQ mechanism via RabbitMQ config
            throw e
        }
    }

    private fun toEventDocument(event: Event): EventDocument {
        return EventDocument(
                id = event.id.toString(),
                title = event.title,
                description = event.description,
                location = event.location,
                tags = event.tags.toSet(),
                eventDateTime = event.eventDateTime,
                endDateTime = event.endDateTime,
                status = event.status.name,
                isApproved = event.isApproved
        )
    }
}
