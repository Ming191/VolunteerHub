package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.PrometheusResponse
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker
import io.github.resilience4j.timelimiter.annotation.TimeLimiter
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder

/** Service for querying Prometheus metrics with circuit breaker protection */
@Service
class PrometheusClientService(private val restTemplate: RestTemplate) {
    private val logger = LoggerFactory.getLogger(PrometheusClientService::class.java)
    private val executor = Executors.newCachedThreadPool()

    @Value($$"${prometheus.url:http://localhost:9090}") private lateinit var prometheusUrl: String

    /**
     * Execute an instant query against Prometheus with circuit breaker protection
     * @param query PromQL query string
     * @return Prometheus response with results
     */
    @CircuitBreaker(name = "prometheus", fallbackMethod = "queryFallback")
    @TimeLimiter(name = "prometheus")
    fun query(query: String): CompletableFuture<PrometheusResponse?> {
        return CompletableFuture.supplyAsync(
                {
                    try {
                        val url = UriComponentsBuilder.fromUriString("$prometheusUrl/api/v1/query")
                                    .queryParam("query", query)
                                    .build()
                                    .toUri()
                        logger.debug("Querying Prometheus: $query")
                        restTemplate.getForObject(url, PrometheusResponse::class.java)
                    } catch (e: Exception) {
                        logger.error("Failed to query Prometheus: ${e.message}", e)
                        null
                    }
                },
                executor
        )
    }

    /** Fallback method for Prometheus queries when circuit is open or timeout occurs */
    private fun queryFallback(
            query: String,
            throwable: Throwable
    ): CompletableFuture<PrometheusResponse?> {
        logger.warn(
                "Prometheus circuit breaker activated for query: $query. Reason: ${throwable.message}"
        )
        return CompletableFuture.completedFuture(null)
    }

    /**
     * Execute a range query against Prometheus with circuit breaker protection
     * @param query PromQL query string
     * @param start Start timestamp (Unix time)
     * @param end End timestamp (Unix time)
     * @param step Query resolution step
     * @return Prometheus response with results
     */
    @CircuitBreaker(name = "prometheus", fallbackMethod = "queryRangeFallback")
    @TimeLimiter(name = "prometheus")
    fun queryRange(
            query: String,
            start: Long,
            end: Long,
            step: String = "15s"
    ): CompletableFuture<PrometheusResponse?> {
        return CompletableFuture.supplyAsync(
                {
                    try {
                        val url =
                                UriComponentsBuilder.fromUriString(
                                                "$prometheusUrl/api/v1/query_range"
                                        )
                                        .queryParam("query", query)
                                        .queryParam("start", start)
                                        .queryParam("end", end)
                                        .queryParam("step", step)
                                        .build()
                                        .toUri()

                        logger.debug("Querying Prometheus (range): $query")
                        restTemplate.getForObject(url, PrometheusResponse::class.java)
                    } catch (e: Exception) {
                        logger.error("Failed to query Prometheus range: ${e.message}", e)
                        null
                    }
                },
                executor
        )
    }

    /** Fallback method for Prometheus range queries */
    private fun queryRangeFallback(
            query: String,
            start: Long,
            end: Long,
            step: String,
            throwable: Throwable
    ): CompletableFuture<PrometheusResponse?> {
        logger.warn(
                "Prometheus circuit breaker activated for range query: $query. Reason: ${throwable.message}"
        )
        return CompletableFuture.completedFuture(null)
    }

    /** Extract a single numeric value from Prometheus response */
    fun extractValue(response: PrometheusResponse?): Double {
        return try {
            response?.data?.result?.firstOrNull()?.value?.get(1)?.toString()?.toDouble() ?: 0.0
        } catch (e: Exception) {
            logger.warn("Failed to extract value from Prometheus response: ${e.message}")
            0.0
        }
    }

    /** Extract a single string value from Prometheus response */
    fun extractStringValue(response: PrometheusResponse?): String? {
        return try {
            response?.data?.result?.firstOrNull()?.value?.get(1)?.toString()
        } catch (e: Exception) {
            logger.warn("Failed to extract string value from Prometheus response: ${e.message}")
            null
        }
    }

    /** Extract metric label from Prometheus response */
    fun extractLabel(response: PrometheusResponse?, labelName: String): String? {
        return try {
            response?.data?.result?.firstOrNull()?.metric?.get(labelName)
        } catch (e: Exception) {
            logger.warn("Failed to extract label from Prometheus response: ${e.message}")
            null
        }
    }
}
