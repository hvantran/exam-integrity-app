package com.hoatv.exam.integrity.dtos;

import java.util.List;

public record UserProfileGamificationDTO(
    int level,
    List<String> badges,
    List<String> unlockedAvatars
) {}

