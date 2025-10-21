package com.cs2.volunteer_hub.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.MethodArgumentNotValidException
import java.time.LocalDateTime

@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, Any>>  {
        val errors = ex.bindingResult.fieldErrors.map {it.defaultMessage}
        val errorDetails = mapOf(
            "timestamp" to LocalDateTime.now(),
            "status" to HttpStatus.BAD_REQUEST.value(),
            "errors" to "Validation failed",
            "message" to  errors
        )
        return ResponseEntity(errorDetails, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(IllegalStateException::class)
    fun handleIllegalStateException(ex: IllegalStateException): ResponseEntity<Map<String, Any>> {
        val errorDetails = mapOf(
            "timestamp" to LocalDateTime.now(),
            "status" to HttpStatus.CONFLICT.value(),
            "error" to "Conflict",
            "message" to (ex.message ?: "An unexpected error occurred")
        )
        return ResponseEntity(errorDetails, HttpStatus.CONFLICT)
    }

    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequestException(ex: BadRequestException): ResponseEntity<Map<String, Any>> {
        val errorDetails = mapOf(
            "timestamp" to LocalDateTime.now(),
            "status" to HttpStatus.BAD_REQUEST.value(),
            "error" to "Bad Request",
            "message" to (ex.message ?: "Yêu cầu không hợp lệ")
        )
        return ResponseEntity(errorDetails, HttpStatus.BAD_REQUEST)
    }
}