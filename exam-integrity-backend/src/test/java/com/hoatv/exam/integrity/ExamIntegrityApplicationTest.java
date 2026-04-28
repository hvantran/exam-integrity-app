package com.hoatv.exam.integrity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ExamIntegrityApplicationTest {

    @Test
    void contextLoads() {
        // Validates Spring context starts with the test profile
    }
}
