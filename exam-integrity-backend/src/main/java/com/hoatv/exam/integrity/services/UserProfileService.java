package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.domain.UserProfileGamification;
import com.hoatv.exam.integrity.domain.UserProfileStats;
import com.hoatv.exam.integrity.dtos.UserProfileDTO;
import com.hoatv.exam.integrity.dtos.UserProfileGamificationDTO;
import com.hoatv.exam.integrity.dtos.UserProfileStatsDTO;
import com.hoatv.exam.integrity.repositories.UserProfileRepository;
import com.hoatv.fwk.common.exceptions.InvalidArgumentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UserProfileService {

    public static final String ROLE_STUDENT = "STUDENT";
    private static final Logger logger = LoggerFactory.getLogger(UserProfileService.class);

    private final UserProfileRepository userProfileRepository;
    private final SettingService settingService;

    public UserProfileService(UserProfileRepository userProfileRepository, SettingService settingService) {
        this.userProfileRepository = userProfileRepository;
        this.settingService = settingService;
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
                UserProfile newProfile = new UserProfile(finalUserId, role != null ? role : ROLE_STUDENT, grade);
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
        return recordSessionCompletion(userId, sessionId, finalScore10, 0);
    }

    public UserProfileDTO recordSessionCompletion(String userId, String sessionId, double finalScore10, int answeredQuestionsCount) {
        validateSessionCompletionInput(userId, sessionId);

        UserProfile profile = getOrCreateProfile(userId, ROLE_STUDENT, null);
        int starsEarned = calculateStarsEarned(finalScore10, answeredQuestionsCount);

        updateProfileStats(profile, sessionId, starsEarned, finalScore10);
        updateGamificationLevel(profile);

        profile.setUpdatedAt(Instant.now());
        UserProfile saved = userProfileRepository.save(profile);
        logger.info("Updated stars for user {}: session {} awarded {} stars (total: {})",
            userId, sessionId, starsEarned, saved.getStats().getTotalStars());
        return toDTO(saved);
    }

    private void validateSessionCompletionInput(String userId, String sessionId) {
        if (userId == null || userId.isBlank() || sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("userId and sessionId must not be blank");
        }
    }

    public int calculateStarsEarned(double finalScore10) {
        return calculateStarsEarned(finalScore10, 0);
    }

    public int calculateStarsEarned(double finalScore10, int answeredQuestionsCount) {
        double starRatio = settingService.getDouble(SettingService.KEY_STARS_PER_SCORE_POINT, 1.0);
        double questionStarRatio = settingService.getDouble(SettingService.KEY_STARS_PER_ANSWERED_QUESTION, 0.5);
        double scoreStars = finalScore10 * starRatio;
        double questionStars = Math.max(0, answeredQuestionsCount) * questionStarRatio;
        int starsEarned = (int) Math.round(scoreStars + questionStars);
        return Math.max(0, starsEarned);
    }

    private void updateProfileStats(UserProfile profile, String sessionId, int starsEarned, double finalScore10) {
        if (profile.getSessionStars() == null) {
            profile.setSessionStars(new HashMap<>());
        }
        int previousStars = profile.getSessionStars().getOrDefault(sessionId, 0);
        int starDelta = starsEarned - previousStars;
        profile.getSessionStars().put(sessionId, starsEarned);

        if (profile.getStats() == null) {
            profile.setStats(new UserProfileStats());
        }

        UserProfileStats stats = profile.getStats();
        int currentTotalStars = stats.getTotalStars();
        stats.setTotalStars(Math.max(0, currentTotalStars + starDelta));
        stats.setCompletedExams(profile.getSessionStars().size());
        stats.setHighestScore10(Math.max(stats.getHighestScore10(), finalScore10));
    }

    private void updateGamificationLevel(UserProfile profile) {
        if (profile.getGamification() == null) {
            profile.setGamification(new UserProfileGamification());
        }
        int totalStars = profile.getStats() != null ? profile.getStats().getTotalStars() : 0;
        int starsPerLevel = settingService.getInt(SettingService.KEY_STARS_PER_USER_LEVEL, 20);
        int divisor = starsPerLevel > 0 ? starsPerLevel : 20;
        int level = Math.max(1, (totalStars / divisor) + 1);
        profile.getGamification().setLevel(level);
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
        UserProfile profile = getOrCreateProfile(userId, ROLE_STUDENT, null);
        if (profile.getStats() == null) {
            profile.setStats(new UserProfileStats());
        }
        int currentStars = profile.getStats().getTotalStars();
        if (currentStars < stars) {
            throw new InvalidArgumentException("Insufficient stars: requires " + stars + " but have " + currentStars);
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

