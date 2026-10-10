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

    @InjectMocks
    private UserProfileService userProfileService;

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

        // First session: score 8.5 -> 9 stars
        UserProfileDTO result1 = userProfileService.recordSessionCompletion("student1", "sess-1", 8.5);
        assertThat(result1.stats().totalStars()).isEqualTo(9);
        assertThat(result1.stats().completedExams()).isEqualTo(1);
        assertThat(result1.stats().highestScore10()).isEqualTo(8.5);

        // Second session: score 10.0 -> 10 stars (total = 19 stars)
        UserProfileDTO result2 = userProfileService.recordSessionCompletion("student1", "sess-2", 10.0);
        assertThat(result2.stats().totalStars()).isEqualTo(19);
        assertThat(result2.stats().completedExams()).isEqualTo(2);
        assertThat(result2.stats().highestScore10()).isEqualTo(10.0);

        // Re-scoring sess-1 with score 9.0 -> 9 stars (total remains 19, no duplicate)
        UserProfileDTO result3 = userProfileService.recordSessionCompletion("student1", "sess-1", 9.0);
        assertThat(result3.stats().totalStars()).isEqualTo(19);
        assertThat(result3.stats().completedExams()).isEqualTo(2);

        // Third session: score 10.0 -> total stars 29 -> level increases to 2
        UserProfileDTO result4 = userProfileService.recordSessionCompletion("student1", "sess-3", 10.0);
        assertThat(result4.stats().totalStars()).isEqualTo(29);
        assertThat(result4.gamification().level()).isEqualTo(2);
    }
}

