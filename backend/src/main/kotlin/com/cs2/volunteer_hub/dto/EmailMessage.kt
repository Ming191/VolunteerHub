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
    JsonSubTypes.Type(value = WelcomeEmailMessage::class, name = "welcome")
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

