package com.cs2.volunteer_hub.service

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker
import io.github.resilience4j.timelimiter.annotation.TimeLimiter
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Service
import java.util.concurrent.CompletableFuture

/**
 * Resilient wrapper service for RabbitMQ operations with circuit breaker protection
 */
@Service
class ResilientRabbitService(
    private val rabbitTemplate: RabbitTemplate,
    private val pendingMessageService: PendingMessageService
) {
    private val logger = LoggerFactory.getLogger(ResilientRabbitService::class.java)

    /**
     * Send message to RabbitMQ queue with circuit breaker protection
     * @param exchange Exchange name (empty string for default exchange)
     * @param routingKey Routing key / queue name
     * @param message Message object to send
     * @return CompletableFuture<Boolean> indicating success/failure
     */
    @CircuitBreaker(name = "rabbitmq", fallbackMethod = "sendMessageFallback")
    @TimeLimiter(name = "rabbitmq")
    fun sendMessage(exchange: String, routingKey: String, message: Any): CompletableFuture<Boolean> {
        return CompletableFuture.supplyAsync {
            try {
                logger.debug("Sending message to RabbitMQ - Exchange: $exchange, RoutingKey: $routingKey")
                rabbitTemplate.convertAndSend(exchange, routingKey, message)
                true
            } catch (e: Exception) {
                logger.error("Failed to send message to RabbitMQ: ${e.message}", e)
                throw e
            }
        }
    }

    /**
     * Fallback method when RabbitMQ circuit breaker is open
     * Stores the message in database for later retry
     */
    @Suppress("UNUSED_PARAMETER")
    private fun sendMessageFallback(exchange: String, routingKey: String, message: Any, throwable: Throwable): CompletableFuture<Boolean> {
        logger.warn("RabbitMQ circuit breaker activated. Storing message to pending queue. Reason: ${throwable.message}")
        logger.warn("Message type: ${message::class.simpleName}, Exchange: $exchange, RoutingKey: $routingKey")
        
        return CompletableFuture.supplyAsync {
            try {
                pendingMessageService.storePendingMessage(exchange, routingKey, message)
                true
            } catch (e: Exception) {
                logger.error("Failed to store pending message: ${e.message}", e)
                false
            }
        }
    }

    /**
     * Send message without circuit breaker (for internal/critical operations)
     * Use this only for operations that should not be circuit-broken
     */
    fun sendMessageDirect(exchange: String, routingKey: String, message: Any) {
        logger.debug("Sending direct message (no circuit breaker) to RabbitMQ - Exchange: $exchange, RoutingKey: $routingKey")
        rabbitTemplate.convertAndSend(exchange, routingKey, message)
    }
}
