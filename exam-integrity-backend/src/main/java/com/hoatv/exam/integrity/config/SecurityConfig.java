package com.hoatv.exam.integrity.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Security configuration for Exam Integrity Backend with Keycloak JWT validation.
 * Implements OAuth2 Resource Server pattern:
 * - JWT token validation via Keycloak
 * - Role-based access control from Keycloak realm roles
 * - Method-level security
 * - Stateless session management
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";
    private static final String ROLE_STUDENT = "STUDENT";

    @Bean
    @SuppressWarnings("java:S4502") // Stateless REST API using Keycloak JWT bearer tokens
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(
                    "/actuator/health",
                    "/actuator/info",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    // SockJS handshake and STOMP endpoints
                    "/ws/**",
                    "/ws/exam/**"
                ).permitAll()
                // Teacher / Admin endpoints (exam draft ingestion & question bank)
                .requestMatchers("/api/drafts/**", "/api/questions/**").hasAnyRole(ROLE_ADMIN, ROLE_TEACHER)
                // Student, Teacher, Admin can access exams and sessions
                .requestMatchers("/api/exams/**", "/api/sessions/**").hasAnyRole(ROLE_STUDENT, ROLE_TEACHER, ROLE_ADMIN)
                // Auth info endpoint
                .requestMatchers("/api/auth/**").authenticated()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    /**
     * Converts JWT tokens to Spring Security authentication with roles from Keycloak.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter());
        return converter;
    }

    /**
     * Extracts granted authorities from JWT token, combining standard scopes with Keycloak realm roles.
     */
    private Converter<Jwt, Collection<GrantedAuthority>> jwtGrantedAuthoritiesConverter() {
        JwtGrantedAuthoritiesConverter standardConverter = new JwtGrantedAuthoritiesConverter();

        return jwt -> {
            Collection<GrantedAuthority> standardAuthorities = standardConverter.convert(jwt);
            Collection<GrantedAuthority> realmRoles = extractRealmRoles(jwt);

            return Stream.concat(
                standardAuthorities != null ? standardAuthorities.stream() : Stream.empty(),
                realmRoles.stream()
            ).toList();
        };
    }

    /**
     * Extracts realm roles from Keycloak JWT token's realm_access.roles claim.
     */
    private Collection<GrantedAuthority> extractRealmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");

        if (realmAccess == null || !realmAccess.containsKey("roles")) {
            return Collections.emptyList();
        }

        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) realmAccess.get("roles");

        return roles.stream()
                .map(role -> "ROLE_" + role.toUpperCase().replace("-", "_"))
                .map(SimpleGrantedAuthority::new)
                .toList();
    }
}
