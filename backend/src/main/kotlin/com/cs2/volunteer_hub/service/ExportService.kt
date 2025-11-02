package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.repository.EventRepository
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVPrinter
import org.springframework.stereotype.Service
import java.io.Writer

@Service
class ExportService(private val eventRepository: EventRepository) {
    fun writeEventsToCsv(writer: Writer) {
        val events = eventRepository.findAll()
        CSVPrinter(writer, CSVFormat.DEFAULT).use { csvPrinter ->
            csvPrinter.printRecord("ID", "Title", "Location", "DateTime", "Status", "Category", "CreatorID")

            for (event in events) {
                csvPrinter.printRecord(
                    event.id,
                    event.title,
                    event.location,
                    event.eventDateTime.toString(),
                    event.status.name,
                    event.category.name,
                    event.creator.id
                )
            }
        }
    }
}