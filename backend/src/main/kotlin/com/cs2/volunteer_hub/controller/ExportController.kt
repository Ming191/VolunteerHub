package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.service.ExportService
import jakarta.servlet.http.HttpServletResponse
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/api/admin/export")
@PreAuthorize("hasRole('ADMIN')")
class ExportController(private val exportService: ExportService) {

    @GetMapping("/events.csv")
    fun exportEventsToCsv(response: HttpServletResponse) {
        response.contentType = "text/csv"
        val currentDateTime =
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"))
        response.setHeader(
            "Content-Disposition",
            "attachment; filename=events_$currentDateTime.csv"
        )
        exportService.writeEventsToCsv(response.writer)
    }

    @GetMapping("/users.csv")
    fun exportUsersToCsv(response: HttpServletResponse) {
        response.contentType = "text/csv"
        val currentDateTime =
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"))
        response.setHeader(
            "Content-Disposition",
            "attachment; filename=\"users_$currentDateTime.csv\""
        )
        exportService.writeUsersToCsv(response.writer)
    }
}
