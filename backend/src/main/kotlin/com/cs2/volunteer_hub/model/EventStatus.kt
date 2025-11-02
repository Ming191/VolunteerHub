package com.cs2.volunteer_hub.model

enum class EventStatus {
    DRAFT,          // Event created but not submitted for approval
    PENDING,        // Waiting for admin approval
    APPROVED,       // Approved and visible to volunteers
    CANCELLED,      // Event cancelled
    COMPLETED       // Event has finished
}