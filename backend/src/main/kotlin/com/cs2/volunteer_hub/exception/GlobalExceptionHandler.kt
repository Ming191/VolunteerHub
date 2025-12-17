package com.cs2.volunteer_hub.exception

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.HttpMediaTypeNotSupportedException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.multipart.MaxUploadSizeExceededException
import org.springframework.web.servlet.NoHandlerFoundException

/**
 * Global exception handler for all REST controllers
 * Provides consistent error responses and logging
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    /**
     * Handle validation errors (e.g., @Valid annotation failures)
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, Any>> {
        val errors = ex.bindingResult.fieldErrors.associate {
            it.field to (it.defaultMessage ?: "Invalid value")
        }

        logger.warn("Validation failed: $errors")

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(mapOf(
                "error" to "Validation failed",
                "details" to errors
            ))
    }

    /**
     * Handle unsupported media type errors (e.g., wrong Content-Type)
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException::class)
    fun handleMediaTypeNotSupported(ex: HttpMediaTypeNotSupportedException): ResponseEntity<Map<String, Any>> {
        val supportedTypes = ex.supportedMediaTypes.joinToString(", ")
        val message = "Content-Type '${ex.contentType}' is not supported. Supported types: $supportedTypes"

        logger.warn("Unsupported media type: ${ex.contentType}")

        return ResponseEntity
            .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
            .body(mapOf(
                "error" to message,
                "receivedContentType" to (ex.contentType?.toString() ?: "unknown"),
                "supportedContentTypes" to ex.supportedMediaTypes.map { it.toString() }
            ))
    }

    /**
     * Handle malformed JSON or request body parsing errors
     */
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleMessageNotReadable(ex: HttpMessageNotReadableException): ResponseEntity<Map<String, String>> {
        logger.warn("Malformed request body: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(mapOf(
                "error" to "Malformed request body. Please check your JSON syntax."
            ))
    }

    /**
     * Handle method argument type mismatch (e.g., passing string for Long)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleTypeMismatch(ex: MethodArgumentTypeMismatchException): ResponseEntity<Map<String, String>> {
        val message = "Invalid value '${ex.value}' for parameter '${ex.name}'. Expected type: ${ex.requiredType?.simpleName}"

        logger.warn("Type mismatch: $message")

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(mapOf("error" to message))
    }

    /**
     * Handle access denied (403 Forbidden)
     */
    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException): ResponseEntity<Map<String, String>> {
        logger.warn("Access denied: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(mapOf("error" to "You do not have permission to access this resource"))
    }

    /**
     * Handle custom UnauthorizedAccessException (403 Forbidden)
     */
    @ExceptionHandler(UnauthorizedAccessException::class)
    fun handleUnauthorizedAccess(ex: UnauthorizedAccessException): ResponseEntity<Map<String, String>> {
        logger.warn("Unauthorized access: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(mapOf("error" to (ex.message ?: "Access denied")))
    }

    /**
     * Handle bad credentials (401 Unauthorized)
     */
    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(ex: BadCredentialsException): ResponseEntity<Map<String, String>> {
        logger.warn("Bad credentials: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(mapOf("error" to "Invalid email or password"))
    }

    /**
     * Handle not found errors (404)
     */
    @ExceptionHandler(NoHandlerFoundException::class)
    fun handleNotFound(ex: NoHandlerFoundException): ResponseEntity<Map<String, String>> {
        logger.warn("Endpoint not found: ${ex.requestURL}")

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(mapOf("error" to "Endpoint not found: ${ex.requestURL}"))
    }

    /**
     * Handle method not allowed (405)
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException::class)
    fun handleMethodNotSupported(ex: HttpRequestMethodNotSupportedException): ResponseEntity<Map<String, Any>> {
        val message = "Method '${ex.method}' is not supported for this endpoint"
        val supportedMethods = ex.supportedHttpMethods?.joinToString(", ") ?: "N/A"

        logger.warn("Method not supported: ${ex.method}")

        return ResponseEntity
            .status(HttpStatus.METHOD_NOT_ALLOWED)
            .body(mapOf(
                "error" to message,
                "supportedMethods" to supportedMethods
            ))
    }

    /**
     * Handle file upload size exceeded
     */
    @ExceptionHandler(MaxUploadSizeExceededException::class)
    fun handleMaxUploadSizeExceeded(ex: MaxUploadSizeExceededException): ResponseEntity<Map<String, String>> {
        logger.warn("File upload size exceeded: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body(mapOf(
                "error" to "File size exceeds maximum allowed size. Please upload smaller files."
            ))
    }

    /**
     * Handle custom BadRequestException
     */
    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequest(ex: BadRequestException): ResponseEntity<Map<String, String>> {
        logger.warn("Bad request: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(mapOf("error" to (ex.message ?: "Bad request")))
    }

    /**
     * Handle custom ResourceNotFoundException
     */
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(ex: ResourceNotFoundException): ResponseEntity<Map<String, String>> {
        logger.warn("Resource not found: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(mapOf("error" to (ex.message ?: "Resource not found")))
    }

    /**
     * Handle all other unexpected exceptions (500 Internal Server Error)
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<Map<String, String>> {
        logger.error("Unexpected error: ${ex.message}", ex)

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(mapOf(
                "error" to "An unexpected error occurred. Please try again later.",
                "message" to (ex.message ?: "Unknown error")
            ))
    }
}
