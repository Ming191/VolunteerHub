package com.cs2.volunteer_hub.service

import com.cs2.volunteer_hub.dto.PrometheusResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder

/**
 * Service for querying Prometheus metrics
 */
@Service
class PrometheusClientService(
    private val restTemplate: RestTemplate
) {
    private val logger = LoggerFactory.getLogger(PrometheusClientService::class.java)

    @Value("\${prometheus.url:http://localhost:9090}")
    private lateinit var prometheusUrl: String

    /**
     * Execute an instant query against Prometheus
     * @param query PromQL query string
     * @return Prometheus response with results
     */
    fun query(query: String): PrometheusResponse? {
        return try {
            val url = UriComponentsBuilder
                .fromHttpUrl("$prometheusUrl/api/v1/query")
                .queryParam("query", query)
                .build()
                .toUriString()

            logger.debug("Querying Prometheus: $query")
            restTemplate.getForObject(url, PrometheusResponse::class.java)
        } catch (e: Exception) {
            logger.error("Failed to query Prometheus: ${e.message}", e)
            null
        }
    }

    /**
     * Execute a range query against Prometheus
     * @param query PromQL query string
     * @param start Start timestamp (Unix time)
     * @param end End timestamp (Unix time)
     * @param step Query resolution step
     * @return Prometheus response with results
     */
    fun queryRange(query: String, start: Long, end: Long, step: String = "15s"): PrometheusResponse? {
        return try {
            val url = UriComponentsBuilder
                .fromHttpUrl("$prometheusUrl/api/v1/query_range")
                .queryParam("query", query)
                .queryParam("start", start)
                .queryParam("end", end)
                .queryParam("step", step)
                .build()
                .toUriString()

            logger.debug("Querying Prometheus (range): $query")
            restTemplate.getForObject(url, PrometheusResponse::class.java)
        } catch (e: Exception) {
            logger.error("Failed to query Prometheus range: ${e.message}", e)
            null
        }
    }

    /**
     * Extract a single numeric value from Prometheus response
     */
    fun extractValue(response: PrometheusResponse?): Double {
        return try {
            response?.data?.result?.firstOrNull()?.value?.get(1)?.toString()?.toDouble() ?: 0.0
        } catch (e: Exception) {
            logger.warn("Failed to extract value from Prometheus response: ${e.message}")
            0.0
        }
    }

    /**
     * Extract a single string value from Prometheus response
     */
    fun extractStringValue(response: PrometheusResponse?): String? {
        return try {
            response?.data?.result?.firstOrNull()?.value?.get(1)?.toString()
        } catch (e: Exception) {
            logger.warn("Failed to extract string value from Prometheus response: ${e.message}")
            null
        }
    }

    /**
     * Extract metric label from Prometheus response
     */
    fun extractLabel(response: PrometheusResponse?, labelName: String): String? {
        return try {
            response?.data?.result?.firstOrNull()?.metric?.get(labelName)
        } catch (e: Exception) {
            logger.warn("Failed to extract label from Prometheus response: ${e.message}")
            null
        }
    }
}
