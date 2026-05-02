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
}