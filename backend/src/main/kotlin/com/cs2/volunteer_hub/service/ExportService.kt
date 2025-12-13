package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.UserRepository
import java.io.Writer
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVPrinter
import org.springframework.stereotype.Service

@Service
class ExportService(
        private val eventRepository: EventRepository,
        private val userRepository: UserRepository
) {
    fun writeEventsToCsv(writer: Writer) {
        val events = eventRepository.findAll()
        CSVPrinter(writer, CSVFormat.DEFAULT).use { csvPrinter ->
            csvPrinter.printRecord(
                "ID",
                "Title",
                "Location",
                "Start DateTime",
                "End DateTime",
                "Status",
                "Creator ID",
                "Creator Name",
                "Created At"
            )

            for (event in events) {
                csvPrinter.printRecord(
                    event.id,
                    event.title,
                    event.location,
                    event.eventDateTime.toString(),
                    event.endDateTime.toString(),
                    event.status.toString(),
                    event.creator.id,
                    event.creator.name,
                    event.createdAt.toString()
                )
            }
        }
    }

    fun writeUsersToCsv(writer: Writer) {
        val users = userRepository.findAll()
        CSVPrinter(writer, CSVFormat.DEFAULT).use { csvPrinter ->
            csvPrinter.printRecord(
                "ID",
                "Name",
                "Email",
                "Phone",
                "Role",
                "Email Verified",
                "Is Locked",
                "Location",
                "Registration Date"
            )

            users.forEach { user ->
                csvPrinter.printRecord(
                    user.id,
                    user.name,
                    user.email,
                    user.phone ?: "",
                    user.role.toString(),
                    user.emailVerified,
                    user.isLocked,
                    user.location ?: "",
                    user.createdAt.toString()
                )
            }
        }
    }
