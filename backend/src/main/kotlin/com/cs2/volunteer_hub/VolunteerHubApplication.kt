package com.cs2.volunteer_hub

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching
import org.springframework.retry.annotation.EnableRetry
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableCaching
@EnableRetry
@EnableScheduling
class VolunteerHubApplication

fun main(args: Array<String>) {
	runApplication<VolunteerHubApplication>(*args)
}
