package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.service.PendingMessageService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/pending-messages")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Pending Messages", description = "Manage RabbitMQ pending message queue")
class AdminPendingMessagesController(
    private val pendingMessageService: PendingMessageService
) {

    @Operation(
        summary = "Get pending message statistics",
        description = "Get counts of messages by status (pending, processing, sent, failed, expired)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @GetMapping("/stats")
    fun getPendingMessageStats(): ResponseEntity<Map<String, Long>> {
        val stats = pendingMessageService.getPendingMessageStats()
        return ResponseEntity.ok(stats)
    }

    @Operation(
        summary = "Retry a failed message",
        description = "Manually retry a specific pending message by ID. Useful for messages that failed after max retries.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @PostMapping("/{messageId}/retry")
    fun retryMessage(@PathVariable messageId: Long): ResponseEntity<Map<String, Any>> {
        val success = pendingMessageService.retryMessage(messageId)
        
        return if (success) {
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Message $messageId queued for retry"
            ))
        } else {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to "Failed to retry message $messageId. It may already be sent or not exist."
            ))
        }
    }
}
