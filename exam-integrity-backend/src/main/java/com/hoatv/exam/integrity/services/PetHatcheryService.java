package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.IncubatingEgg;
import com.hoatv.exam.integrity.domain.StudentPet;
import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.dtos.EggShopItemDTO;
import com.hoatv.exam.integrity.dtos.GrowPetResponseDTO;
import com.hoatv.exam.integrity.dtos.IncubatingEggDTO;
import com.hoatv.exam.integrity.dtos.PurchaseEggResponseDTO;
import com.hoatv.exam.integrity.dtos.StudentPetDTO;
import com.hoatv.exam.integrity.repositories.IncubatingEggRepository;
import com.hoatv.exam.integrity.repositories.StudentPetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PetHatcheryService {

    private static final String LOG_INJECTION_REGEX = "[\r\n]";
    private static final Logger logger = LoggerFactory.getLogger(PetHatcheryService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    public static final int EGG_SHOP_PRICE = 250;
    public static final int HATCH_DURATION_HOURS = 8;
    public static final long HATCH_DURATION_SECONDS = 28800L;

    private final IncubatingEggRepository incubatingEggRepository;
    private final StudentPetRepository studentPetRepository;
    private final UserProfileService userProfileService;

    public PetHatcheryService(
        IncubatingEggRepository incubatingEggRepository,
        StudentPetRepository studentPetRepository,
        UserProfileService userProfileService
    ) {
        this.incubatingEggRepository = incubatingEggRepository;
        this.studentPetRepository = studentPetRepository;
        this.userProfileService = userProfileService;
    }

    public EggShopItemDTO getFeaturedShopEgg() {
        Map<String, Integer> dropRates = new LinkedHashMap<>();
        dropRates.put("Common", 50);
        dropRates.put("Rare", 28);
        dropRates.put("Epic", 14);
        dropRates.put("Legendary", 6);
        dropRates.put("Mythic", 2);

        return new EggShopItemDTO(
            "mystery-egg-ancient",
            "Ancient Mysterious Egg",
            "dragon",
            EGG_SHOP_PRICE,
            HATCH_DURATION_HOURS,
            HATCH_DURATION_SECONDS,
            "A sealed celestial egg pulsing with ancient magic. The inner species and rarity are completely veiled until hatched. Awakens into a companion based on lucky drop chances!",
            dropRates
        );
    }

    public PurchaseEggResponseDTO purchaseMysteryEgg(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId must not be blank");
        }

        UserProfile updatedProfile = userProfileService.spendStars(userId, EGG_SHOP_PRICE);
        int remainingStars = updatedProfile.getStats() != null ? updatedProfile.getStats().getTotalStars() : 0;

        IncubatingEgg egg = new IncubatingEgg(userId, "Ancient Mysterious Egg", "dragon");
        egg.setMystery(true);
        egg.setHatchDurationHours(HATCH_DURATION_HOURS);
        egg.setHatchDurationSeconds(HATCH_DURATION_SECONDS);
        egg.setRemainingSeconds(HATCH_DURATION_SECONDS);
        egg.setCrackProgress(0.0);
        egg.setEquipped(false);
        egg.setEquipCostInStars(25);
        egg.setHatchedPetName("??? Mystery Companion");
        egg.setHatchedSpecies("Veiled Celestial Beast");

        IncubatingEgg saved = incubatingEggRepository.save(egg);
        logger.info("User {} purchased mystery egg {}. Remaining stars: {}", userId, saved.getId(), remainingStars);

        return new PurchaseEggResponseDTO(
            true,
            "Ancient Mysterious Egg acquired! Transferred to Incubator (8 hours hatching time).",
            toEggDTO(saved),
            remainingStars
        );
    }

    public List<IncubatingEggDTO> getIncubatorEggs(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        return incubatingEggRepository.findByUserId(userId).stream()
            .map(this::toEggDTO)
            .toList();
    }

    public IncubatingEggDTO strikeEgg(String userId, String eggId) {
        IncubatingEgg egg = incubatingEggRepository.findByIdAndUserId(eggId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Incubating egg not found: " + eggId));

        double newProgress = Math.min(1.0, egg.getCrackProgress() + 0.25);
        egg.setCrackProgress(newProgress);
        egg.setRemainingSeconds(Math.max(0L, egg.getRemainingSeconds() - 7200L));
        egg.setUpdatedAt(Instant.now());

        IncubatingEgg saved = incubatingEggRepository.save(egg);
        String safeUserId = userId != null ? userId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safeEggId = eggId != null ? eggId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        logger.info("User {} struck egg {}: progress {}%", safeUserId, safeEggId, Math.round(newProgress * 100));
        return toEggDTO(saved);
    }

    public StudentPetDTO hatchEgg(String userId, String eggId, Double fixedRoll) {
        IncubatingEgg egg = incubatingEggRepository.findByIdAndUserId(eggId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Incubating egg not found: " + eggId));

        if (egg.getCrackProgress() < 1.0 && egg.getRemainingSeconds() > 0) {
            throw new IllegalStateException("Egg is not ready to hatch yet. Progress: " + Math.round(egg.getCrackProgress() * 100) + "%");
        }

        StudentPet pet = rollMysteryPet(userId, fixedRoll);
        StudentPet savedPet = studentPetRepository.save(pet);
        incubatingEggRepository.deleteByIdAndUserId(eggId, userId);

        String safeUserId = userId != null ? userId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safeEggId = eggId != null ? eggId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safePetName = savedPet.getName() != null ? savedPet.getName().replaceAll(LOG_INJECTION_REGEX, "_") : "";
        logger.info("Egg {} hatched for user {} -> Pet {} ({}, {} stages)",
            safeEggId, safeUserId, safePetName, savedPet.getRarity(), savedPet.getTotalStages());
        return toPetDTO(savedPet);
    }

    public StudentPet rollMysteryPet(String userId, Double fixedRoll) {
        double roll = fixedRoll != null ? fixedRoll : (RANDOM.nextDouble() * 100.0);

        if (roll < 50.0) {
            // 50% Common (3 stages)
            String[] commonNames = {"Sproutling", "Pipflick", "Embersqueak", "Zephyrpuff"};
            String[] commonSpecies = {"Flora Sproutling Seedling", "Tidal Ocean Drake", "Solar Ember Tiger Cub", "Zephyr Cloud Hare"};
            String[] elements = {"Flora / Earth", "Ocean / Water", "Solar Fire / Flame", "Wind / Cloud"};
            String[] emojis = {"🌱", "💧", "🐯", "🐰"};
            int pick = RANDOM.nextInt(commonNames.length);

            StudentPet pet = new StudentPet(userId, commonNames[pick], commonSpecies[pick], "Common", 3);
            pet.setElement(elements[pick]);
            pet.setAvatarEmoji(emojis[pick]);
            pet.setStageName("Hatchling");
            return pet;
        }

        if (roll < 78.0) {
            // 28% Rare (4 stages)
            String[] rareNames = {"Frostpaw", "Magmafang", "Voltwing", "Thundercat"};
            String[] rareSpecies = {"Arctic Snow Leopard", "Caldera Molten Boar", "Tempest Storm Owl", "Raijin Thunder Lynx"};
            String[] elements = {"Frost / Ice", "Fire / Earth", "Lightning / Air", "Electric / Storm"};
            String[] emojis = {"❄️", "🐗", "⚡", "⚡"};
            int pick = RANDOM.nextInt(rareNames.length);

            StudentPet pet = new StudentPet(userId, rareNames[pick], rareSpecies[pick], "Rare", 4);
            pet.setElement(elements[pick]);
            pet.setAvatarEmoji(emojis[pick]);
            pet.setStageName("Fledgling");
            return pet;
        }

        if (roll < 92.0) {
            // 14% Epic (5 stages)
            String[] epicNames = {"Sun Ember Fledgling", "Chronopip", "Umbralpaw", "Sparkfawn"};
            String[] epicSpecies = {"Primordial Solar Phoenix", "Celestial Time Sprite", "Eclipse Umbral Panther", "Celestial Thunder Elk"};
            String[] elements = {"Solar Fire / Flame", "Temporal / Cosmic", "Shadow / Cosmic", "Lightning / Nature"};
            String[] emojis = {"🔥", "⏳", "🌑", "🦌"};
            int pick = RANDOM.nextInt(epicNames.length);

            StudentPet pet = new StudentPet(userId, epicNames[pick], epicSpecies[pick], "Epic", 5);
            pet.setElement(elements[pick]);
            pet.setAvatarEmoji(emojis[pick]);
            pet.setStageName("Sun Ember Fledgling");
            return pet;
        }

        if (roll < 98.0) {
            // 6% Legendary (6 stages)
            String[] legNames = {"Stardrop Wyrmlet", "Astraea Pip", "Solarpup"};
            String[] legSpecies = {"Celestial Astral Dragon", "Cosmic Ocean Leviathan", "Sunfire Archon Wyvern"};
            String[] elements = {"Astral / Cosmic", "Cosmic / Water", "Fire / Celestial"};
            String[] emojis = {"🌌", "🐋", "☀️"};
            int pick = RANDOM.nextInt(legNames.length);

            StudentPet pet = new StudentPet(userId, legNames[pick], legSpecies[pick], "Legendary", 6);
            pet.setElement(elements[pick]);
            pet.setAvatarEmoji(emojis[pick]);
            pet.setStageName("Cosmic Wyrmlet");
            return pet;
        }

        // 2% Mythic (8 stages)
        String[] mythicNames = {"Voidling Pip", "Chronowing Pip", "Aegis Pip"};
        String[] mythicSpecies = {"Mythic Void Abyssal Dragon", "Lord of Spacetime Chrono-Draco", "Aegis Divine Paladin Dragon"};
        String[] elements = {"Void / Singularity", "Temporal / Spacetime", "Divine / Paladin"};
        String[] emojis = {"🕳️", "⌛", "🛡️"};
        int pick = RANDOM.nextInt(mythicNames.length);

        StudentPet pet = new StudentPet(userId, mythicNames[pick], mythicSpecies[pick], "Mythic", 8);
        pet.setElement(elements[pick]);
        pet.setAvatarEmoji(emojis[pick]);
        pet.setStageName("Primal Seedling");
        return pet;
    }

    public List<StudentPetDTO> getMyPets(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        return studentPetRepository.findByUserId(userId).stream()
            .map(this::toPetDTO)
            .toList();
    }

    public GrowPetResponseDTO growPet(String userId, String petId) {
        StudentPet pet = studentPetRepository.findByIdAndUserId(petId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Pet not found: " + petId));

        int growthCost = pet.getGrowthCostInStars() > 0 ? pet.getGrowthCostInStars() : 25;
        UserProfile updatedProfile = userProfileService.spendStars(userId, growthCost);
        int remainingStars = updatedProfile.getStats() != null ? updatedProfile.getStats().getTotalStars() : 0;

        int gainedExp = 60;
        int newExp = pet.getCurrentExp() + gainedExp;
        int level = pet.getLevel();
        int expNeeded = pet.getExpNeeded();
        boolean levelGained = false;
        boolean didEvolve = false;

        if (newExp >= expNeeded && level < pet.getMaxLevel()) {
            level += 1;
            newExp -= expNeeded;
            expNeeded = (int) Math.round(expNeeded * 1.35);
            levelGained = true;

            int oldStage = pet.getStageLevel();
            int newStage = calculateStage(pet.getTotalStages(), level);
            if (newStage > oldStage) {
                pet.setStageLevel(newStage);
                pet.setStageName("Evolution Form Stage " + newStage);
                didEvolve = true;
            }

            Map<String, Integer> stats = pet.getStats();
            stats.put("vitality", Math.min(100, stats.getOrDefault("vitality", 60) + 5));
            stats.put("wisdom", Math.min(100, stats.getOrDefault("wisdom", 60) + 5));
            stats.put("integrityBond", Math.min(100, stats.getOrDefault("integrityBond", 80) + 3));
            stats.put("solarRadiance", Math.min(100, stats.getOrDefault("solarRadiance", 50) + 6));
        }

        pet.setLevel(level);
        pet.setCurrentExp(newExp);
        pet.setExpNeeded(expNeeded);
        pet.setUpdatedAt(Instant.now());

        StudentPet saved = studentPetRepository.save(pet);
        String safeUserId = userId != null ? userId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safePetId = petId != null ? petId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        logger.info("User {} grew pet {}: Level {} (Stage {}), remaining stars: {}",
            safeUserId, safePetId, level, pet.getStageLevel(), remainingStars);

        return new GrowPetResponseDTO(toPetDTO(saved), remainingStars, didEvolve, levelGained);
    }

    private static final int[][] STAGE_THRESHOLDS_3 = {{6, 3}, {3, 2}};
    private static final int[][] STAGE_THRESHOLDS_4 = {{8, 4}, {5, 3}, {3, 2}};
    private static final int[][] STAGE_THRESHOLDS_5 = {{10, 5}, {7, 4}, {5, 3}, {3, 2}};
    private static final int[][] STAGE_THRESHOLDS_6 = {{10, 6}, {8, 5}, {7, 4}, {5, 3}, {3, 2}};
    private static final int[][] STAGE_THRESHOLDS_8 = {{10, 8}, {8, 7}, {7, 6}, {6, 5}, {5, 4}, {3, 3}, {2, 2}};

    private int calculateStage(int totalStages, int level) {
        int[][] thresholds = switch (totalStages) {
            case 4 -> STAGE_THRESHOLDS_4;
            case 5 -> STAGE_THRESHOLDS_5;
            case 6 -> STAGE_THRESHOLDS_6;
            case 8 -> STAGE_THRESHOLDS_8;
            default -> STAGE_THRESHOLDS_3;
        };
        for (int[] pair : thresholds) {
            if (level >= pair[0]) {
                return pair[1];
            }
        }
        return 1;
    }

    public StudentPetDTO equipPet(String userId, String petId) {
        List<StudentPet> pets = studentPetRepository.findByUserId(userId);
        StudentPet target = null;
        for (StudentPet p : pets) {
            if (p.getId().equals(petId)) {
                p.setEquipped(true);
                target = p;
            } else {
                p.setEquipped(false);
            }
        }
        if (target == null) {
            throw new IllegalArgumentException("Pet not found: " + petId);
        }
        studentPetRepository.saveAll(pets);
        return toPetDTO(target);
    }

    public IncubatingEggDTO equipEgg(String userId, String eggId) {
        List<IncubatingEgg> eggs = incubatingEggRepository.findByUserId(userId);
        IncubatingEgg target = null;
        for (IncubatingEgg e : eggs) {
            if (e.getId().equals(eggId)) {
                e.setEquipped(true);
                target = e;
            } else {
                e.setEquipped(false);
            }
        }
        if (target == null) {
            throw new IllegalArgumentException("Egg not found: " + eggId);
        }
        incubatingEggRepository.saveAll(eggs);
        return toEggDTO(target);
    }

    public IncubatingEggDTO toEggDTO(IncubatingEgg egg) {
        return new IncubatingEggDTO(
            egg.getId(),
            egg.getUserId(),
            egg.getName(),
            egg.getTier(),
            egg.getRarity(),
            egg.getCrackProgress(),
            egg.getHatchedPetName(),
            egg.getHatchedSpecies(),
            egg.isEquipped(),
            egg.getEquipCostInStars(),
            egg.isMystery(),
            egg.getHatchDurationHours(),
            egg.getRemainingSeconds(),
            egg.getIncubatedAt(),
            egg.getCreatedAt()
        );
    }

    public StudentPetDTO toPetDTO(StudentPet pet) {
        return new StudentPetDTO(
            pet.getId(),
            pet.getUserId(),
            pet.getName(),
            pet.getSpecies(),
            pet.getRarity(),
            pet.getTier(),
            pet.getElement(),
            pet.getLevel(),
            pet.getMaxLevel(),
            pet.getCurrentExp(),
            pet.getExpNeeded(),
            pet.getGrowthCostInStars(),
            pet.getStageLevel(),
            pet.getTotalStages(),
            pet.getStageName(),
            pet.getAvatarEmoji(),
            pet.getImageUrl(),
            pet.isEquipped(),
            pet.getStats(),
            pet.getCreatedAt(),
            pet.getUpdatedAt()
        );
    }
}

