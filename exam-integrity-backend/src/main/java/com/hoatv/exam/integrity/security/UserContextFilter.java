package com.hoatv.exam.integrity.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Generic request filter that extracts user context (such as student grade)
 * from authenticated JWT tokens and populates {@link UserContext}.
 * Student-specific context is extracted strictly for student users, bypassing admin and teacher flows.
 */
@Component
public class UserContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                boolean student = isStudent(auth);
                UserContext.setStudent(student);
                UserContext.setUsername(auth.getName());

                if (student && auth.getPrincipal() instanceof Jwt jwt) {
                    Integer grade = extractGrade(jwt);
                    if (grade != null) {
                        UserContext.setStudentGrade(grade);
                    }
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }
    }

    private boolean isStudent(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        boolean hasAdminOrTeacher = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_ADMIN") || a.equalsIgnoreCase("ROLE_TEACHER"));
        if (hasAdminOrTeacher) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_STUDENT"));
    }

    private Integer extractGrade(Jwt jwt) {
        Object gradeClaim = jwt.getClaim("grade");
        if (gradeClaim == null) {
            gradeClaim = jwt.getClaim("grade_level");
        }
        if (gradeClaim instanceof Number number) {
            return number.intValue();
        } else if (gradeClaim instanceof String str && !str.isBlank()) {
            try {
                return Integer.parseInt(str.replaceAll("\\D", ""));
            } catch (NumberFormatException ignored) {
                // Ignore non-numeric grade and fall back to null
                return null;
            }
        }
        return null;
    }
}

