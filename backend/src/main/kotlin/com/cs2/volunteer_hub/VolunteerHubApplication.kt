package com.cs2.volunteer_hub

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching

@SpringBootApplication
@EnableCaching
class VolunteerHubApplication

fun main(args: Array<String>) {
	runApplication<VolunteerHubApplication>(*args)
}
