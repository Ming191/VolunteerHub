package com.cs2.volunteer_hub.dto

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = VerificationEmailMessage::class, name = "verification"),
    JsonSubTypes.Type(value = WelcomeEmailMessage::class, name = "welcome"),
    JsonSubTypes.Type(value = EventApprovedEmailMessage::class, name = "eventApproved"),
    JsonSubTypes.Type(value = EventRejectedEmailMessage::class, name = "eventRejected"),
    JsonSubTypes.Type(value = EventCancelledEmailMessage::class, name = "eventCancelled"),
    JsonSubTypes.Type(value = RegistrationStatusEmailMessage::class, name = "registrationStatus")
)
sealed class EmailMessage {
    abstract val to: String
    abstract val name: String
}

data class VerificationEmailMessage(
    override val to: String,
    override val name: String,
    val token: String
) : EmailMessage()

data class WelcomeEmailMessage(
    override val to: String,
    override val name: String
) : EmailMessage()

data class EventApprovedEmailMessage(
    override val to: String,
    override val name: String,
    val eventTitle: String,
    val eventId: Long
) : EmailMessage()

data class EventRejectedEmailMessage(
    override val to: String,
    override val name: String,
    val eventTitle: String,
    val reason: String
) : EmailMessage()

data class EventCancelledEmailMessage(
    override val to: String,
    override val name: String,
    val eventTitle: String,
    val cancelReason: String
) : EmailMessage()

data class RegistrationStatusEmailMessage(
    override val to: String,
    override val name: String,
    val eventTitle: String,
    val status: String
) : EmailMessage()
