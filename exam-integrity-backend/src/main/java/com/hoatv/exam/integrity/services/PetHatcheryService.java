package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.IncubatingEgg;
import com.hoatv.exam.integrity.domain.PetLibraryItem;
import com.hoatv.exam.integrity.domain.PetStageDefinition;
import com.hoatv.exam.integrity.domain.StudentPet;
import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.dtos.EggShopItemDTO;
import com.hoatv.exam.integrity.dtos.GrowPetResponseDTO;
import com.hoatv.exam.integrity.dtos.IncubatingEggDTO;
import com.hoatv.exam.integrity.dtos.PetLibraryItemDTO;
import com.hoatv.exam.integrity.dtos.PetStageDTO;
import com.hoatv.exam.integrity.dtos.PurchaseEggResponseDTO;
import com.hoatv.exam.integrity.dtos.StudentPetDTO;
import com.hoatv.exam.integrity.repositories.IncubatingEggRepository;
import com.hoatv.exam.integrity.repositories.PetLibraryRepository;
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

    private static final String RARITY_COMMON = "Common";
    private static final String RARITY_RARE = "Rare";
    private static final String RARITY_EPIC = "Epic";
    private static final String RARITY_LEGENDARY = "Legendary";
    private static final String RARITY_MYTHIC = "Mythic";

    private static final String PET_SPROUTLING = "sproutling";

    public static final int EGG_SHOP_PRICE = 250;
    public static final int HATCH_DURATION_HOURS = 8;
    public static final long HATCH_DURATION_SECONDS = 28800L;
    public static final int STRIKE_CRACK_STAR_COST = 25;

    private record RollTier(double maxRoll, String rarity, int totalStages, List<String> keys) {}

    private static final List<RollTier> ROLL_TIERS = List.of(
        new RollTier(50.0, RARITY_COMMON, 3, List.of(PET_SPROUTLING, "pipflick", "embersqueak", "zephyrpuff")),
        new RollTier(78.0, RARITY_RARE, 4, List.of("frostpaw", "magmafang", "voltwing", "thundercat")),
        new RollTier(92.0, RARITY_EPIC, 5, List.of("phoenix", "chronochimera", "shadowpanther", "stormstag")),
        new RollTier(98.0, RARITY_LEGENDARY, 6, List.of("astraldragon", "astralleviathan", "solarwyvern")),
        new RollTier(100.0, RARITY_MYTHIC, 8, List.of("voiddragon", "chronodraco", "aegispaladin"))
    );

    private final IncubatingEggRepository incubatingEggRepository;
    private final StudentPetRepository studentPetRepository;
    private final PetLibraryRepository petLibraryRepository;
    private final UserProfileService userProfileService;

    public PetHatcheryService(
        IncubatingEggRepository incubatingEggRepository,
        StudentPetRepository studentPetRepository,
        PetLibraryRepository petLibraryRepository,
        UserProfileService userProfileService
    ) {
        this.incubatingEggRepository = incubatingEggRepository;
        this.studentPetRepository = studentPetRepository;
        this.petLibraryRepository = petLibraryRepository;
        this.userProfileService = userProfileService;
    }

    public EggShopItemDTO getFeaturedShopEgg() {
        Map<String, Integer> dropRates = new LinkedHashMap<>();
        dropRates.put(RARITY_COMMON, 50);
        dropRates.put(RARITY_RARE, 28);
        dropRates.put(RARITY_EPIC, 14);
        dropRates.put(RARITY_LEGENDARY, 6);
        dropRates.put(RARITY_MYTHIC, 2);

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

        userProfileService.spendStars(userId, STRIKE_CRACK_STAR_COST);

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

        RollTier selectedTier = ROLL_TIERS.get(ROLL_TIERS.size() - 1);
        for (RollTier tier : ROLL_TIERS) {
            if (roll < tier.maxRoll()) {
                selectedTier = tier;
                break;
            }
        }

        String petKey = selectedTier.keys().get(RANDOM.nextInt(selectedTier.keys().size()));
        String rarity = selectedTier.rarity();
        int totalStages = selectedTier.totalStages();

        StudentPet pet = new StudentPet(userId, petKey, petKey, rarity, totalStages);
        pet.setPetLibraryId(petKey);

        var libOpt = petLibraryRepository.findByPetKey(petKey);
        if (libOpt.isPresent()) {
            applyLibraryItemToPet(pet, libOpt.get());
        } else {
            pet.setImageName(petKey + "-stage-1.png");
            pet.setStageName("Hatchling");
        }
        return pet;
    }

    public List<PetLibraryItemDTO> syncPetLibrary(List<PetLibraryItemDTO> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        for (PetLibraryItemDTO dto : items) {
            syncSinglePetLibraryItem(dto);
        }
        logger.info("Synced {} pet library items into pet_library collection", items.size());
        return getPetLibrary();
    }

    private void syncSinglePetLibraryItem(PetLibraryItemDTO dto) {
        String key = (dto.petKey() != null && !dto.petKey().isBlank()) ? dto.petKey() : dto.id();
        PetLibraryItem item = petLibraryRepository.findByPetKey(key)
            .orElseGet(() -> {
                PetLibraryItem newItem = new PetLibraryItem();
                newItem.setId(key);
                newItem.setPetKey(key);
                return newItem;
            });

        item.setName(dto.name());
        item.setSpecies(dto.species());
        if (dto.rarity() != null) item.setRarity(dto.rarity());
        if (dto.tier() != null) item.setTier(dto.tier());
        if (dto.element() != null) item.setElement(dto.element());
        if (dto.avatarEmoji() != null) item.setAvatarEmoji(dto.avatarEmoji());
        if (dto.totalStages() > 0) item.setTotalStages(dto.totalStages());
        if (dto.maxLevel() > 0) item.setMaxLevel(dto.maxLevel());
        if (dto.eggShopPrice() > 0) item.setEggShopPrice(dto.eggShopPrice());
        if (dto.hatchDurationHours() > 0) item.setHatchDurationHours(dto.hatchDurationHours());
        item.setDescription(dto.description());
        item.setBannerGradient(dto.bannerGradient());

        if (dto.stages() != null) {
            List<PetStageDefinition> stageDefs = dto.stages().stream()
                .map(s -> new PetStageDefinition(
                    s.stage(),
                    s.minLevel(),
                    s.name(),
                    s.title(),
                    s.description(),
                    s.avatarEmoji(),
                    s.imageName()
                ))
                .toList();
            item.setStages(stageDefs);
        }
        item.setUpdatedAt(Instant.now());
        petLibraryRepository.save(item);
    }

    public List<PetLibraryItemDTO> getPetLibrary() {
        return petLibraryRepository.findAll().stream()
            .map(this::toLibraryDTO)
            .toList();
    }

    private PetLibraryItemDTO toLibraryDTO(PetLibraryItem item) {
        List<PetStageDTO> stages = (item.getStages() != null) ? item.getStages().stream()
            .map(s -> new PetStageDTO(
                s.getStage(),
                s.getMinLevel(),
                s.getName(),
                s.getTitle(),
                s.getDescription(),
                s.getAvatarEmoji(),
                s.getImageName()
            ))
            .toList() : List.of();

        return new PetLibraryItemDTO(
            item.getId(),
            item.getPetKey(),
            item.getName(),
            item.getSpecies(),
            item.getRarity(),
            item.getTier(),
            item.getElement(),
            item.getAvatarEmoji(),
            item.getTotalStages(),
            item.getMaxLevel(),
            item.getEggShopPrice(),
            item.getHatchDurationHours(),
            item.getDescription(),
            item.getBannerGradient(),
            stages
        );
    }

    public List<StudentPetDTO> getMyPets(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        List<StudentPet> pets = studentPetRepository.findByUserId(userId);
        if (pets.isEmpty()) {
            StudentPet starter = createStarterPet(userId);
            StudentPet saved = studentPetRepository.save(starter);
            return List.of(toPetDTO(saved));
        }
        return pets.stream()
            .map(this::toPetDTO)
            .toList();
    }

    private StudentPet createStarterPet(String userId) {
        StudentPet pet = new StudentPet(userId, "Sproutling", "Flora Sproutling Seedling", RARITY_COMMON, 3);
        pet.setElement("Flora / Earth");
        pet.setAvatarEmoji("🌱");
        pet.setStageName("Hatchling");
        pet.setImageName("sproutling-stage-1.png");
        pet.setPetLibraryId(PET_SPROUTLING);
        pet.setEquipped(true);

        petLibraryRepository.findByPetKey(PET_SPROUTLING).ifPresent(lib -> applyLibraryItemToPet(pet, lib));
        return pet;
    }

    private void applyLibraryItemToPet(StudentPet pet, PetLibraryItem lib) {
        pet.setName(lib.getName());
        pet.setSpecies(lib.getSpecies());
        pet.setRarity(lib.getRarity());
        pet.setTier(lib.getTier());
        pet.setElement(lib.getElement());
        pet.setAvatarEmoji(lib.getAvatarEmoji());
        pet.setTotalStages(lib.getTotalStages());
        if (lib.getStages() != null && !lib.getStages().isEmpty()) {
            PetStageDefinition st1 = lib.getStages().get(0);
            pet.setStageName(st1.getName());
            pet.setImageName(st1.getImageName());
        }
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
            didEvolve = checkAndApplyEvolution(pet, level);
            boostStatsOnLevelUp(pet);
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

    private boolean checkAndApplyEvolution(StudentPet pet, int level) {
        int oldStage = pet.getStageLevel();
        int newStage = calculateStage(pet.getTotalStages(), level);
        if (newStage <= oldStage) {
            return false;
        }

        pet.setStageLevel(newStage);
        pet.setStageName("Evolution Form Stage " + newStage);
        updateStageDetailsFromLibrary(pet, newStage);
        return true;
    }

    private void updateStageDetailsFromLibrary(StudentPet pet, int newStage) {
        if (pet.getPetLibraryId() == null) {
            return;
        }
        petLibraryRepository.findByPetKey(pet.getPetLibraryId()).ifPresent(libItem -> {
            if (libItem.getStages() == null) {
                return;
            }
            libItem.getStages().stream()
                .filter(s -> s.getStage() == newStage)
                .findFirst()
                .ifPresent(stageDef -> {
                    pet.setStageName(stageDef.getName());
                    if (stageDef.getImageName() != null && !stageDef.getImageName().isBlank()) {
                        pet.setImageName(stageDef.getImageName());
                    }
                });
        });
    }

    private void boostStatsOnLevelUp(StudentPet pet) {
        Map<String, Integer> stats = pet.getStats();
        stats.put("vitality", Math.min(100, stats.getOrDefault("vitality", 60) + 5));
        stats.put("wisdom", Math.min(100, stats.getOrDefault("wisdom", 60) + 5));
        stats.put("integrityBond", Math.min(100, stats.getOrDefault("integrityBond", 80) + 3));
        stats.put("solarRadiance", Math.min(100, stats.getOrDefault("solarRadiance", 50) + 6));
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
            egg.getImageUrl(),
            egg.getImageName(),
            egg.getPetLibraryId(),
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
            pet.getImageName(),
            pet.getPetLibraryId(),
            pet.isEquipped(),
            pet.getStats(),
            pet.getCreatedAt(),
            pet.getUpdatedAt()
        );
    }
}
