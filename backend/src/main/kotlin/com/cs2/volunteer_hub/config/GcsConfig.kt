package com.cs2.volunteer_hub.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.storage.Storage
import com.google.cloud.storage.StorageOptions
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.Resource

@Configuration
class GcsConfig {

    @Value("\${gcp.credentials.path}")
    private lateinit var credentialsPath: Resource

    @Bean
    fun googleCloudStorage(): Storage {
        val credentials = GoogleCredentials.fromStream(credentialsPath.inputStream)
        return StorageOptions.newBuilder()
            .setCredentials(credentials)
            .build()
            .service
    }
}
