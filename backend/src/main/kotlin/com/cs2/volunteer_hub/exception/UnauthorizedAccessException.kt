package com.cs2.volunteer_hub.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.FORBIDDEN)
class UnauthorizedAccessException(message: String) : RuntimeException(message)