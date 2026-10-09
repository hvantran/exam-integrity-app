package com.hoatv.exam.integrity.dtos;

import java.time.Instant;
import java.util.Map;

public record UserProfileDTO(
    String id,
    String userId,
    String role,
    Integer grade,
    UserProfileStatsDTO stats,
    UserProfileGamificationDTO gamification,
    Map<String, Object> preferences,
    Map<String, Object> metadata,
    Instant createdAt,
    Instant updatedAt
) {}

