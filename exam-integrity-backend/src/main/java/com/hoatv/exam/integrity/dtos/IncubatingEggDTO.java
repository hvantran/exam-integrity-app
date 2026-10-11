package com.hoatv.exam.integrity.dtos;

import java.time.Instant;

public record IncubatingEggDTO(
    String id,
    String userId,
    String name,
    String tier,
    String rarity,
    double crackProgress,
    String hatchedPetName,
    String hatchedSpecies,
    boolean isEquipped,
    int equipCostInStars,
    boolean isMystery,
    int hatchDurationHours,
    long remainingSeconds,
    String imageUrl,
    String imageName,
    String petLibraryId,
    Instant incubatedAt,
    Instant createdAt
) {}

