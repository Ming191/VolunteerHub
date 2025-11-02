package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.EventRepository
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
    @field:Value($$"${upload.max-files-per-event:10}") private val maxFilesPerEvent: Int = 10
) {
    private val logger = LoggerFactory.getLogger(EventService::class.java)

    @CacheEvict(value = ["events"], allEntries = true)
    @Transactional
    fun createEvent(request: CreateEventRequest, creatorEmail: String, files: List<MultipartFile>?): EventResponse {
        val creator = userRepository.findByEmail(creatorEmail)
            ?: throw ResourceNotFoundException("User", "email", creatorEmail)

        files?.let { fileValidationService.validateFiles(it, maxFilesPerEvent) }

        val newEvent = Event(
            title = request.title,
            description = request.description,
            location = request.location,
            eventDateTime = request.eventDateTime,
            eventEndDateTime = request.eventEndDateTime,
            category = request.category,
            maxVolunteers = request.maxVolunteers,
            minVolunteers = request.minVolunteers,
            registrationDeadline = request.registrationDeadline,
            requirements = request.requirements,
            benefits = request.benefits,
            creator = creator,
            status = EventStatus.PENDING
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
        return eventRepository.findAllByStatusOrderByEventDateTimeAsc(EventStatus.APPROVED)
            .stream()
            .map(eventMapper::toEventResponse)
            .collect(Collectors.toList())
    }

    /**
     * Get all approved events with pagination support
     */
    @Transactional(readOnly = true)
    fun getAllApprovedEvents(pageable: Pageable): Page<EventResponse> {
        return eventRepository.findAllByStatusOrderByEventDateTimeAsc(EventStatus.APPROVED, pageable)
            .map(eventMapper::toEventResponse)
    }

    @Cacheable(value = ["event"], key = "#id")
    @Transactional(readOnly = true)
    fun getEventById(id: Long): EventResponse {
        val event = eventRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Event", "id", id) }
        return eventMapper.toEventResponse(event)
    }

    @Caching(evict = [
        CacheEvict(value = ["events"], allEntries = true),
        CacheEvict(value = ["event"], key = "#id")
    ])
    @Transactional
    fun updateEvent(id: Long, request: UpdateEventRequest, currentUserEmail: String): EventResponse {
        val event = eventRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Event", "id", id) }

        if (event.creator.email != currentUserEmail) {
            throw UnauthorizedAccessException("You do not have permission to edit this event.")
        }

        request.title?.let { event.title = it }
        request.description?.let { event.description = it }
        request.location?.let { event.location = it }
        request.eventDateTime?.let { event.eventDateTime = it }
        request.eventEndDateTime?.let { event.eventEndDateTime = it }
        request.category?.let { event.category = it }
        request.maxVolunteers?.let { event.maxVolunteers = it }
        request.minVolunteers?.let { event.minVolunteers = it }
        request.registrationDeadline?.let { event.registrationDeadline = it }
        request.requirements?.let { event.requirements = it }
        request.benefits?.let { event.benefits = it }

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
        val event = eventRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Event", "id", id) }

        if (event.creator.email != currentUserEmail) {
            throw UnauthorizedAccessException("You do not have permission to delete this event.")
        }

        eventRepository.delete(event)
        logger.info("Deleted event ID: $id by user: $currentUserEmail")
    }
}