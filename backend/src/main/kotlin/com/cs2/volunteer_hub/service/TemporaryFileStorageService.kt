package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.exception.InternalServerException
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.UUID

@Service
class TemporaryFileStorageService {

    private val uploadDir: Path = Paths.get("/tmp/temp-uploads")

    init {
        try {
            Files.createDirectories(uploadDir)
        } catch (e: Exception) {
            throw RuntimeException("Unable to create tmp file:", e)
        }
    }

    fun save(file: MultipartFile): String {
        val uniqueFileName = "${UUID.randomUUID()}-${file.originalFilename?.replace(" ", "_")}"
        try {
            val filePath = this.uploadDir.resolve(uniqueFileName)
            Files.copy(file.inputStream, filePath)
            return filePath.toAbsolutePath().toString()
        } catch (e: Exception) {
            throw InternalServerException("Unable to save tmp file: ${e.message}")
        }
    }

    fun read(filePath: String): ByteArray {
        try {
            val path = Paths.get(filePath)
            return Files.readAllBytes(path)
        } catch (e: Exception) {
            throw InternalServerException("Unable to read tmp file: ${e.message}")
        }
    }

    fun delete(filePath: String) {
        try {
            val path = Paths.get(filePath)
            Files.deleteIfExists(path)
        } catch (e: Exception) {
            println("Unable to delete tmp file:: $filePath, ${e.message}")
        }
    }
}