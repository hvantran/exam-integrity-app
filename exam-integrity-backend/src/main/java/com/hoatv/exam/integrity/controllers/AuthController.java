package com.hoatv.exam.integrity.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Authentication endpoints")
public class AuthController {

    @Operation(summary = "Get current authenticated user info")
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.ok(Map.of());
        }

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .toList();

        Map<String, Object> result = new HashMap<>();
        String username = auth.getName();
        String firstName = null;
        String lastName = null;
        if (auth.getPrincipal() instanceof Jwt jwt) {
            if (jwt.getSubject() != null && !jwt.getSubject().isBlank()) {
                username = jwt.getSubject();
            }
            firstName = jwt.getClaimAsString("given_name");
            lastName = jwt.getClaimAsString("family_name");
        }
        Integer grade = null;
        if (auth.getPrincipal() instanceof Jwt jwt) {
            Object gradeClaim = jwt.getClaim("grade");
            if (gradeClaim == null) {
                gradeClaim = jwt.getClaim("grade_level");
            }
            if (gradeClaim instanceof Number number) {
                grade = number.intValue();
            } else if (gradeClaim instanceof String str && !str.isBlank()) {
                try {
                    grade = Integer.parseInt(str.replaceAll("[^0-9]", ""));
                } catch (NumberFormatException ignored) {
                }
            }
        }
        result.put("username", username);
        result.put("roles", roles);
        result.put("firstName", firstName);
        result.put("lastName", lastName);
        result.put("grade", grade);

        return ResponseEntity.ok(result);
    }
}
