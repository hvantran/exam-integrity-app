package com.hoatv.exam.integrity.dtos;

import java.util.List;

public record PetLibraryItemDTO(
    String id,
    String petKey,
    String name,
    String species,
    String rarity,
    String tier,
    String element,
    String avatarEmoji,
    int totalStages,
    int maxLevel,
    int eggShopPrice,
    int hatchDurationHours,
    String description,
    String bannerGradient,
    List<PetStageDTO> stages
) {}

