package com.cs2.volunteer_hub.ci

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class QualityGateNegativeTest {
    @Test
    fun deliberateFailureOnlyOnDisposableBranch() {
        assertTrue(false, "VH-111 negative test: expected CI failure, DO NOT MERGE")
    }
}