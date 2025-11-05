package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import com.cs2.volunteer_hub.validation.EventDateValidator
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.Caching
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.springframework.web.multipart.MultipartFile
import java.util.stream.Collectors

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
    @field:Value($$"${upload.max-files-per-event:10}") private val maxFilesPerEvent: Int = 10
) {
    private val logger = LoggerFactory.getLogger(EventService::class.java)

    @CacheEvict(value = ["events"], allEntries = true)
    @Transactional
    fun createEvent(request: CreateEventRequest, creatorEmail: String, files: List<MultipartFile>?): EventResponse {
        val creator = userRepository.findByEmailOrThrow(creatorEmail)

        files?.let { fileValidationService.validateFiles(it, maxFilesPerEvent) }

        // Validate date range using centralized validator
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
            waitlistEnabled = request.waitlistEnabled
        )

        if (!files.isNullOrEmpty()) {
            fileValidationService.processFilesForEvent(files, newEvent)
        }

        val savedEvent = eventRepository.save(newEvent)
        logger.info("Created event ID: ${savedEvent.id} with ${savedEvent.images.size} images pending upload")

        if (savedEvent.images.isNotEmpty()) {
            val message = EventCreationMessage(eventId = savedEvent.id)

            TransactionSynchronizationManager.registerSynchronization(object : TransactionSynchronization {
                override fun afterCommit() {
                    rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE_NAME,
                        RabbitMQConfig.EVENT_CREATION_PENDING_ROUTING_KEY,
                        message
                    )
                    logger.info("Sent event creation message to queue for Event ID: ${savedEvent.id}")
                }
            })
        } else {
            eventRepository.save(savedEvent)
        }

        return eventMapper.toEventResponse(savedEvent)
    }

    @Cacheable("events")
    @Transactional(readOnly = true)
    fun getAllApprovedEvents(): List<EventResponse> {
        return eventRepository.findAllByStatusOrderByEventDateTimeAsc(EventStatus.PUBLISHED)
            .stream()
            .map(eventMapper::toEventResponse)
            .collect(Collectors.toList())
    }

    /**
     * Get all approved events with pagination support
     */
    @Transactional(readOnly = true)
    fun getAllApprovedEvents(pageable: Pageable): Page<EventResponse> {
        return eventRepository.findAllByStatusOrderByEventDateTimeAsc(EventStatus.PUBLISHED, pageable)
            .map(eventMapper::toEventResponse)
    }

    @Cacheable(value = ["event"], key = "#id")
    @Transactional(readOnly = true)
    fun getEventById(id: Long): EventResponse {
        val event = eventRepository.findByIdOrThrow(id)

        if (!event.isApproved) {
            throw ResourceNotFoundException("Event", "id", id)
        }
        return eventMapper.toEventResponse(event)
    }

    @Caching(evict = [
        CacheEvict(value = ["events"], allEntries = true),
        CacheEvict(value = ["event"], key = "#id")
    ])
    @Transactional
    fun updateEvent(id: Long, request: UpdateEventRequest, currentUserEmail: String): EventResponse {
        val event = authorizationService.requireEventOwnership(id, currentUserEmail)

        // Validate capacity changes
        request.maxParticipants?.let {
            eventCapacityService.validateCapacityChange(id, it)
        }

        // Validate date changes using centralized validator
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

        val updatedEvent = eventRepository.save(event)
        logger.info("Updated event ID: $id by user: $currentUserEmail")
        return eventMapper.toEventResponse(updatedEvent)
    }

    @Caching(evict = [
        CacheEvict(value = ["events"], allEntries = true),
        CacheEvict(value = ["event"], key = "#id")
    ])
    @Transactional
    fun deleteEvent(id: Long, currentUserEmail: String) {
        val event = authorizationService.requireEventOwnership(id, currentUserEmail)

        eventRepository.delete(event)
        logger.info("Deleted event ID: $id by user: $currentUserEmail")
    }
}