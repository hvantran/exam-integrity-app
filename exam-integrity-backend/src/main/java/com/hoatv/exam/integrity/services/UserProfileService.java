package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.domain.UserProfileGamification;
import com.hoatv.exam.integrity.domain.UserProfileStats;
import com.hoatv.exam.integrity.dtos.UserProfileDTO;
import com.hoatv.exam.integrity.dtos.UserProfileGamificationDTO;
import com.hoatv.exam.integrity.dtos.UserProfileStatsDTO;
import com.hoatv.exam.integrity.repositories.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
public class UserProfileService {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileService.class);

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfile getOrCreateProfile(String userId, String role, Integer grade) {
        if (userId == null || userId.isBlank()) {
            userId = "guest";
        }
        final String finalUserId = userId;
        return userProfileRepository.findByUserId(userId)
            .map(profile -> {
                boolean changed = false;
                if (grade != null && !grade.equals(profile.getGrade())) {
                    profile.setGrade(grade);
                    changed = true;
                }
                if (role != null && !role.equals(profile.getRole())) {
                    profile.setRole(role);
                    changed = true;
                }
                if (changed) {
                    profile.setUpdatedAt(Instant.now());
                    return userProfileRepository.save(profile);
                }
                return profile;
            })
            .orElseGet(() -> {
                UserProfile newProfile = new UserProfile(finalUserId, role != null ? role : "STUDENT", grade);
                newProfile.getGamification().setLevel(1);
                logger.info("Creating initial user profile for {}", finalUserId);
                return userProfileRepository.save(newProfile);
            });
    }

    public Optional<UserProfileDTO> findByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return Optional.empty();
        }
        return userProfileRepository.findByUserId(userId).map(this::toDTO);
    }

    public UserProfileDTO recordSessionCompletion(String userId, String sessionId, double finalScore10) {
        if (userId == null || userId.isBlank() || sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("userId and sessionId must not be blank");
        }

        UserProfile profile = getOrCreateProfile(userId, "STUDENT", null);
        int starsEarned = (int) Math.round(finalScore10);
        if (starsEarned < 0) {
            starsEarned = 0;
        }

        Map<String, Integer> sessionStars = profile.getSessionStars();
        sessionStars.put(sessionId, starsEarned);

        int totalStars = sessionStars.values().stream().mapToInt(Integer::intValue).sum();
        int completedExams = sessionStars.size();
        double highestScore10 = Math.max(
            profile.getStats() != null ? profile.getStats().getHighestScore10() : 0.0,
            finalScore10
        );

        if (profile.getStats() == null) {
            profile.setStats(new UserProfileStats());
        }
        profile.getStats().setTotalStars(totalStars);
        profile.getStats().setCompletedExams(completedExams);
        profile.getStats().setHighestScore10(highestScore10);

        if (profile.getGamification() == null) {
            profile.setGamification(new UserProfileGamification());
        }
        // Advance level every 20 stars earned
        int level = Math.max(1, (totalStars / 20) + 1);
        profile.getGamification().setLevel(level);

        profile.setUpdatedAt(Instant.now());
        UserProfile saved = userProfileRepository.save(profile);
        logger.info("Updated stars for user {}: session {} awarded {} stars (total: {})",
            userId, sessionId, starsEarned, totalStars);
        return toDTO(saved);
    }

    public int getStarBalance(String userId) {
        return userProfileRepository.findByUserId(userId)
            .map(p -> p.getStats() != null ? p.getStats().getTotalStars() : 0)
            .orElse(0);
    }

    public UserProfile spendStars(String userId, int stars) {
        if (stars <= 0) {
            throw new IllegalArgumentException("Stars to spend must be greater than 0");
        }
        UserProfile profile = getOrCreateProfile(userId, "STUDENT", null);
        if (profile.getStats() == null) {
            profile.setStats(new UserProfileStats());
        }
        int currentStars = profile.getStats().getTotalStars();
        if (currentStars < stars) {
            throw new IllegalStateException("Insufficient stars: requires " + stars + " but have " + currentStars);
        }
        profile.getStats().setTotalStars(currentStars - stars);
        profile.setUpdatedAt(Instant.now());
        UserProfile saved = userProfileRepository.save(profile);
        logger.info("User {} spent {} stars. New balance: {}", userId, stars, profile.getStats().getTotalStars());
        return saved;
    }

    public UserProfileDTO toDTO(UserProfile profile) {
        UserProfileStats stats = profile.getStats() != null ? profile.getStats() : new UserProfileStats();
        UserProfileGamification gamification = profile.getGamification() != null
            ? profile.getGamification()
            : new UserProfileGamification();

        UserProfileStatsDTO statsDTO = new UserProfileStatsDTO(
            stats.getTotalStars(),
            stats.getCompletedExams(),
            stats.getHighestScore10()
        );

        UserProfileGamificationDTO gamificationDTO = new UserProfileGamificationDTO(
            gamification.getLevel(),
            gamification.getBadges(),
            gamification.getUnlockedAvatars()
        );

        return new UserProfileDTO(
            profile.getId(),
            profile.getUserId(),
            profile.getRole(),
            profile.getGrade(),
            statsDTO,
            gamificationDTO,
            profile.getPreferences(),
            profile.getMetadata(),
            profile.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }
}

