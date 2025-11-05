package com.cs2.volunteer_hub.model

enum class EventStatus {
    DRAFT,        // Event created but not yet published
    PENDING,      // Awaiting admin approval
    PUBLISHED,    // Approved and visible to users
    CANCELLED,    // Event cancelled by organizer or admin
    COMPLETED     // Event has finished
}

