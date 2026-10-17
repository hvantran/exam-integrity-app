package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.domain.ExamSession;
import com.hoatv.exam.integrity.dtos.SessionDTO;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.SessionRepository;
import com.hoatv.exam.integrity.security.UserContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.hoatv.fwk.common.exceptions.DuplicateResourceException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private ExamRepository examRepository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private SessionReviewService sessionReviewService;

    @InjectMocks
    private SessionService sessionService;

    @AfterEach
    void tearDown() {
        UserContext.clear();
    }

    @Test
    void studentWithGrade1CannotStartExamForGrade4() {
        Exam exam = new Exam();
        exam.setId("exam-4");
        exam.setTitle("Grade 4 Science");
        exam.setTags(List.of("science", "grade 4"));

        when(examRepository.findById("exam-4")).thenReturn(Optional.of(exam));

        UserContext.setStudent(true);
        UserContext.setStudentGrade(1);

        assertThatThrownBy(() -> sessionService.createSession("exam-4", "student1"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(rse.getReason()).contains("Student grade 1 cannot access exam for grade 4");
                });
    }

    @Test
    void studentWithGrade4CanStartExamForGrade4() {
        Exam exam = new Exam();
        exam.setId("exam-4");
        exam.setTitle("Grade 4 Science");
        exam.setDurationSeconds(1800);
        exam.setTags(List.of("science", "grade 4"));

        when(examRepository.findById("exam-4")).thenReturn(Optional.of(exam));
        when(sessionRepository.findFirstByStudentIdAndStatus("student1", ExamSession.SessionStatus.ACTIVE))
                .thenReturn(Optional.empty());

        @SuppressWarnings("unchecked")
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);
        @SuppressWarnings("unchecked")
        SetOperations<String, String> setOps = mock(SetOperations.class);

        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(redisTemplate.opsForSet()).thenReturn(setOps);

        UserContext.setStudent(true);
        UserContext.setStudentGrade(4);

        SessionDTO sessionDTO = sessionService.createSession("exam-4", "student1");
        assertThat(sessionDTO).isNotNull();
        assertThat(sessionDTO.examId()).isEqualTo("exam-4");
        verify(sessionRepository).save(any(ExamSession.class));
    }

    @Test
    void cannotStartNewExamWhenAnotherExamSessionIsActive() {
        Exam exam2 = new Exam();
        exam2.setId("exam-2");
        exam2.setTitle("Grade 4 Math");
        exam2.setDurationSeconds(1800);
        when(examRepository.findById("exam-2")).thenReturn(Optional.of(exam2));

        ExamSession activeSession = new ExamSession();
        activeSession.setId("sess-active-1");
        activeSession.setExamId("exam-1");
        activeSession.setStudentId("student1");
        activeSession.setStatus(ExamSession.SessionStatus.ACTIVE);
        activeSession.setStartedAt(java.time.Instant.now());

        when(sessionRepository.findFirstByStudentIdAndStatus("student1", ExamSession.SessionStatus.ACTIVE))
                .thenReturn(Optional.of(activeSession));
        when(redisTemplate.getExpire("timer:sess-active-1", java.util.concurrent.TimeUnit.SECONDS))
                .thenReturn(600L);

        assertThatThrownBy(() -> sessionService.createSession("exam-2", "student1"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Student already has an active session in progress for another exam");
    }

    @Test
    void cannotStartSameExamWhenSessionIsAlreadyActive() {
        Exam exam1 = new Exam();
        exam1.setId("exam-1");
        exam1.setTitle("Grade 4 Science");
        exam1.setDurationSeconds(1800);
        when(examRepository.findById("exam-1")).thenReturn(Optional.of(exam1));

        ExamSession activeSession = new ExamSession();
        activeSession.setId("sess-active-1");
        activeSession.setExamId("exam-1");
        activeSession.setStudentId("student1");
        activeSession.setStatus(ExamSession.SessionStatus.ACTIVE);
        activeSession.setStartedAt(java.time.Instant.now());

        when(sessionRepository.findFirstByStudentIdAndStatus("student1", ExamSession.SessionStatus.ACTIVE))
                .thenReturn(Optional.of(activeSession));
        when(redisTemplate.getExpire("timer:sess-active-1", java.util.concurrent.TimeUnit.SECONDS))
                .thenReturn(600L);

        assertThatThrownBy(() -> sessionService.createSession("exam-1", "student1"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Student already has an active session for this exam");
    }
}

