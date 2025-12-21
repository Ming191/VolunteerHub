package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventCreationMessage
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.PublicAttendeeResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.mapper.EventMapper
import com.cs2.volunteer_hub.mapper.RegistrationMapper
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.EventStatus
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.model.RegistrationStatus
import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.ImageRepository
import com.cs2.volunteer_hub.repository.RegistrationRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.repository.findByEmailOrThrow
import com.cs2.volunteer_hub.repository.findByIdOrThrow
import com.cs2.volunteer_hub.specification.EventSpecifications
import com.cs2.volunteer_hub.validation.EventCoordinateValidator
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
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.springframework.web.multipart.MultipartFile

@Service
class EventService(
        private val eventRepository: EventRepository,
        private val userRepository: UserRepository,
        private val imageRepository: ImageRepository,
        private val rabbitTemplate: RabbitTemplate,
        private val fileValidationService: FileValidationService,
        private val eventMapper: EventMapper,
        private val eventCapacityService: EventCapacityService,
        private val authorizationService: AuthorizationService,
        private val eventDateValidator: EventDateValidator,
        private val eventLifecycleValidator: EventLifecycleValidator,
        private val eventQueueService: EventQueueService,
        private val eventCoordinateValidator: EventCoordinateValidator,
        private val registrationRepository: RegistrationRepository,
        private val registrationMapper: RegistrationMapper,
        @field:Value("\${upload.max-files-per-event:10}") private val maxFilesPerEvent: Int = 10
) {
        private val logger = LoggerFactory.getLogger(EventService::class.java)

        @CacheEvict(value = ["events", "organizerDashboard", "organizerAnalytics", "adminDashboard"], allEntries = true)
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

                eventCoordinateValidator.validateCoordinates(request.latitude, request.longitude)

                val newEvent =
                        Event(
                                title = request.title,
                                description = request.description,
                                location = request.location,
                                latitude = request.latitude,
                                longitude = request.longitude,
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
                                                        RabbitMQConfig
                                                                .EVENT_CREATION_PENDING_ROUTING_KEY,
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
                val event = eventRepository.findByIdOrThrow(id)
                return eventMapper.toEventResponse(event)
        }

        @Transactional(readOnly = true)
        fun getPublicAttendees(
                eventId: Long,
                currentUserEmail: String
        ): List<PublicAttendeeResponse> {
                val user = userRepository.findByEmailOrThrow(currentUserEmail)
                val event = eventRepository.findByIdOrThrow(eventId)

                // 1. Get all approved registrations
                val approvedRegistrations =
                        registrationRepository.findAllByEventIdAndStatusWithAssociations(
                                eventId,
                                RegistrationStatus.APPROVED
                        )

                // 2. Security Check: Current user must be Organizer or an Approved Participant

                val isCreator = event.creator.id == user.id
                val isApprovedParticipant = approvedRegistrations.any { it.user.id == user.id }

                if (!isCreator && !isApprovedParticipant) {
                        // Check if user is an admin? Maybe. But for now strict.
                        if (user.role != com.cs2.volunteer_hub.model.Role.ADMIN) {
                                throw AccessDeniedException(
                                        "Only approved participants or the organizer can view the attendee list."
                                )
                        }
                }

                return approvedRegistrations.map { registrationMapper.toPublicAttendeeResponse(it) }
        }

        @Caching(
                evict =
                        [
                                CacheEvict(value = ["events"], allEntries = true),
                                CacheEvict(value = ["events"], key = "#id")]
        )
        @Transactional
        fun updateEvent(
                id: Long,
                request: UpdateEventRequest,
                currentUserEmail: String,
                files: List<MultipartFile>?
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
                eventCoordinateValidator.validateCoordinatesForUpdate(
                        request.latitude,
                        event.latitude,
                        request.longitude,
                        event.longitude
                )

                request.title?.let { event.title = it }
                request.description?.let { event.description = it }
                request.location?.let { event.location = it }
                request.latitude?.let { event.latitude = it }
                request.longitude?.let { event.longitude = it }
                request.eventDateTime?.let { event.eventDateTime = it }
                request.endDateTime?.let { event.endDateTime = it }
                request.registrationDeadline?.let { event.registrationDeadline = it }
                request.maxParticipants?.let { event.maxParticipants = it }
                request.waitlistEnabled?.let { event.waitlistEnabled = it }
                request.tags?.let {
                        event.tags.clear()
                        event.tags.addAll(it)
                }

                request.existingImageUrls?.let { keepUrls ->
                        event.images.removeIf { image ->
                                image.url != null && !keepUrls.contains(image.url)
                        }
                }

                if (!files.isNullOrEmpty()) {
                        val currentImageCount = event.images.size
                        if (currentImageCount + files.size > maxFilesPerEvent) {
                                throw IllegalArgumentException(
                                        "Total images would exceed maximum of $maxFilesPerEvent"
                                )
                        }
                        fileValidationService.validateFiles(files, maxFilesPerEvent)
                        fileValidationService.processFilesForEvent(files, event)
                }
                val updatedEvent = eventRepository.save(event)
                logger.info("Updated event ID: $id by user: $currentUserEmail")

                val hasPendingImages =
                        updatedEvent.images.any {
                                it.status == com.cs2.volunteer_hub.model.ImageStatus.PENDING_UPLOAD
                        }

                if (hasPendingImages) {
                        val message =
                                EventCreationMessage(eventId = updatedEvent.id, retryCount = 0)

                        TransactionSynchronizationManager.registerSynchronization(
                                object : TransactionSynchronization {
                                        override fun afterCommit() {
                                                rabbitTemplate.convertAndSend(
                                                        RabbitMQConfig.EXCHANGE_NAME,
                                                        RabbitMQConfig
                                                                .EVENT_CREATION_PENDING_ROUTING_KEY,
                                                        message
                                                )
                                                logger.info(
                                                        "Sent event creation message to queue for Event ID: ${updatedEvent.id} (Update)"
                                                )
                                        }
                                }
                        )
                }

                return eventMapper.toEventResponse(updatedEvent)
        }

        @Caching(
                evict =
                        [
                                CacheEvict(value = ["events"], allEntries = true),
                                CacheEvict(value = ["events"], key = "#id")]
        )
        @Transactional
        fun deleteEvent(id: Long, currentUserEmail: String) {
                val event = authorizationService.requireEventOwnership(id, currentUserEmail)
                eventLifecycleValidator.validateDeletionAllowed(event)
                eventRepository.delete(event)
                logger.info("Deleted event ID: $id by user: $currentUserEmail")
        }

        /** Cancel an event with a reason Validates cancellation rules and notifies participants */
        @Caching(
                evict =
                        [
                                CacheEvict(value = ["events"], allEntries = true),
                                CacheEvict(value = ["events"], key = "#id")]
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

        @Transactional(readOnly = true)
        fun getEventGallery(
                eventId: Long,
                pageable: Pageable
        ): com.cs2.volunteer_hub.dto.PageGalleryImageResponse {
                // Ensure event exists
                eventRepository.findByIdOrThrow(eventId)

                val imagePage =
                        imageRepository.findAllByEventIncludingPosts(
                                eventId,
                                ImageStatus.UPLOADED,
                                pageable
                        )

                val galleryImages =
                        imagePage.content.mapNotNull { image ->
                                eventMapper.toGalleryImageResponse(image, eventId)
                        }
                val resultPage = PageImpl(galleryImages, pageable, imagePage.totalElements)
                return com.cs2.volunteer_hub.dto.PageGalleryImageResponse.from(resultPage)
        }
}
