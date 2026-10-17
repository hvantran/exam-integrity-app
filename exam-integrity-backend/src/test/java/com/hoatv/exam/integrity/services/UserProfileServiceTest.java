package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.dtos.UserProfileDTO;
import com.hoatv.exam.integrity.repositories.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private SettingService settingService;

    @InjectMocks
    private UserProfileService userProfileService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        org.mockito.Mockito.lenient().when(settingService.getDouble(SettingService.KEY_STARS_PER_SCORE_POINT, 1.0)).thenReturn(1.0);
        org.mockito.Mockito.lenient().when(settingService.getDouble(SettingService.KEY_STARS_PER_ANSWERED_QUESTION, 0.5)).thenReturn(0.5);
        org.mockito.Mockito.lenient().when(settingService.getInt(SettingService.KEY_STARS_PER_USER_LEVEL, 20)).thenReturn(20);
    }

    @Test
    void getOrCreateProfileCreatesNewProfileWhenNotFound() {
        when(userProfileRepository.findByUserId("student1")).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfile profile = userProfileService.getOrCreateProfile("student1", "STUDENT", 5);

        assertThat(profile).isNotNull();
        assertThat(profile.getUserId()).isEqualTo("student1");
        assertThat(profile.getRole()).isEqualTo("STUDENT");
        assertThat(profile.getGrade()).isEqualTo(5);
        assertThat(profile.getStats().getTotalStars()).isZero();
        assertThat(profile.getGamification().getLevel()).isEqualTo(1);
    }

    @Test
    void recordSessionCompletionAwardsStarsAndAccumulates() {
        UserProfile existing = new UserProfile("student1", "STUDENT", 5);
        when(userProfileRepository.findByUserId("student1")).thenReturn(Optional.of(existing));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // First session: score 8.5 -> 9 stars (0 + 9 = 9)
        UserProfileDTO result1 = userProfileService.recordSessionCompletion("student1", "sess-1", 8.5);
        assertThat(result1.stats().totalStars()).isEqualTo(9);
        assertThat(result1.stats().completedExams()).isEqualTo(1);
        assertThat(result1.stats().highestScore10()).isEqualTo(8.5);

        // Second session: score 10.0 -> 10 stars (9 + 10 = 19)
        UserProfileDTO result2 = userProfileService.recordSessionCompletion("student1", "sess-2", 10.0);
        assertThat(result2.stats().totalStars()).isEqualTo(19);
        assertThat(result2.stats().completedExams()).isEqualTo(2);
        assertThat(result2.stats().highestScore10()).isEqualTo(10.0);

        // Third session: score 10.0 -> 10 stars (19 + 10 = 29 -> level increases to 2)
        UserProfileDTO result3 = userProfileService.recordSessionCompletion("student1", "sess-3", 10.0);
        assertThat(result3.stats().totalStars()).isEqualTo(29);
        assertThat(result3.stats().completedExams()).isEqualTo(3);
        assertThat(result3.gamification().level()).isEqualTo(2);
    }

    @Test
    void recordSessionCompletionAddsEarnedStarsToCurrentTotalStars() {
        UserProfile existing = new UserProfile("student1", "STUDENT", 5);
        existing.getSessionStars().put("sess-old-1", 10);
        existing.getSessionStars().put("sess-old-2", 20);
        existing.getSessionStars().put("sess-old-3", 20);
        existing.getStats().setTotalStars(50);
        existing.getStats().setCompletedExams(3);
        existing.getStats().setHighestScore10(8.0);
        when(userProfileRepository.findByUserId("student1")).thenReturn(Optional.of(existing));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Current 50 stars + 8 earned stars = 58 stars
        UserProfileDTO result = userProfileService.recordSessionCompletion("student1", "sess-new", 8.0);

        assertThat(result.stats().totalStars()).isEqualTo(58);
        assertThat(result.stats().completedExams()).isEqualTo(4);
        assertThat(result.stats().highestScore10()).isEqualTo(8.0);
        assertThat(result.gamification().level()).isEqualTo(3); // 58 / 20 + 1 = 3
    }

    @Test
    void recordSessionCompletionAppliesDeltaWhenRescoringSameSession() {
        UserProfile existing = new UserProfile("student1", "STUDENT", 5);
        when(userProfileRepository.findByUserId("student1")).thenReturn(Optional.of(existing));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Initial completion: score 5.0 -> 5 stars
        UserProfileDTO initial = userProfileService.recordSessionCompletion("student1", "sess-1", 5.0);
        assertThat(initial.stats().totalStars()).isEqualTo(5);
        assertThat(initial.stats().completedExams()).isEqualTo(1);

        // Teacher reviews question 1 (saves score with same total): score 5.0 -> delta 0 -> stays 5 stars
        UserProfileDTO rescoreSame = userProfileService.recordSessionCompletion("student1", "sess-1", 5.0);
        assertThat(rescoreSame.stats().totalStars()).isEqualTo(5);
        assertThat(rescoreSame.stats().completedExams()).isEqualTo(1);

        // Teacher marks question 2 correct: score increases to 8.0 -> delta +3 (8 - 5) -> 8 stars
        UserProfileDTO rescoreIncrease = userProfileService.recordSessionCompletion("student1", "sess-1", 8.0);
        assertThat(rescoreIncrease.stats().totalStars()).isEqualTo(8);
        assertThat(rescoreIncrease.stats().completedExams()).isEqualTo(1);

        // Teacher adjusts score down: score becomes 7.0 -> delta -1 (7 - 8) -> 7 stars
        UserProfileDTO rescoreDecrease = userProfileService.recordSessionCompletion("student1", "sess-1", 7.0);
        assertThat(rescoreDecrease.stats().totalStars()).isEqualTo(7);
        assertThat(rescoreDecrease.stats().completedExams()).isEqualTo(1);
    }

    @Test
    void recordSessionCompletionAwardsStarsForAnsweredQuestions() {
        UserProfile existing = new UserProfile("student1", "STUDENT", 5);
        when(userProfileRepository.findByUserId("student1")).thenReturn(Optional.of(existing));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Score 8.0 (8 stars) + 10 answered questions (10 * 0.5 = 5 stars) -> 13 stars
        UserProfileDTO result = userProfileService.recordSessionCompletion("student1", "sess-answered", 8.0, 10);

        assertThat(result.stats().totalStars()).isEqualTo(13);
        assertThat(result.stats().completedExams()).isEqualTo(1);
        assertThat(result.stats().highestScore10()).isEqualTo(8.0);
    }
}

