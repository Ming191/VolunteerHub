package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import kotlin.math.roundToInt

/**
 * Service for aggregating and formatting system metrics
 */
@Service
class MetricsService(
    private val prometheusClient: PrometheusClientService
) {
    private val logger = LoggerFactory.getLogger(MetricsService::class.java)

    /**
     * Get comprehensive system metrics for admin dashboard
     */
    fun getSystemMetrics(): SystemMetricsResponse {
        return SystemMetricsResponse(
            requestMetrics = getRequestMetrics(),
            systemHealth = getSystemHealth(),
            apiPerformance = getApiPerformance()
        )
    }

    /**
     * Get HTTP request metrics
     */
    private fun getRequestMetrics(): RequestMetrics {
        // Total requests in last hour
        val totalRequests = prometheusClient.extractValue(
            prometheusClient.query("sum(increase(http_server_requests_seconds_count{application=\"volunteerhub\"}[1h]))").get()
        ).toLong()

        // Requests per minute (last 5 minutes average)
        val requestsPerMinute = prometheusClient.extractValue(
            prometheusClient.query("sum(rate(http_server_requests_seconds_count{application=\"volunteerhub\"}[5m])) * 60").get()
        )

        // Client errors (4xx) in last hour
        val clientErrors = prometheusClient.extractValue(
            prometheusClient.query("sum(increase(http_server_requests_seconds_count{application=\"volunteerhub\",status=~\"4..\"}[1h]))").get()
        ).toLong()

        // Server errors (5xx) in last hour
        val serverErrors = prometheusClient.extractValue(
            prometheusClient.query("sum(increase(http_server_requests_seconds_count{application=\"volunteerhub\",status=~\"5..\"}[1h]))").get()
        ).toLong()

        // Error rate calculation
        val totalErrors = clientErrors + serverErrors
        val errorRate = if (totalRequests > 0) {
            (totalErrors.toDouble() / totalRequests.toDouble()) * 100
        } else {
            0.0
        }

        logger.debug("Request metrics - Total: $totalRequests, RPM: $requestsPerMinute, Error rate: $errorRate%")

        return RequestMetrics(
            totalRequests = totalRequests,
            requestsPerMinute = String.format("%.2f", requestsPerMinute).toDouble(),
            errorRate = String.format("%.2f", errorRate).toDouble(),
            clientErrors = clientErrors,
            serverErrors = serverErrors
        )
    }

    /**
     * Get system health metrics
     */
    private fun getSystemHealth(): SystemHealth {
        // Memory used (in bytes, convert to MB)
        val memoryUsedBytes = prometheusClient.extractValue(
            prometheusClient.query("jvm_memory_used_bytes{application=\"volunteerhub\",area=\"heap\"}").get()
        )
        val memoryUsedMB = memoryUsedBytes / (1024 * 1024)

        // Memory max (in bytes, convert to MB)
        val memoryMaxBytes = prometheusClient.extractValue(
            prometheusClient.query("jvm_memory_max_bytes{application=\"volunteerhub\",area=\"heap\"}").get()
        )
        val memoryMaxMB = memoryMaxBytes / (1024 * 1024)

        // Memory usage percentage
        val memoryUsagePercent = if (memoryMaxMB > 0) {
            (memoryUsedMB / memoryMaxMB) * 100
        } else {
            0.0
        }

        // Active threads
        val activeThreads = prometheusClient.extractValue(
            prometheusClient.query("jvm_threads_live_threads{application=\"volunteerhub\"}").get()
        ).toInt()

        // Uptime in seconds
        val uptimeSeconds = prometheusClient.extractValue(
            prometheusClient.query("process_uptime_seconds{application=\"volunteerhub\"}").get()
        ).toLong()

        logger.debug("System health - Memory: ${memoryUsedMB.roundToInt()}MB/${memoryMaxMB.roundToInt()}MB, Threads: $activeThreads, Uptime: ${uptimeSeconds}s")

        return SystemHealth(
            memoryUsedMB = String.format("%.2f", memoryUsedMB).toDouble(),
            memoryMaxMB = String.format("%.2f", memoryMaxMB).toDouble(),
            memoryUsagePercent = String.format("%.2f", memoryUsagePercent).toDouble(),
            activeThreads = activeThreads,
            uptimeSeconds = uptimeSeconds
        )
    }

    /**
     * Get API performance metrics
     */
    private fun getApiPerformance(): ApiPerformance {
        // Average response time (in seconds, convert to ms)
        val avgResponseTimeSec = prometheusClient.extractValue(
            prometheusClient.query("avg(rate(http_server_requests_seconds_sum{application=\"volunteerhub\"}[5m]) / rate(http_server_requests_seconds_count{application=\"volunteerhub\"}[5m]))").get()
        )
        val avgResponseTimeMs = avgResponseTimeSec * 1000

        // 95th percentile (in seconds, convert to ms)
        val p95ResponseTimeSec = prometheusClient.extractValue(
            prometheusClient.query("histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{application=\"volunteerhub\"}[5m])) by (le))").get()
        )
        val p95ResponseTimeMs = p95ResponseTimeSec * 1000

        // 99th percentile (in seconds, convert to ms)
        val p99ResponseTimeSec = prometheusClient.extractValue(
            prometheusClient.query("histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket{application=\"volunteerhub\"}[5m])) by (le))").get()
        )
        val p99ResponseTimeMs = p99ResponseTimeSec * 1000

        // Slowest endpoint - get the endpoint with the highest average response time
        val slowestEndpointResponse = prometheusClient.query(
            "topk(1, avg by (uri) (rate(http_server_requests_seconds_sum{application=\"volunteerhub\"}[5m]) / rate(http_server_requests_seconds_count{application=\"volunteerhub\"}[5m])))"
        ).get()
        val slowestEndpoint = prometheusClient.extractLabel(slowestEndpointResponse, "uri")
        val slowestEndpointTimeSec = prometheusClient.extractValue(slowestEndpointResponse)
        val slowestEndpointTimeMs = slowestEndpointTimeSec * 1000

        logger.debug("API performance - Avg: ${avgResponseTimeMs.roundToInt()}ms, P95: ${p95ResponseTimeMs.roundToInt()}ms, P99: ${p99ResponseTimeMs.roundToInt()}ms")

        return ApiPerformance(
            avgResponseTimeMs = String.format("%.2f", avgResponseTimeMs).toDouble(),
            p95ResponseTimeMs = String.format("%.2f", p95ResponseTimeMs).toDouble(),
            p99ResponseTimeMs = String.format("%.2f", p99ResponseTimeMs).toDouble(),
            slowestEndpoint = slowestEndpoint,
            slowestEndpointTimeMs = String.format("%.2f", slowestEndpointTimeMs).toDouble()
        )
    }
}
