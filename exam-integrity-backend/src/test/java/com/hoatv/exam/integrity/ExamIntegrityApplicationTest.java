package com.hoatv.exam.integrity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = ExamIntegrityApplication.class)
@ActiveProfiles("test")
class ExamIntegrityApplicationTest {

    @MockBean
    private JwtDecoder jwtDecoder;

    @Test
    void contextLoads() {
        // Validates Spring context starts with the test profile
    }
}
