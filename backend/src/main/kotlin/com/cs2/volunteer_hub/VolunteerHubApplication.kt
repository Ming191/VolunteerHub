package com.cs2.volunteer_hub

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching
import org.springframework.retry.annotation.EnableRetry

@SpringBootApplication
@EnableCaching
@EnableRetry
class VolunteerHubApplication

fun main(args: Array<String>) {
	runApplication<VolunteerHubApplication>(*args)
}
