package com.hoatv.exam.integrity.dtos;

import java.time.Instant;
import java.util.Map;

public record StudentPetDTO(
    String id,
    String userId,
    String name,
    String species,
    String rarity,
    String tier,
    String element,
    int level,
    int maxLevel,
    int currentExp,
    int expNeeded,
    int growthCostInStars,
    int stageLevel,
    int totalStages,
    String stageName,
    String avatarEmoji,
    String imageUrl,
    String imageName,
    String avatarIcon,
    String backgroundImage,
    String petLibraryId,
    boolean isEquipped,
    Map<String, Integer> stats,
    Instant createdAt,
    Instant updatedAt
) {
    public StudentPetDTO(
        String id,
        String userId,
        String name,
        String species,
        String rarity,
        String tier,
        String element,
        int level,
        int maxLevel,
        int currentExp,
        int expNeeded,
        int growthCostInStars,
        int stageLevel,
        int totalStages,
        String stageName,
        String avatarEmoji,
        String imageUrl,
        String imageName,
        String petLibraryId,
        boolean isEquipped,
        Map<String, Integer> stats,
        Instant createdAt,
        Instant updatedAt
    ) {
        this(id, userId, name, species, rarity, tier, element, level, maxLevel, currentExp,
             expNeeded, growthCostInStars, stageLevel, totalStages, stageName, avatarEmoji,
             imageUrl, imageName, null, null, petLibraryId, isEquipped, stats, createdAt, updatedAt);
    }
}

