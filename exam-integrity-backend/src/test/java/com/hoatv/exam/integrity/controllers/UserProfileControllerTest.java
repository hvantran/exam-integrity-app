package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.domain.UserProfileGamification;
import com.hoatv.exam.integrity.domain.UserProfileStats;
import com.hoatv.exam.integrity.dtos.UserProfileDTO;
import com.hoatv.exam.integrity.dtos.UserProfileGamificationDTO;
import com.hoatv.exam.integrity.dtos.UserProfileStatsDTO;
import com.hoatv.exam.integrity.services.UserProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserProfileControllerTest {

    @Mock
    private UserProfileService userProfileService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        UserProfileController controller = new UserProfileController(userProfileService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getMyProfileReturnsProfileWithStars() throws Exception {
        Jwt jwt = new Jwt(
            "token",
            Instant.now(),
            Instant.now().plusSeconds(3600),
            Map.of("alg", "none"),
            Map.of("sub", "student1", "grade", 5)
        );
        JwtAuthenticationToken auth = new JwtAuthenticationToken(
            jwt,
            List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );

        UserProfile profile = new UserProfile("student1", "STUDENT", 5);
        profile.setStats(new UserProfileStats(42, 5, 9.5));
        profile.setGamification(new UserProfileGamification(3, List.of("STAR_MASTER"), List.of()));

        UserProfileDTO dto = new UserProfileDTO(
            "id-1",
            "student1",
            "STUDENT",
            5,
            new UserProfileStatsDTO(42, 5, 9.5),
            new UserProfileGamificationDTO(3, List.of("STAR_MASTER"), List.of()),
            Map.of(),
            Map.of(),
            Instant.now(),
            Instant.now()
        );

        when(userProfileService.getOrCreateProfile("student1", "STUDENT", 5)).thenReturn(profile);
        when(userProfileService.toDTO(profile)).thenReturn(dto);

        mockMvc.perform(get("/api/profiles/me").principal(auth))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value("student1"))
            .andExpect(jsonPath("$.stats.totalStars").value(42))
            .andExpect(jsonPath("$.stats.completedExams").value(5))
            .andExpect(jsonPath("$.gamification.level").value(3));
    }

    @Test
    void getProfileByUserIdReturnsExistingProfile() throws Exception {
        UserProfileDTO dto = new UserProfileDTO(
            "id-2",
            "student2",
            "STUDENT",
            4,
            new UserProfileStatsDTO(15, 2, 8.0),
            new UserProfileGamificationDTO(1, List.of(), List.of()),
            Map.of(),
            Map.of(),
            Instant.now(),
            Instant.now()
        );

        when(userProfileService.findByUserId("student2")).thenReturn(Optional.of(dto));

        mockMvc.perform(get("/api/profiles/student2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value("student2"))
            .andExpect(jsonPath("$.stats.totalStars").value(15));
    }
}

