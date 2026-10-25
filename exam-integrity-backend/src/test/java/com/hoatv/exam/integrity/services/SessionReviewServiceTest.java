package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.domain.ExamSession;
import com.hoatv.exam.integrity.domain.Score;
import com.hoatv.exam.integrity.dtos.SessionResultSummaryDTO;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.ScoreRepository;
import com.hoatv.exam.integrity.repositories.SessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionReviewServiceTest {

    @Mock
    private ScoreRepository scoreRepository;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private ExamRepository examRepository;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private SessionReviewService sessionReviewService;

    @Test
    void getTeacherScoringQueueIncludesForceSubmittedSessionsWithPendingEssayScores() {
        Score pendingEssayScore = new Score();
        pendingEssayScore.setSessionId("session-timeout");
        pendingEssayScore.setQuestionId("question-1");
        pendingEssayScore.setQuestionNumber(1);
        pendingEssayScore.setQuestionType("ESSAY_SHORT");
        pendingEssayScore.setStatus(Score.ScoreStatus.PENDING_ESSAY);
        pendingEssayScore.setEarnedPoints(0);
        pendingEssayScore.setMaxPoints(5);

        ExamSession timedOutSession = new ExamSession();
        timedOutSession.setId("session-timeout");
        timedOutSession.setExamId("exam-1");
        timedOutSession.setStudentId("student-1");
        timedOutSession.setStatus(ExamSession.SessionStatus.FORCE_SUBMITTED);
        timedOutSession.setSubmittedAt(Instant.parse("2026-05-02T10:15:30Z"));

        Exam exam = new Exam();
        exam.setId("exam-1");
        exam.setTitle("Midterm Mock Exam");

        when(scoreRepository.findByStatusIn(anyCollection())).thenReturn(List.of(pendingEssayScore));
        when(sessionRepository.findById("session-timeout")).thenReturn(Optional.of(timedOutSession));
        when(scoreRepository.findBySessionId("session-timeout")).thenReturn(List.of(pendingEssayScore));
        when(examRepository.findById("exam-1")).thenReturn(Optional.of(exam));

        List<SessionResultSummaryDTO> queue = sessionReviewService.getTeacherScoringQueue();

        assertThat(queue).hasSize(1);
        SessionResultSummaryDTO summary = queue.get(0);
        assertThat(summary.sessionId()).isEqualTo("session-timeout");
        assertThat(summary.status()).isEqualTo(ExamSession.SessionStatus.FORCE_SUBMITTED.name());
        assertThat(summary.pendingEssayCount()).isEqualTo(1);
        assertThat(summary.examTitle()).isEqualTo("Midterm Mock Exam");

        verify(scoreRepository).findByStatusIn(Set.of(
            Score.ScoreStatus.SELF_GRADE_REQUIRED,
            Score.ScoreStatus.PENDING_ESSAY
        ));
    }

    @Test
    void markAllIncorrectSetsAllScoresToZeroAndIncorrectStatus() {
        ExamSession session = new ExamSession();
        session.setId("session-1");
        session.setExamId("exam-1");
        session.setStudentId("student-1");
        session.setStatus(ExamSession.SessionStatus.SUBMITTED);

        Score score1 = new Score();
        score1.setId("score-1");
        score1.setSessionId("session-1");
        score1.setQuestionId("q-1");
        score1.setQuestionNumber(1);
        score1.setQuestionType("MCQ");
        score1.setMaxPoints(2.0);
        score1.setEarnedPoints(2.0);
        score1.setStatus(Score.ScoreStatus.CORRECT);

        Score score2 = new Score();
        score2.setId("score-2");
        score2.setSessionId("session-1");
        score2.setQuestionId("q-2");
        score2.setQuestionNumber(2);
        score2.setQuestionType("ESSAY");
        score2.setMaxPoints(8.0);
        score2.setEarnedPoints(4.0);
        score2.setStatus(Score.ScoreStatus.PENDING_ESSAY);

        Exam exam = new Exam();
        exam.setId("exam-1");
        exam.setTitle("Midterm Exam");
        exam.setQuestions(List.of());

        when(sessionRepository.findById("session-1")).thenReturn(Optional.of(session));
        when(examRepository.findById("exam-1")).thenReturn(Optional.of(exam));
        when(scoreRepository.findBySessionId("session-1")).thenReturn(List.of(score1, score2));

        var dashboard = sessionReviewService.markAllIncorrect("session-1");

        assertThat(score1.getEarnedPoints()).isEqualTo(0.0);
        assertThat(score1.getStatus()).isEqualTo(Score.ScoreStatus.INCORRECT);
        assertThat(score2.getEarnedPoints()).isEqualTo(0.0);
        assertThat(score2.getStatus()).isEqualTo(Score.ScoreStatus.INCORRECT);

        verify(scoreRepository).saveAll(List.of(score1, score2));
        verify(userProfileService).recordSessionCompletion("student-1", "session-1", 0.0, 0);

        assertThat(dashboard.sessionId()).isEqualTo("session-1");
        assertThat(dashboard.totalEarned()).isEqualTo(0.0);
        assertThat(dashboard.finalScore10()).isEqualTo(0.0);
        assertThat(dashboard.scores()).hasSize(2);
        assertThat(dashboard.scores()).allMatch(s -> s.earnedPoints() == 0.0 && "INCORRECT".equals(s.status()));
    }
}