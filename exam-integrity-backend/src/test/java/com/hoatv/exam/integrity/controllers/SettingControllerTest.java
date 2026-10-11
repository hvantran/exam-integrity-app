package com.hoatv.exam.integrity.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.exam.integrity.services.SettingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SettingControllerTest {

    @Mock
    private SettingService settingService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        SettingController controller = new SettingController(settingService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getSettingsReturnsSettingMap() throws Exception {
        when(settingService.getAllSettings()).thenReturn(Map.of(
            SettingService.KEY_EGG_SHOP_PRICE_STARS, 250,
            SettingService.KEY_PET_GROW_STAR_COST, 25
        ));

        mockMvc.perform(get("/api/settings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.egg_shop_price_stars").value(250))
            .andExpect(jsonPath("$.pet_grow_star_cost").value(25));
    }

    @Test
    void updateSettingsAppliesAndReturnsUpdatedSettings() throws Exception {
        Map<String, Object> updates = Map.of(SettingService.KEY_EGG_SHOP_PRICE_STARS, 300);
        when(settingService.updateSettings(any())).thenReturn(Map.of(
            SettingService.KEY_EGG_SHOP_PRICE_STARS, 300
        ));

        mockMvc.perform(put("/api/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.egg_shop_price_stars").value(300));
    }
}
