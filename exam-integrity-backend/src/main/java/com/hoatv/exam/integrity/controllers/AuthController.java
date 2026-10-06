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
        result.put("username", auth.getName());
        result.put("roles", roles);

        String firstName = null;
        String lastName = null;
        if (auth.getPrincipal() instanceof Jwt jwt) {
            firstName = jwt.getClaimAsString("given_name");
            lastName = jwt.getClaimAsString("family_name");
        }
        result.put("firstName", firstName);
        result.put("lastName", lastName);

        return ResponseEntity.ok(result);
    }
}
