package com.hoatv.exam.integrity.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.exam.integrity.dtos.PetLibraryItemDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class PetLibraryDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(PetLibraryDataSeeder.class);

    private final PetHatcheryService petHatcheryService;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    @Value("${app.hatchery.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.hatchery.seed.resource-path:classpath:data/pet-library-seed.json}")
    private String seedResourcePath;

    public PetLibraryDataSeeder(
        PetHatcheryService petHatcheryService,
        ResourceLoader resourceLoader,
        ObjectMapper objectMapper
    ) {
        this.petHatcheryService = petHatcheryService;
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            logger.info("Pet library seeding is disabled (app.hatchery.seed.enabled=false)");
            return;
        }

        try {
            Resource resource = resourceLoader.getResource(seedResourcePath);
            if (!resource.exists()) {
                logger.warn("Pet library seed file not found at: {}", seedResourcePath);
                return;
            }

            try (InputStream is = resource.getInputStream()) {
                List<PetLibraryItemDTO> items = objectMapper.readValue(is, new TypeReference<>() {});
                List<PetLibraryItemDTO> synced = petHatcheryService.syncPetLibrary(items);
                logger.info("PetLibraryDataSeeder: successfully seeded {} pet library items into MongoDB", synced.size());
            }
        } catch (Exception e) {
            logger.error("Failed to seed pet library from resource: {}", seedResourcePath, e);
        }
    }
}
