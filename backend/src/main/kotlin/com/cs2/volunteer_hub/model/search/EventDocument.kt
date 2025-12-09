package com.cs2.volunteer_hub.model.search

import com.cs2.volunteer_hub.model.EventTag
import java.time.LocalDateTime
import org.springframework.data.annotation.Id
import org.springframework.data.elasticsearch.annotations.Document
import org.springframework.data.elasticsearch.annotations.Field
import org.springframework.data.elasticsearch.annotations.FieldType
import org.springframework.data.elasticsearch.annotations.GeoPointField
import org.springframework.data.elasticsearch.core.geo.GeoPoint

@Document(indexName = "events")
data class EventDocument(
        @Id val id: String,
        @Field(type = FieldType.Text, analyzer = "english") val title: String,
        @Field(type = FieldType.Text, analyzer = "english") val description: String,
        @Field(type = FieldType.Text) val location: String,
        @Field(type = FieldType.Keyword) val tags: Set<EventTag> = emptySet(),
        @Field(type = FieldType.Date) val eventDateTime: LocalDateTime,
        @Field(type = FieldType.Date) val endDateTime: LocalDateTime,
        @Field(type = FieldType.Keyword) val status: String,
        @Field(type = FieldType.Boolean) val isApproved: Boolean,
        @GeoPointField val coordinates: GeoPoint? = null // For future use if we geocode locations
)
