package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.service.EventSearchService
import com.cs2.volunteer_hub.service.EventService
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/events")
class EventController(
    private val eventService: EventService,
    private val eventSearchService: EventSearchService
) {

    private val logger = LoggerFactory.getLogger(EventController::class.java)

    @GetMapping
    fun getAllEvents(): ResponseEntity<List<EventResponse>> {
        val events = eventService.getAllApprovedEvents()
        return ResponseEntity.ok(events)
    }

    /**
     * Search approved events with optional filters
     * Example: GET /api/events/search?q=volunteer&upcoming=true
     */
    @GetMapping("/search")
    fun searchEvents(
        @RequestParam(required = false) q: String?,
        @RequestParam(defaultValue = "false") upcoming: Boolean
    ): ResponseEntity<List<EventResponse>> {
        val events = eventSearchService.searchApprovedEvents(searchText = q, onlyUpcoming = upcoming)
        return ResponseEntity.ok(events)
    }

    @GetMapping("/{id}")
    fun getEventById(@PathVariable id: Long): ResponseEntity<EventResponse> {
        val event = eventService.getEventById(id)
        return ResponseEntity.ok(event)
    }

    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun createEvent(
        @RequestPart("request") @Valid request: CreateEventRequest,
        @RequestPart("files", required = false) files: List<MultipartFile>?,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<EventResponse> {

        val event = eventService.createEvent(request, currentUser.username, files)
        return ResponseEntity.status(HttpStatus.CREATED).body(event)
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun updateEvent(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateEventRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<EventResponse> {
        logger.info("=== UPDATE EVENT ENDPOINT CALLED ===")
        logger.info("Event ID: $id, User: ${currentUser.username}")
        logger.info("User authorities: ${currentUser.authorities.map { it.authority }}")

        val updatedEvent = eventService.updateEvent(id, request, currentUser.username)
        return ResponseEntity.ok(updatedEvent)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun deleteEvent(
        @PathVariable id: Long,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Unit> {
        logger.info("=== DELETE EVENT ENDPOINT CALLED ===")
        logger.info("Event ID: $id, User: ${currentUser.username}")
        logger.info("User authorities: ${currentUser.authorities.map { it.authority }}")

        eventService.deleteEvent(id, currentUser.username)
        return ResponseEntity.noContent().build()
    }
}