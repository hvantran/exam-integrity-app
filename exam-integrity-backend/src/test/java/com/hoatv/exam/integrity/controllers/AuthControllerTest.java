package com.hoatv.exam.integrity.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private AuthController authController;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        authController = new AuthController();
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void meReturnsUserDetailsWithFirstNameAndLastNameFromJwt() throws Exception {
        Jwt jwt = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of(
                        "sub", "user-123",
                        "preferred_username", "teacher_jane",
                        "given_name", "Jane",
                        "family_name", "Doe"
                )
        );

        TestingAuthenticationToken auth = new TestingAuthenticationToken(
                jwt,
                "credentials",
                List.of(new SimpleGrantedAuthority("ROLE_TEACHER"))
        );

        mockMvc.perform(get("/api/auth/me").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user-123"))
                .andExpect(jsonPath("$.roles[0]").value("TEACHER"))
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Doe"));
    }

    @Test
    void meHandlesNonJwtPrincipalGracefully() throws Exception {
        TestingAuthenticationToken auth = new TestingAuthenticationToken(
                "plain-username",
                "credentials",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        mockMvc.perform(get("/api/auth/me").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("plain-username"))
                .andExpect(jsonPath("$.roles[0]").value("ADMIN"))
                .andExpect(jsonPath("$.firstName").doesNotExist())
                .andExpect(jsonPath("$.lastName").doesNotExist());
    }
}
