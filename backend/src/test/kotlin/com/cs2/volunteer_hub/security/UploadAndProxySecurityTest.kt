package com.cs2.volunteer_hub.security

import com.cs2.volunteer_hub.config.ratelimit.ClientIpResolver
import com.cs2.volunteer_hub.exception.BadRequestException
import com.cs2.volunteer_hub.service.FileValidationService
import com.cs2.volunteer_hub.service.TemporaryFileStorageService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockMultipartFile
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

class UploadAndProxySecurityTest {
    @Test fun untrustedForwardedHeadersDoNotChangeClientIdentity() {
        val req = MockHttpServletRequest()
        req.remoteAddr = "198.51.100.45"
        req.addHeader("X-Forwarded-For", "192.0.2.1, 192.0.2.2")
        assertEquals("198.51.100.45", ClientIpResolver().resolve(req))
    }
    @Test fun trustedProxyUsesNearestUntrustedHopAndRejectsMalformedChains() {
        val resolver = ClientIpResolver("10.0.0.10,10.0.0.11")
        val req = MockHttpServletRequest()
        req.remoteAddr = "10.0.0.10"
        req.addHeader("X-Forwarded-For", "203.0.113.55, 192.0.2.7, 10.0.0.11")
        assertEquals("192.0.2.7", resolver.resolve(req))
        val malformed = MockHttpServletRequest()
        malformed.remoteAddr = "10.0.0.10"
        malformed.addHeader("X-Forwarded-For", "forged.invalid, 192.0.2.7")
        assertEquals("10.0.0.10", resolver.resolve(malformed))
    }
    private fun validator() = FileValidationService(10_485_760,
        Mockito.mock(TemporaryFileStorageService::class.java))

    @Test fun mimeSpoofingAndTraversalAreRejected() {
        assertThrows(BadRequestException::class.java) {
            validator().validateFiles(listOf(
                MockMultipartFile("file","fake.png","image/png","not an image".toByteArray())
            ), 5)
        }
        assertThrows(BadRequestException::class.java) {
            validator().validateFiles(listOf(
                MockMultipartFile("file","../escape.png","image/png",png())
            ), 5)
        }
    }
    @Test fun actualPngPassesButMismatchedMimeFails() {
        validator().validateFiles(listOf(MockMultipartFile("file","valid.png","image/png",png())), 5)
        assertThrows(BadRequestException::class.java) {
            validator().validateFiles(listOf(MockMultipartFile("file","fake.jpg","image/jpeg",png())), 5)
        }
    }
    @Test fun oversizeUploadCannotPass() {
        assertThrows(BadRequestException::class.java) {
            validator().validateFiles(listOf(
                MockMultipartFile("file","large.png","image/png",ByteArray(10_485_761))
            ), 5)
        }
    }
    private fun png(): ByteArray {
        val out = ByteArrayOutputStream()
        ImageIO.write(BufferedImage(2,2,BufferedImage.TYPE_INT_RGB),"png",out)
        return out.toByteArray()
    }
}
