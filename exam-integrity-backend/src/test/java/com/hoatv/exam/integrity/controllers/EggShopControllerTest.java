package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.EggShopItemDTO;
import com.hoatv.exam.integrity.dtos.IncubatingEggDTO;
import com.hoatv.exam.integrity.dtos.PurchaseEggResponseDTO;
import com.hoatv.exam.integrity.services.PetHatcheryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
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
class EggShopControllerTest {

    @Mock
    private PetHatcheryService petHatcheryService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        EggShopController controller = new EggShopController(petHatcheryService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getShopEggsReturnsFeaturedMysteryEgg() throws Exception {
        EggShopItemDTO item = new EggShopItemDTO(
            "mystery-egg-ancient",
            "Ancient Mysterious Egg",
            "dragon",
            250,
            8,
            28800L,
            "Ancient egg",
            Map.of("Common", 50, "Rare", 28, "Epic", 14, "Legendary", 6, "Mythic", 2)
        );
        when(petHatcheryService.getFeaturedShopEgg()).thenReturn(item);

        mockMvc.perform(get("/api/shop/eggs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("mystery-egg-ancient"))
            .andExpect(jsonPath("$[0].name").value("Ancient Mysterious Egg"))
            .andExpect(jsonPath("$[0].price").value(250))
            .andExpect(jsonPath("$[0].hatchDurationHours").value(8));
    }

    @Test
    void purchaseEggCallsServiceWithAuthenticatedUser() throws Exception {
        Jwt jwt = new Jwt(
            "token",
            Instant.now(),
            Instant.now().plusSeconds(3600),
            Map.of("alg", "none"),
            Map.of("sub", "student1")
        );
        JwtAuthenticationToken auth = new JwtAuthenticationToken(
            jwt,
            List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );

        IncubatingEggDTO egg = new IncubatingEggDTO(
            "egg-1",
            "student1",
            "Ancient Mysterious Egg",
            "dragon",
            null,
            0.0,
            "??? Mystery Companion",
            "Veiled Beast",
            false,
            25,
            true,
            8,
            28800L,
            Instant.now(),
            Instant.now()
        );

        when(petHatcheryService.purchaseMysteryEgg("student1"))
            .thenReturn(new PurchaseEggResponseDTO(true, "Adopted egg", egg, 250));

        mockMvc.perform(post("/api/shop/purchase-egg")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.incubatingEgg.id").value("egg-1"))
            .andExpect(jsonPath("$.incubatingEgg.hatchDurationHours").value(8))
            .andExpect(jsonPath("$.remainingStars").value(250));
    }
}

