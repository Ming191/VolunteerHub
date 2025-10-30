package com.cs2.volunteer_hub.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.CONFLICT)
class ConflictException(message: String) : RuntimeException(message)