package com.hoatv.exam.integrity.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.exam.integrity.dtos.PetLibraryItemDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PetLibraryDataSeederTest {

    @Mock
    private PetHatcheryService petHatcheryService;

    @Mock
    private ResourceLoader resourceLoader;

    private ObjectMapper objectMapper;
    private PetLibraryDataSeeder seeder;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        seeder = new PetLibraryDataSeeder(petHatcheryService, resourceLoader, objectMapper);
    }

    @Test
    void runDoesNothingWhenSeedDisabled() {
        ReflectionTestUtils.setField(seeder, "seedEnabled", false);

        seeder.run();

        verify(resourceLoader, never()).getResource(anyString());
        verify(petHatcheryService, never()).syncPetLibrary(anyList());
    }

    @Test
    void runSkipsWhenResourceDoesNotExist() {
        ReflectionTestUtils.setField(seeder, "seedEnabled", true);
        ReflectionTestUtils.setField(seeder, "seedResourcePath", "classpath:data/missing.json");

        Resource mockResource = new ByteArrayResource(new byte[0]) {
            @Override
            public boolean exists() {
                return false;
            }
        };
        when(resourceLoader.getResource("classpath:data/missing.json")).thenReturn(mockResource);

        seeder.run();

        verify(petHatcheryService, never()).syncPetLibrary(anyList());
    }

    @Test
    void runSeedsPetLibrarySuccessfullyWhenResourceExists() {
        ReflectionTestUtils.setField(seeder, "seedEnabled", true);
        ReflectionTestUtils.setField(seeder, "seedResourcePath", "classpath:data/pet-library-seed.json");

        String json = """
            [
              {
                "id": "sproutling",
                "petKey": "sproutling",
                "name": "Sprout",
                "species": "Flora Seedling",
                "rarity": "Common",
                "tier": "forest",
                "element": "Flora",
                "avatarEmoji": "🌱",
                "totalStages": 1,
                "maxLevel": 10,
                "eggShopPrice": 250,
                "hatchDurationHours": 8,
                "description": "Botanical seedling",
                "bannerGradient": "gradient",
                "stages": [
                  {
                    "stage": 1,
                    "minLevel": 1,
                    "name": "Sproutling",
                    "title": "Flora Hatchling",
                    "description": "Seed bud",
                    "avatarEmoji": "🌱",
                    "imageName": "sproutling-stage-1.png",
                    "ability": {
                      "name": "Seedling Sprout",
                      "description": "Chlorophyll mist",
                      "videoFile": "sproutling-stage-1.mp4",
                      "videoUrl": "https://cdn.example.com/sproutling.mp4"
                    }
                  }
                ]
              }
            ]
            """;
        Resource mockResource = new ByteArrayResource(json.getBytes(StandardCharsets.UTF_8));
        when(resourceLoader.getResource("classpath:data/pet-library-seed.json")).thenReturn(mockResource);
        when(petHatcheryService.syncPetLibrary(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        seeder.run();

        verify(petHatcheryService).syncPetLibrary(anyList());
    }

    @Test
    void verifyActualSeedJsonContainsAll28PetsAnd129Abilities() throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/data/pet-library-seed.json")) {
            assertNotNull(is, "Seed JSON must be packaged in classpath /data/pet-library-seed.json");
            List<PetLibraryItemDTO> items = objectMapper.readValue(is, new TypeReference<>() {});
            assertEquals(28, items.size(), "Should have exactly 28 pets in pet catalog");

            int totalStages = 0;
            int totalAbilities = 0;
            for (PetLibraryItemDTO item : items) {
                assertNotNull(item.petKey());
                assertFalse(item.petKey().isBlank());
                assertNotNull(item.stages());
                totalStages += item.stages().size();
                for (var stage : item.stages()) {
                    if (stage.ability() != null) {
                        assertNotNull(stage.ability().name());
                        assertNotNull(stage.ability().description());
                        assertNotNull(stage.ability().videoFile());
                        totalAbilities++;
                    }
                }
            }
            assertEquals(129, totalStages, "Should have exactly 129 evolution stages");
            assertEquals(129, totalAbilities, "Should have exactly 129 stage abilities");
        }
    }
}

