package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.dto.CreateEventRequest
import com.cs2.volunteer_hub.dto.EventResponse
import com.cs2.volunteer_hub.dto.UpdateEventRequest
import com.cs2.volunteer_hub.service.EventService
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
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
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/events")
class EventController(private val eventService: EventService) {

    private val logger = LoggerFactory.getLogger(EventController::class.java)

    @GetMapping
    fun getAllEvents(): ResponseEntity<List<EventResponse>> {
        val events = eventService.getAllApprovedEvents()
        return ResponseEntity.ok(events)
    }

    @GetMapping("/{id}")
    fun getEventById(@PathVariable id: Long): ResponseEntity<EventResponse> {
        val event = eventService.getEventById(id)
        return ResponseEntity.ok(event)
    }

    @PostMapping
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    fun createEvent(
        @Valid @RequestBody request: CreateEventRequest,
        @AuthenticationPrincipal currentUser: UserDetails
    ): ResponseEntity<Any> {
        logger.info("=== CREATE EVENT ENDPOINT CALLED ===")
        logger.info("Current user: ${currentUser.username}")
        logger.info("User authorities: ${currentUser.authorities.map { it.authority }}")
        logger.info("Request: title=${request.title}, location=${request.location}, dateTime=${request.eventDateTime}")

        val event = eventService.createEvent(request, currentUser.username)
        logger.info("Event created successfully with ID: ${event.id}")
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