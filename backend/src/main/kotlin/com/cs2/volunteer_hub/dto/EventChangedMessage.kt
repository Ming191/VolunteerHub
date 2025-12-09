package com.cs2.volunteer_hub.dto

import java.io.Serializable

data class EventChangedMessage(val eventId: Long, val type: ChangeType) : Serializable

enum class ChangeType {
    CREATED,
    UPDATED,
    DELETED,
    CANCELLED
}
