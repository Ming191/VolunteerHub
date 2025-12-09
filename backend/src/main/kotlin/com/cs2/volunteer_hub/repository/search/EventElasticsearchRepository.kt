package com.cs2.volunteer_hub.repository.search

import com.cs2.volunteer_hub.model.search.EventDocument
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository
import org.springframework.stereotype.Repository

@Repository
interface EventElasticsearchRepository : ElasticsearchRepository<EventDocument, String> {
    fun findByTitleContainingOrDescriptionContaining(
            title: String,
            description: String
    ): List<EventDocument>
}
