package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.GrowPetResponseDTO;
import com.hoatv.exam.integrity.dtos.IncubatingEggDTO;
import com.hoatv.exam.integrity.dtos.StudentPetDTO;
import com.hoatv.exam.integrity.services.PetHatcheryService;
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

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PetHatcheryControllerTest {

    @Mock
    private PetHatcheryService petHatcheryService;

    private MockMvc mockMvc;
    private JwtAuthenticationToken auth;

    @BeforeEach
    void setUp() {
        PetHatcheryController controller = new PetHatcheryController(petHatcheryService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        Jwt jwt = new Jwt(
            "token",
            Instant.now(),
            Instant.now().plusSeconds(3600),
            Map.of("alg", "none"),
            Map.of("sub", "student1")
        );
        auth = new JwtAuthenticationToken(
            jwt,
            List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
    }

    @Test
    void getIncubatorEggsReturnsUserEggs() throws Exception {
        IncubatingEggDTO egg = new IncubatingEggDTO(
            "egg-1",
            "student1",
            "Ancient Mysterious Egg",
            "dragon",
            null,
            0.1,
            "??? Mystery Pet",
            "Veiled Beast",
            true,
            25,
            true,
            8,
            25920L,
            Instant.now(),
            Instant.now()
        );
        when(petHatcheryService.getIncubatorEggs("student1")).thenReturn(List.of(egg));

        mockMvc.perform(get("/api/hatchery/incubator").principal(auth))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("egg-1"))
            .andExpect(jsonPath("$[0].name").value("Ancient Mysterious Egg"))
            .andExpect(jsonPath("$[0].hatchDurationHours").value(8))
            .andExpect(jsonPath("$[0].isMystery").value(true));
    }

    @Test
    void strikeEggAdvancesCrackProgress() throws Exception {
        IncubatingEggDTO egg = new IncubatingEggDTO(
            "egg-1",
            "student1",
            "Ancient Mysterious Egg",
            "dragon",
            null,
            0.35,
            "??? Mystery Pet",
            "Veiled Beast",
            true,
            25,
            true,
            8,
            18720L,
            Instant.now(),
            Instant.now()
        );
        when(petHatcheryService.strikeEgg("student1", "egg-1")).thenReturn(egg);

        mockMvc.perform(post("/api/hatchery/incubator/egg-1/strike").principal(auth))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.crackProgress").value(0.35));
    }

    @Test
    void hatchEggReturnsNewCompanionPet() throws Exception {
        StudentPetDTO pet = new StudentPetDTO(
            "pet-1",
            "student1",
            "Sun Ember Fledgling",
            "Primordial Solar Phoenix",
            "Epic",
            "dragon",
            "Solar Fire / Flame",
            1,
            10,
            0,
            100,
            25,
            1,
            5,
            "Hatchling",
            "🔥",
            null,
            false,
            Map.of("vitality", 60),
            Instant.now(),
            Instant.now()
        );
        when(petHatcheryService.hatchEgg("student1", "egg-1", null)).thenReturn(pet);

        mockMvc.perform(post("/api/hatchery/incubator/egg-1/hatch").principal(auth))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("pet-1"))
            .andExpect(jsonPath("$.name").value("Sun Ember Fledgling"))
            .andExpect(jsonPath("$.rarity").value("Epic"))
            .andExpect(jsonPath("$.totalStages").value(5));
    }

    @Test
    void growPetReturnsUpgradedLevelAndRemainingStars() throws Exception {
        StudentPetDTO pet = new StudentPetDTO(
            "pet-1",
            "student1",
            "Sun Ember Fledgling",
            "Primordial Solar Phoenix",
            "Epic",
            "dragon",
            "Solar Fire / Flame",
            2,
            10,
            20,
            135,
            25,
            1,
            5,
            "Hatchling",
            "🔥",
            null,
            false,
            Map.of("vitality", 65),
            Instant.now(),
            Instant.now()
        );
        GrowPetResponseDTO growResponse = new GrowPetResponseDTO(pet, 475, false, true);

        when(petHatcheryService.growPet("student1", "pet-1")).thenReturn(growResponse);

        mockMvc.perform(post("/api/hatchery/pets/pet-1/grow").principal(auth))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.pet.level").value(2))
            .andExpect(jsonPath("$.remainingStars").value(475))
            .andExpect(jsonPath("$.levelGained").value(true));
    }
}

