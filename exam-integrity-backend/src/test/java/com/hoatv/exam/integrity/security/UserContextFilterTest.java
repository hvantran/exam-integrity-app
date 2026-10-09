package com.hoatv.exam.integrity.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class UserContextFilterTest {

    private final UserContextFilter filter = new UserContextFilter();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        UserContext.clear();
    }

    @Test
    void studentUserExtractsGradeAndPopulatesContextDuringExecutionAndCleansUp() throws ServletException, IOException {
        Jwt jwt = new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", "student1", "grade", 4)
        );
        Authentication auth = new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);

        AtomicBoolean capturedIsStudent = new AtomicBoolean(false);
        AtomicInteger capturedGrade = new AtomicInteger(-1);
        AtomicReference<String> capturedUsername = new AtomicReference<>();

        FilterChain chain = (req, res) -> {
            capturedIsStudent.set(UserContext.isStudent());
            capturedGrade.set(UserContext.getStudentGrade() != null ? UserContext.getStudentGrade() : -1);
            capturedUsername.set(UserContext.getUsername());
        };

        filter.doFilter(request, response, chain);

        assertThat(capturedIsStudent.get()).isTrue();
        assertThat(capturedGrade.get()).isEqualTo(4);
        assertThat(capturedUsername.get()).isEqualTo("student1");

        // Verify thread local cleanup
        assertThat(UserContext.isStudent()).isFalse();
        assertThat(UserContext.getStudentGrade()).isNull();
        assertThat(UserContext.getUsername()).isNull();
    }

    @Test
    void teacherOrAdminBypassesStudentContextExtraction() throws ServletException, IOException {
        Jwt jwt = new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", "teacher1", "grade", 4)
        );
        Authentication auth = new JwtAuthenticationToken(jwt, List.of(
                new SimpleGrantedAuthority("ROLE_TEACHER"),
                new SimpleGrantedAuthority("ROLE_STUDENT")
        ));
        SecurityContextHolder.getContext().setAuthentication(auth);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);

        AtomicBoolean capturedIsStudent = new AtomicBoolean(true);
        AtomicReference<Integer> capturedGrade = new AtomicReference<>(999);

        FilterChain chain = (req, res) -> {
            capturedIsStudent.set(UserContext.isStudent());
            capturedGrade.set(UserContext.getStudentGrade());
        };

        filter.doFilter(request, response, chain);

        assertThat(capturedIsStudent.get()).isFalse();
        assertThat(capturedGrade.get()).isNull();
    }
}

