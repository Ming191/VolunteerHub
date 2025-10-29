package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.exception.ResourceNotFoundException
import com.cs2.volunteer_hub.exception.UnauthorizedAccessException
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.Image
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.EventRepository
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.util.stream.Collectors

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val userRepository: UserRepository,
    private val temporaryFileStorageService: TemporaryFileStorageService,
    private val rabbitTemplate: RabbitTemplate,
    @Value("\${upload.max-file-size:10485760}") private val maxFileSize: Long = 10 * 1024 * 1024, // 10MB default
    @Value("\${upload.max-files-per-event:10}") private val maxFilesPerEvent: Int = 10
) {
    private val logger = LoggerFactory.getLogger(EventService::class.java)

    private val ALLOWED_CONTENT_TYPES = setOf("image/jpeg", "image/png", "image/webp", "image/jpg")

    @Transactional
    fun createEvent(request: CreateEventRequest, creatorEmail: String, files: List<MultipartFile>?): EventResponse {
        val creator = userRepository.findByEmail(creatorEmail)
            ?: throw ResourceNotFoundException("User", "email", creatorEmail)

        // Validate files
        files?.let { validateFiles(it) }

        val newEvent = Event(
            title = request.title,
            description = request.description,
            location = request.location,
            eventDateTime = request.eventDateTime,
            creator = creator,
            isApproved = false
        )

        if (!files.isNullOrEmpty()) {
            files.forEach { file ->
                val tempPath = temporaryFileStorageService.save(file)
                val image = Image(
                    event = newEvent,
                    originalFileName = file.originalFilename ?: "unknown",
                    contentType = file.contentType ?: "application/octet-stream",
                    temporaryFilePath = tempPath
                )
                newEvent.images.add(image)
            }
        }

        val savedEvent = eventRepository.save(newEvent)
        logger.info("Created event ID: ${savedEvent.id} with ${savedEvent.images.size} images pending upload")

        // Send message to queue for async processing
        if (savedEvent.images.isNotEmpty()) {
            val message = EventCreationMessage(eventId = savedEvent.id)
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.EVENT_CREATION_PENDING_ROUTING_KEY,
                message
            )
            logger.info("Sent event creation message to queue for Event ID: ${savedEvent.id}")
        } else {
            // No images, auto-approve
            savedEvent.isApproved = true
            eventRepository.save(savedEvent)
            logger.info("Auto-approved event ID: ${savedEvent.id} (no images)")
        }

        return mapToEventResponse(savedEvent)
    }

    private fun validateFiles(files: List<MultipartFile>) {
        if (files.size > maxFilesPerEvent) {
            throw BadRequestException("Too many files. Maximum allowed: $maxFilesPerEvent, provided: ${files.size}")
        }

        files.forEach { file ->
            // Check file size
            if (file.size > maxFileSize) {
                throw BadRequestException(
                    "File '${file.originalFilename}' exceeds maximum size of ${maxFileSize / 1024 / 1024}MB. " +
                    "Actual size: ${file.size / 1024 / 1024}MB"
                )
            }

            // Check content type
            if (file.contentType !in ALLOWED_CONTENT_TYPES) {
                throw BadRequestException(
                    "Unsupported file type: ${file.contentType}. " +
                    "Allowed types: ${ALLOWED_CONTENT_TYPES.joinToString(", ")}"
                )
            }

            // Check file is not empty
            if (file.isEmpty) {
                throw BadRequestException("File '${file.originalFilename}' is empty")
            }
        }
    }

    @Transactional(readOnly = true)
    fun getAllApprovedEvents(): List<EventResponse> {
        return eventRepository.findAllByIsApprovedTrueOrderByEventDateTimeAsc()
            .stream()
            .map(this::mapToEventResponse)
            .collect(Collectors.toList())
    }

    @Transactional(readOnly = true)
    fun getEventById(id: Long): EventResponse {
        val event = eventRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Event", "id", id) }

        if (!event.isApproved) {
            throw ResourceNotFoundException("Event", "id", id)
        }
        return mapToEventResponse(event)
    }

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

        val updatedEvent = eventRepository.save(event)
        logger.info("Updated event ID: $id by user: $currentUserEmail")
        return mapToEventResponse(updatedEvent)
    }

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

    internal fun mapToEventResponse(event: Event): EventResponse {
        return EventResponse(
            id = event.id,
            title = event.title,
            imageUrls = event.images.mapNotNull { it.url },
            description = event.description,
            location = event.location,
            eventDateTime = event.eventDateTime,
            isApproved = event.isApproved,
            creatorName = event.creator.name
        )
    }
}