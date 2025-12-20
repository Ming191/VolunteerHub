package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.repository.EventRepository
import com.cs2.volunteer_hub.repository.UserRepository
import com.cs2.volunteer_hub.model.Event
import com.cs2.volunteer_hub.model.User
import java.io.Writer
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVPrinter
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ExportService(
        private val eventRepository: EventRepository,
        private val userRepository: UserRepository
) {
    @Transactional(readOnly = true)
    fun writeEventsToCsv(writer: Writer) {
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

            var pageNumber = 0
            val pageSize = 500
            var page: Page<Event>

            do {
                page = eventRepository.findAll(PageRequest.of(pageNumber, pageSize))
                for (event in page.content) {
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
                pageNumber++
                writer.flush()
            } while (page.hasNext())
        }
    }

    fun writeUsersToCsv(writer: Writer) {
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

            var pageNumber = 0
            val pageSize = 500
            var page: Page<User>

            do {
                page = userRepository.findAll(PageRequest.of(pageNumber, pageSize))
                for (user in page.content) {
                    csvPrinter.printRecord(
                        user.id,
                        user.name,
                        user.email,
                        user.phoneNumber ?: "",
                        user.role.name,
                        user.isEmailVerified,
                        user.isLocked,
                        user.location ?: "",
                        user.createdAt.toString()
                    )
                }
                pageNumber++
                writer.flush()
            } while (page.hasNext())
        }
    }
}
