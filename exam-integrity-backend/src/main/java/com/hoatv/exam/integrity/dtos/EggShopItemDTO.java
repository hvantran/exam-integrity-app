package com.hoatv.exam.integrity.dtos;

import java.util.Map;

public record EggShopItemDTO(
    String id,
    String name,
    String tier,
    int price,
    int hatchDurationHours,
    long hatchDurationSeconds,
    String description,
    Map<String, Integer> rarityDropPercentages
) {}

