package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.dtos.UserProfileDTO;
import com.hoatv.exam.integrity.services.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@Tag(name = "UserProfile", description = "User profile and gamification endpoints")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @Operation(summary = "Get or initialize current authenticated user profile")
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getMyProfile(Authentication auth) {
        String username = "guest";
        String primaryRole = "STUDENT";
        Integer grade = null;

        if (auth != null) {
            username = auth.getName();
            List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .toList();
            if (!roles.isEmpty()) {
                primaryRole = roles.get(0);
            }

            if (auth.getPrincipal() instanceof Jwt jwt) {
                if (jwt.getSubject() != null && !jwt.getSubject().isBlank()) {
                    username = jwt.getSubject();
                }
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
        }

        UserProfile profile = userProfileService.getOrCreateProfile(username, primaryRole, grade);
        return ResponseEntity.ok(userProfileService.toDTO(profile));
    }

    @Operation(summary = "Get user profile by userId")
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDTO> getProfileByUserId(@PathVariable String userId) {
        return userProfileService.findByUserId(userId)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found for user: " + userId));
    }
}

