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
    boolean isEquipped,
    Map<String, Integer> stats,
    Instant createdAt,
    Instant updatedAt
) {}

