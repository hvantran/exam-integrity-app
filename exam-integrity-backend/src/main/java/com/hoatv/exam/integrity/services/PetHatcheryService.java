package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.PetLibraryItem;
import com.hoatv.exam.integrity.domain.PetStageDefinition;
import com.hoatv.exam.integrity.domain.StudentItem;
import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.dtos.EggShopItemDTO;
import com.hoatv.exam.integrity.dtos.GrowPetResponseDTO;
import com.hoatv.exam.integrity.dtos.IncubatingEggDTO;
import com.hoatv.exam.integrity.dtos.PetLibraryItemDTO;
import com.hoatv.exam.integrity.dtos.PetStageDTO;
import com.hoatv.exam.integrity.dtos.PurchaseEggResponseDTO;
import com.hoatv.exam.integrity.dtos.StudentPetDTO;
import com.hoatv.exam.integrity.repositories.PetLibraryRepository;
import com.hoatv.exam.integrity.repositories.StudentItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
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
    private static final String TIER_DRAGON = "dragon";

    public static final int EGG_SHOP_PRICE = 250;
    public static final int HATCH_DURATION_HOURS = 8;
    public static final long HATCH_DURATION_SECONDS = 28800L;
    public static final int STRIKE_CRACK_STAR_COST = 25;

    private record RollTier(double maxRoll, String rarity, int totalStages, List<String> keys) {}

    private final StudentItemRepository studentItemRepository;
    private final PetLibraryRepository petLibraryRepository;
    private final UserProfileService userProfileService;
    private final SettingService settingService;

    public PetHatcheryService(
        StudentItemRepository studentItemRepository,
        PetLibraryRepository petLibraryRepository,
        UserProfileService userProfileService,
        SettingService settingService
    ) {
        this.studentItemRepository = studentItemRepository;
        this.petLibraryRepository = petLibraryRepository;
        this.userProfileService = userProfileService;
        this.settingService = settingService;
    }

    public List<RollTier> getRollTiers() {
        int common = settingService.getInt(SettingService.KEY_EGG_DROP_RATE_COMMON, 50);
        int rare = settingService.getInt(SettingService.KEY_EGG_DROP_RATE_RARE, 28);
        int epic = settingService.getInt(SettingService.KEY_EGG_DROP_RATE_EPIC, 14);
        int legendary = settingService.getInt(SettingService.KEY_EGG_DROP_RATE_LEGENDARY, 6);
        int mythic = settingService.getInt(SettingService.KEY_EGG_DROP_RATE_MYTHIC, 2);

        double total = Math.max(1, common + rare + epic + legendary + mythic);
        double commonMax = (common / total) * 100.0;
        double rareMax = commonMax + (rare / total) * 100.0;
        double epicMax = rareMax + (epic / total) * 100.0;
        double legendaryMax = epicMax + (legendary / total) * 100.0;

        return List.of(
            new RollTier(commonMax, RARITY_COMMON, 3, List.of(PET_SPROUTLING, "pipflick", "embersqueak", "zephyrpuff")),
            new RollTier(rareMax, RARITY_RARE, 4, List.of("frostpaw", "magmafang", "voltwing", "thundercat")),
            new RollTier(epicMax, RARITY_EPIC, 5, List.of("phoenix", "chronochimera", "shadowpanther", "stormstag")),
            new RollTier(legendaryMax, RARITY_LEGENDARY, 6, List.of("astraldragon", "astralleviathan", "solarwyvern")),
            new RollTier(100.0, RARITY_MYTHIC, 8, List.of("voiddragon", "chronodraco", "aegispaladin"))
        );
    }

    public EggShopItemDTO getFeaturedShopEgg() {
        int price = settingService.getInt(SettingService.KEY_EGG_SHOP_PRICE_STARS, EGG_SHOP_PRICE);
        int hatchHours = settingService.getInt(SettingService.KEY_EGG_HATCH_DURATION_HOURS, HATCH_DURATION_HOURS);
        long hatchSeconds = hatchHours * 3600L;

        Map<String, Integer> dropRates = new LinkedHashMap<>();
        dropRates.put(RARITY_COMMON, settingService.getInt(SettingService.KEY_EGG_DROP_RATE_COMMON, 50));
        dropRates.put(RARITY_RARE, settingService.getInt(SettingService.KEY_EGG_DROP_RATE_RARE, 28));
        dropRates.put(RARITY_EPIC, settingService.getInt(SettingService.KEY_EGG_DROP_RATE_EPIC, 14));
        dropRates.put(RARITY_LEGENDARY, settingService.getInt(SettingService.KEY_EGG_DROP_RATE_LEGENDARY, 6));
        dropRates.put(RARITY_MYTHIC, settingService.getInt(SettingService.KEY_EGG_DROP_RATE_MYTHIC, 2));

        return new EggShopItemDTO(
            "mystery-egg-ancient",
            "Ancient Mysterious Egg",
            TIER_DRAGON,
            price,
            hatchHours,
            hatchSeconds,
            "A sealed celestial egg pulsing with ancient magic. The inner species and rarity are completely veiled until hatched. Awakens into a companion based on lucky drop chances!",
            dropRates
        );
    }

    public PurchaseEggResponseDTO purchaseMysteryEgg(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId must not be blank");
        }

        int price = settingService.getInt(SettingService.KEY_EGG_SHOP_PRICE_STARS, EGG_SHOP_PRICE);
        int hatchHours = settingService.getInt(SettingService.KEY_EGG_HATCH_DURATION_HOURS, HATCH_DURATION_HOURS);
        long hatchSeconds = hatchHours * 3600L;

        UserProfile updatedProfile = userProfileService.spendStars(userId, price);
        int remainingStars = updatedProfile.getStats() != null ? updatedProfile.getStats().getTotalStars() : 0;

        StudentItem egg = StudentItem.builder()
            .userId(userId)
            .category(StudentItem.CATEGORY_EGG_SHOP)
            .name("Ancient Mysterious Egg")
            .tier(TIER_DRAGON)
            .rarity(RARITY_COMMON)
            .isMystery(true)
            .crackProgress(0.0)
            .isEquipped(false)
            .hatchedPetName("??? Mystery Companion")
            .hatchedSpecies("Veiled Celestial Beast")
            .incubatedAt(Instant.now())
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        StudentItem saved = studentItemRepository.save(egg);
        logger.info("User {} purchased mystery egg {}. Remaining stars: {}", userId, saved.getId(), remainingStars);

        return new PurchaseEggResponseDTO(
            true,
            "Ancient Mysterious Egg acquired! Transferred to Incubator (" + hatchHours + " hours hatching time).",
            toEggDTO(saved),
            remainingStars
        );
    }

    public List<IncubatingEggDTO> getIncubatorEggs(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        return studentItemRepository.findByUserIdAndCategory(userId, StudentItem.CATEGORY_EGG_SHOP).stream()
            .map(this::toEggDTO)
            .toList();
    }

    public IncubatingEggDTO strikeEgg(String userId, String eggId) {
        StudentItem egg = studentItemRepository.findByIdAndUserIdAndCategory(eggId, userId, StudentItem.CATEGORY_EGG_SHOP)
            .orElseThrow(() -> new IllegalArgumentException("Incubating egg not found: " + eggId));

        int strikeCost = settingService.getInt(SettingService.KEY_STRIKE_CRACK_STAR_COST, STRIKE_CRACK_STAR_COST);
        double progressBoost = settingService.getDouble(SettingService.KEY_STRIKE_CRACK_PROGRESS_BOOST, 0.25);
        long timeReduced = settingService.getLong(SettingService.KEY_STRIKE_CRACK_TIME_REDUCED_SECONDS, 7200L);

        userProfileService.spendStars(userId, strikeCost);

        double newProgress = Math.min(1.0, egg.getCrackProgress() + progressBoost);
        egg.setCrackProgress(newProgress);
        Instant currentIncubatedAt = egg.getIncubatedAt() != null ? egg.getIncubatedAt() : Instant.now();
        egg.setIncubatedAt(currentIncubatedAt.minusSeconds(timeReduced));
        egg.setUpdatedAt(Instant.now());

        StudentItem saved = studentItemRepository.save(egg);
        String safeUserId = userId != null ? userId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safeEggId = eggId != null ? eggId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        logger.info("User {} struck egg {}: progress {}%", safeUserId, safeEggId, Math.round(newProgress * 100));
        return toEggDTO(saved);
    }

    public StudentPetDTO hatchEgg(String userId, String eggId, Double fixedRoll) {
        StudentItem egg = studentItemRepository.findByIdAndUserIdAndCategory(eggId, userId, StudentItem.CATEGORY_EGG_SHOP)
            .orElseThrow(() -> new IllegalArgumentException("Incubating egg not found: " + eggId));

        long remainingSeconds = calculateRemainingHatchingSeconds(egg);
        if (egg.getCrackProgress() < 1.0 && remainingSeconds > 0) {
            throw new IllegalStateException("Egg is not ready to hatch yet. Progress: " + Math.round(egg.getCrackProgress() * 100) + "%");
        }

        StudentItem pet = rollMysteryPet(userId, fixedRoll);
        StudentItem savedPet = studentItemRepository.save(pet);
        studentItemRepository.deleteByIdAndUserIdAndCategory(eggId, userId, StudentItem.CATEGORY_EGG_SHOP);

        String safeUserId = userId != null ? userId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safeEggId = eggId != null ? eggId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safePetName = savedPet.getName() != null ? savedPet.getName().replaceAll(LOG_INJECTION_REGEX, "_") : "";
        logger.info("Egg {} hatched for user {} -> Pet {} ({}, {} stages)",
            safeEggId, safeUserId, safePetName, savedPet.getRarity(), savedPet.getTotalStages());
        return toPetDTO(savedPet);
    }

    public StudentItem rollMysteryPet(String userId, Double fixedRoll) {
        double roll = fixedRoll != null ? fixedRoll : (RANDOM.nextDouble() * 100.0);

        List<RollTier> tiers = getRollTiers();
        RollTier selectedTier = tiers.get(tiers.size() - 1);
        for (RollTier tier : tiers) {
            if (roll < tier.maxRoll()) {
                selectedTier = tier;
                break;
            }
        }

        String petKey = selectedTier.keys().get(RANDOM.nextInt(selectedTier.keys().size()));
        String rarity = selectedTier.rarity();
        int totalStages = selectedTier.totalStages();

        StudentItem pet = StudentItem.builder()
            .userId(userId)
            .category(StudentItem.CATEGORY_PET)
            .name(petKey)
            .species(petKey)
            .rarity(rarity)
            .tier(TIER_DRAGON)
            .element("Fire / Flame")
            .avatarEmoji("🐣")
            .totalStages(totalStages)
            .petLibraryId(petKey)
            .level(1)
            .currentExp(0)
            .expNeeded(100)
            .stageLevel(1)
            .stageName("Hatchling")
            .imageName(petKey + "-stage-1.png")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        pet.initDefaultStats();

        var libOpt = petLibraryRepository.findByPetKey(petKey);
        if (libOpt.isPresent()) {
            applyLibraryItemToPet(pet, libOpt.get());
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
        List<StudentItem> pets = studentItemRepository.findByUserIdAndCategory(userId, StudentItem.CATEGORY_PET);
        if (pets.isEmpty()) {
            StudentItem starter = createStarterPet(userId);
            StudentItem saved = studentItemRepository.save(starter);
            return List.of(toPetDTO(saved));
        }
        return pets.stream()
            .map(this::toPetDTO)
            .toList();
    }

    private StudentItem createStarterPet(String userId) {
        StudentItem pet = StudentItem.builder()
            .userId(userId)
            .category(StudentItem.CATEGORY_PET)
            .name("Sproutling")
            .species("Flora Sproutling Seedling")
            .rarity(RARITY_COMMON)
            .tier(TIER_DRAGON)
            .totalStages(3)
            .element("Flora / Earth")
            .avatarEmoji("🌱")
            .stageName("Hatchling")
            .imageName("sproutling-stage-1.png")
            .petLibraryId(PET_SPROUTLING)
            .isEquipped(true)
            .level(1)
            .currentExp(0)
            .expNeeded(100)
            .stageLevel(1)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        pet.initDefaultStats();

        petLibraryRepository.findByPetKey(PET_SPROUTLING).ifPresent(lib -> applyLibraryItemToPet(pet, lib));
        return pet;
    }

    private void applyLibraryItemToPet(StudentItem pet, PetLibraryItem lib) {
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
        StudentItem pet = studentItemRepository.findByIdAndUserIdAndCategory(petId, userId, StudentItem.CATEGORY_PET)
            .orElseThrow(() -> new IllegalArgumentException("Pet not found: " + petId));

        int maxLevel = settingService.getInt(SettingService.KEY_PET_MAX_LEVEL, 10);
        if (pet.getLevel() >= maxLevel) {
            throw new IllegalStateException("Pet has already reached maximum level: " + maxLevel);
        }

        int growthCost = settingService.getInt(SettingService.KEY_PET_GROW_STAR_COST, 25);
        int gainedExp = settingService.getInt(SettingService.KEY_PET_GROW_EXP_GAIN, 60);
        double expMultiplier = settingService.getDouble(SettingService.KEY_PET_EXP_GROWTH_MULTIPLIER, 1.35);

        UserProfile updatedProfile = userProfileService.spendStars(userId, growthCost);
        int remainingStars = updatedProfile.getStats() != null ? updatedProfile.getStats().getTotalStars() : 0;

        int newExp = pet.getCurrentExp() + gainedExp;
        int level = pet.getLevel();
        int expNeeded = pet.getExpNeeded();
        boolean levelGained = false;
        boolean didEvolve = false;

        if (newExp >= expNeeded && level < maxLevel) {
            level += 1;
            newExp -= expNeeded;
            expNeeded = (int) Math.round(expNeeded * expMultiplier);
            levelGained = true;
            didEvolve = checkAndApplyEvolution(pet, level);
            boostStatsOnLevelUp(pet);
        }

        pet.setLevel(level);
        pet.setCurrentExp(newExp);
        pet.setExpNeeded(expNeeded);
        pet.setUpdatedAt(Instant.now());

        StudentItem saved = studentItemRepository.save(pet);
        String safeUserId = userId != null ? userId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        String safePetId = petId != null ? petId.replaceAll(LOG_INJECTION_REGEX, "_") : "";
        logger.info("User {} grew pet {}: Level {} (Stage {}), remaining stars: {}",
            safeUserId, safePetId, level, pet.getStageLevel(), remainingStars);

        return new GrowPetResponseDTO(toPetDTO(saved), remainingStars, didEvolve, levelGained);
    }

    private boolean checkAndApplyEvolution(StudentItem pet, int level) {
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

    private void updateStageDetailsFromLibrary(StudentItem pet, int newStage) {
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

    private void boostStatsOnLevelUp(StudentItem pet) {
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
        List<StudentItem> pets = studentItemRepository.findByUserIdAndCategory(userId, StudentItem.CATEGORY_PET);
        StudentItem target = null;
        for (StudentItem p : pets) {
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
        studentItemRepository.saveAll(pets);
        return toPetDTO(target);
    }

    public IncubatingEggDTO equipEgg(String userId, String eggId) {
        List<StudentItem> eggs = studentItemRepository.findByUserIdAndCategory(userId, StudentItem.CATEGORY_EGG_SHOP);
        StudentItem target = null;
        for (StudentItem e : eggs) {
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
        studentItemRepository.saveAll(eggs);
        return toEggDTO(target);
    }

    public long calculateRemainingHatchingSeconds(StudentItem egg) {
        if (egg == null) {
            return 0L;
        }
        int hatchHours = settingService.getInt(SettingService.KEY_EGG_HATCH_DURATION_HOURS, HATCH_DURATION_HOURS);
        long hatchSeconds = hatchHours * 3600L;
        Instant incubatedAt = egg.getIncubatedAt() != null ? egg.getIncubatedAt() : egg.getCreatedAt();
        if (incubatedAt == null) {
            return hatchSeconds;
        }
        long elapsedSeconds = Math.max(0L, Duration.between(incubatedAt, Instant.now()).getSeconds());
        return Math.max(0L, hatchSeconds - elapsedSeconds);
    }

    public IncubatingEggDTO toEggDTO(StudentItem egg) {
        int equipCost = settingService.getInt(SettingService.KEY_EQUIP_EGG_STAR_COST, 25);
        int hatchHours = settingService.getInt(SettingService.KEY_EGG_HATCH_DURATION_HOURS, HATCH_DURATION_HOURS);
        long remainingSeconds = calculateRemainingHatchingSeconds(egg);
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
            equipCost,
            egg.isMystery(),
            hatchHours,
            remainingSeconds,
            egg.getImageUrl(),
            egg.getImageName(),
            egg.getPetLibraryId(),
            egg.getIncubatedAt(),
            egg.getCreatedAt()
        );
    }

    public StudentPetDTO toPetDTO(StudentItem pet) {
        int growthCost = settingService.getInt(SettingService.KEY_PET_GROW_STAR_COST, 25);
        int maxLevel = settingService.getInt(SettingService.KEY_PET_MAX_LEVEL, 10);
        return new StudentPetDTO(
            pet.getId(),
            pet.getUserId(),
            pet.getName(),
            pet.getSpecies(),
            pet.getRarity(),
            pet.getTier(),
            pet.getElement(),
            pet.getLevel(),
            maxLevel,
            pet.getCurrentExp(),
            pet.getExpNeeded(),
            growthCost,
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
