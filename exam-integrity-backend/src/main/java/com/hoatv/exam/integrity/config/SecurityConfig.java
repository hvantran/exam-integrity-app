package com.hoatv.exam.integrity.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;

/**
 * Simple in-memory security for dev/demo.
 * Two users:
 *   admin / admin123  → roles: ADMIN, USER
 *   user  / user123   → role:  USER
 *
 * API endpoints are open to both roles.
 * Keycloak JWT integration is DEFERRED (see FE-22 / INF-07).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(
            User.withUsername("admin")
                .password(encoder.encode("admin123"))
                .roles("ADMIN", "USER")
                .build(),
            User.withUsername("user")
                .password(encoder.encode("user123"))
                .roles("USER")
                .build()
        );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Suppress the WWW-Authenticate header so the browser never shows its
        // native Basic-Auth dialog. The React frontend handles 401s itself.
        BasicAuthenticationEntryPoint entryPoint = new BasicAuthenticationEntryPoint();
        entryPoint.setRealmName("exam-integrity");

        http
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(
                    "/actuator/health",
                    "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                    // SockJS handshake and info endpoints — auth happens inside STOMP
                    "/ws/**", "/ws/exam/**"
                ).permitAll()
                // Teacher-only endpoints (exam draft ingestion & management)
                .requestMatchers("/api/drafts/**", "/api/questions/**").hasRole("ADMIN")
                // Both student and admin can access exams and sessions
                .requestMatchers("/api/exams/**", "/api/sessions/**").hasAnyRole("USER", "ADMIN")
                // Auth info endpoint — any authenticated user
                .requestMatchers("/api/auth/**").authenticated()
                .anyRequest().authenticated()
            )
            // httpBasic with a custom entry point that does NOT echo back
            // WWW-Authenticate, preventing the browser login popup
            .httpBasic(basic -> basic.authenticationEntryPoint((req, res, ex) -> {
                res.setStatus(401);
                res.setContentType("application/json");
                res.getWriter().write("{\"error\":\"Unauthorized\"}");
            }))
            // formLogin disabled — this is a REST API, not a browser app
            .formLogin(form -> form.disable())
            .csrf(csrf -> csrf.disable());
        return http.build();
    }
}
