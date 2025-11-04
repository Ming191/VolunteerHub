package com.cs2.volunteer_hub.validation

import jakarta.validation.Constraint
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext
import jakarta.validation.Payload
import kotlin.reflect.KClass

@Target(AnnotationTarget.FIELD, AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [StrongPassword.StrongPasswordValidator::class])
@MustBeDocumented
annotation class StrongPassword(
    val message: String = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = []
) {
    class StrongPasswordValidator : ConstraintValidator<StrongPassword, String> {

        companion object {
            private const val MIN_LENGTH = 8
            private const val MAX_LENGTH = 100

            // Regex patterns for password validation
            private val UPPERCASE_PATTERN = Regex(".*[A-Z].*")
            private val LOWERCASE_PATTERN = Regex(".*[a-z].*")
            private val DIGIT_PATTERN = Regex(".*\\d.*")
            private val SPECIAL_CHAR_PATTERN = Regex(".*[!@#\$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")
        }

        override fun isValid(password: String?, context: ConstraintValidatorContext): Boolean {
            if (password == null || password.isBlank()) {
                return false
            }

            val violations = mutableListOf<String>()

            // Check minimum length
            if (password.length < MIN_LENGTH) {
                violations.add("at least $MIN_LENGTH characters")
            }

            // Check maximum length
            if (password.length > MAX_LENGTH) {
                violations.add("no more than $MAX_LENGTH characters")
            }

            // Check for uppercase letter
            if (!UPPERCASE_PATTERN.matches(password)) {
                violations.add("at least one uppercase letter")
            }

            // Check for lowercase letter
            if (!LOWERCASE_PATTERN.matches(password)) {
                violations.add("at least one lowercase letter")
            }

            // Check for digit
            if (!DIGIT_PATTERN.matches(password)) {
                violations.add("at least one digit")
            }

            // Check for special character
            if (!SPECIAL_CHAR_PATTERN.matches(password)) {
                violations.add("at least one special character (!@#$%^&*()_+-=[]{};\':\"\\|,.<>/?)")
            }

            // If there are violations, customize the error message
            if (violations.isNotEmpty()) {
                context.disableDefaultConstraintViolation()
                val message = "Password must contain: ${violations.joinToString(", ")}"
                context.buildConstraintViolationWithTemplate(message)
                    .addConstraintViolation()
                return false
            }

            return true
        }
    }
}
