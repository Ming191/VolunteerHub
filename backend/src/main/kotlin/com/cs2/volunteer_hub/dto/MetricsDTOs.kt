package com.cs2.volunteer_hub.dto

import io.swagger.v3.oas.annotations.media.Schema

/**
 * Response containing system metrics for admin dashboard
 */
@Schema(description = "System metrics response for admin monitoring")
data class SystemMetricsResponse(
    val requestMetrics: RequestMetrics,
    val systemHealth: SystemHealth,
    val apiPerformance: ApiPerformance
)

/**
 * HTTP request metrics
 */
@Schema(description = "HTTP request metrics")
data class RequestMetrics(
    @Schema(description = "Total number of requests in the last hour")
    val totalRequests: Long,
    
    @Schema(description = "Average requests per minute")
    val requestsPerMinute: Double,
    
    @Schema(description = "Error rate as percentage (0-100)")
    val errorRate: Double,
    
    @Schema(description = "Number of 4xx errors in the last hour")
    val clientErrors: Long,
    
    @Schema(description = "Number of 5xx errors in the last hour")
    val serverErrors: Long
)

/**
 * System health indicators
 */
@Schema(description = "System health metrics")
data class SystemHealth(
    @Schema(description = "JVM memory usage in MB")
    val memoryUsedMB: Double,
    
    @Schema(description = "JVM max memory in MB")
    val memoryMaxMB: Double,
    
    @Schema(description = "Memory usage percentage (0-100)")
    val memoryUsagePercent: Double,
    
    @Schema(description = "Number of active threads")
    val activeThreads: Int,
    
    @Schema(description = "Application uptime in seconds")
    val uptimeSeconds: Long
)

/**
 * API performance metrics
 */
@Schema(description = "API performance metrics")
data class ApiPerformance(
    @Schema(description = "Average response time in milliseconds")
    val avgResponseTimeMs: Double,
    
    @Schema(description = "95th percentile response time in milliseconds")
    val p95ResponseTimeMs: Double,
    
    @Schema(description = "99th percentile response time in milliseconds")
    val p99ResponseTimeMs: Double,
    
    @Schema(description = "Slowest endpoint path")
    val slowestEndpoint: String?,
    
    @Schema(description = "Slowest endpoint average response time in ms")
    val slowestEndpointTimeMs: Double
)

/**
 * Raw Prometheus query response
 */
data class PrometheusResponse(
    val status: String,
    val data: PrometheusData
)

data class PrometheusData(
    val resultType: String,
    val result: List<PrometheusResult>
)

data class PrometheusResult(
    val metric: Map<String, String>,
    val value: List<Any>
)
