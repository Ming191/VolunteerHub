package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import com.cs2.volunteer_hub.specification.EventSpecifications
import com.cs2.volunteer_hub.validation.EventDateValidator
import com.cs2.volunteer_hub.validation.EventLifecycleValidator
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.Caching
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.springframework.web.multipart.MultipartFile

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val userRepository: UserRepository,
    private val rabbitTemplate: RabbitTemplate,
    private val fileValidationService: FileValidationService,
    private val eventMapper: EventMapper,
    private val eventCapacityService: EventCapacityService,
    private val authorizationService: AuthorizationService,
    private val eventDateValidator: EventDateValidator,
    private val eventLifecycleValidator: EventLifecycleValidator,
    private val eventQueueService: EventQueueService,
    @field:Value("\${upload.max-files-per-event:10}") private val maxFilesPerEvent: Int = 10
) {
    private val logger = LoggerFactory.getLogger(EventService::class.java)

    @CacheEvict(value = ["events"], allEntries = true)
    @Transactional
    fun createEvent(
        request: CreateEventRequest,
        creatorEmail: String,
        files: List<MultipartFile>?
    ): EventResponse {
        val creator = userRepository.findByEmailOrThrow(creatorEmail)

        files?.let { fileValidationService.validateFiles(it, maxFilesPerEvent) }

        eventDateValidator.validateEventDates(
            request.eventDateTime,
            request.endDateTime,
            request.registrationDeadline
        )

        val newEvent = Event(
            title = request.title,
            description = request.description,
            location = request.location,
            eventDateTime = request.eventDateTime,
            endDateTime = request.endDateTime,
            registrationDeadline = request.registrationDeadline,
            creator = creator,
            status = EventStatus.PENDING,
            maxParticipants = request.maxParticipants,
            waitlistEnabled = request.waitlistEnabled,
            tags = request.tags?.toMutableSet() ?: mutableSetOf()
        )

        if (!files.isNullOrEmpty()) {
            fileValidationService.processFilesForEvent(files, newEvent)
        }

        val savedEvent = eventRepository.save(newEvent)
        logger.info(
            "Created event ID: ${savedEvent.id} with ${savedEvent.images.size} images pending upload"
        )

        if (savedEvent.images.isNotEmpty()) {
            val message = EventCreationMessage(eventId = savedEvent.id)

            TransactionSynchronizationManager.registerSynchronization(
                object : TransactionSynchronization {
                    override fun afterCommit() {
                        rabbitTemplate.convertAndSend(
                            RabbitMQConfig.EXCHANGE_NAME,
                            RabbitMQConfig.EVENT_CREATION_PENDING_ROUTING_KEY,
                            message
                        )
                        logger.info(
                            "Sent event creation message to queue for Event ID: ${savedEvent.id}"
                        )
                    }
                }
            )
        }

        return eventMapper.toEventResponse(savedEvent)
    }

    /** Get all approved events with pagination support */
    @Transactional(readOnly = true)
    fun getAllApprovedEvents(pageable: Pageable): Page<EventResponse> {
        val spec = EventSpecifications.isApproved()
        val eventPage = eventRepository.findAll(spec, pageable)
        val eventResponses = eventMapper.toEventResponseList(eventPage.content)

        return PageImpl(eventResponses, pageable, eventPage.totalElements)
    }

    /**
     * Get all events created by a specific user (non-cancelled) Used for "My Events" feature on
     * profile page
     */
    @Transactional(readOnly = true)
    fun getEventsByCreator(userEmail: String, pageable: Pageable): Page<EventResponse> {
        val user = userRepository.findByEmailOrThrow(userEmail)
        val spec = EventSpecifications.activeEventsByCreator(user.id)
        val eventPage = eventRepository.findAll(spec, pageable)
        val eventResponses = eventMapper.toEventResponseList(eventPage.content)

        return PageImpl(eventResponses, pageable, eventPage.totalElements)
    }

    @Cacheable(value = ["events"], key = "#id")
    @Transactional(readOnly = true)
    fun getEventById(id: Long): EventResponse {
        val event = eventRepository.findById(id).orElseThrow()
        return eventMapper.toEventResponse(event)
    }

    @Caching(
        evict = [
            CacheEvict(value = ["events"], allEntries = true),
            CacheEvict(value = ["events"], key = "#id")
        ]
    )
    @Transactional
    fun updateEvent(
        id: Long,
        request: UpdateEventRequest,
        currentUserEmail: String
    ): EventResponse {
        val event = authorizationService.requireEventOwnership(id, currentUserEmail)

        eventLifecycleValidator.validateUpdateAllowed(event)
        request.maxParticipants?.let { eventCapacityService.validateCapacityChange(id, it) }
        if (request.eventDateTime != null || request.endDateTime != null) {
            eventLifecycleValidator.validateDateChangeAllowed(
                event,
                request.eventDateTime,
                request.endDateTime
            )
        }
        eventDateValidator.validateEventDatesForUpdate(
            request.eventDateTime,
            event.eventDateTime,
            request.endDateTime,
            event.endDateTime,
            request.registrationDeadline,
            event.registrationDeadline
        )

        request.title?.let { event.title = it }
        request.description?.let { event.description = it }
        request.location?.let { event.location = it }
        request.eventDateTime?.let { event.eventDateTime = it }
        request.endDateTime?.let { event.endDateTime = it }
        request.registrationDeadline?.let { event.registrationDeadline = it }
        request.maxParticipants?.let { event.maxParticipants = it }
        request.waitlistEnabled?.let { event.waitlistEnabled = it }
        request.tags?.let {
            event.tags.clear()
            event.tags.addAll(it)
        }

        val updatedEvent = eventRepository.save(event)
        logger.info("Updated event ID: $id by user: $currentUserEmail")
        return eventMapper.toEventResponse(updatedEvent)
    }

    @Caching(
        evict = [
            CacheEvict(value = ["events"], allEntries = true),
            CacheEvict(value = ["events"], key = "#id")
        ]
    )
    @Transactional
    fun deleteEvent(id: Long, currentUserEmail: String) {
        val event = authorizationService.requireEventOwnership(id, currentUserEmail)
        eventLifecycleValidator.validateDeletionAllowed(event)
        eventRepository.delete(event)
        logger.info("Deleted event ID: $id by user: $currentUserEmail")
    }

    /**
     * Cancel an event with a reason
     * Validates cancellation rules and notifies participants
     */
    @Caching(
        evict = [
            CacheEvict(value = ["events"], allEntries = true),
            CacheEvict(value = ["events"], key = "#id")
        ]
    )
    @Transactional
    fun cancelEvent(id: Long, reason: String?, currentUserEmail: String): EventResponse {
        val event = authorizationService.requireEventOwnership(id, currentUserEmail)
        eventLifecycleValidator.validateCancellationAllowed(event, reason)

        val from = event.status
        event.status = EventStatus.CANCELLED
        event.cancelReason = reason
        event.cancelledAt = java.time.LocalDateTime.now()

        val savedEvent = eventRepository.save(event)

        eventQueueService.queueEvent(
            EventLifecycleEvent(
                eventId = savedEvent.id,
                from = from,
                to = EventStatus.CANCELLED,
                reason = reason
            )
        )

        logger.info(
            "Cancelled event ID: $id by user: $currentUserEmail with reason: $reason"
        )
        return eventMapper.toEventResponse(savedEvent)
    }
}
