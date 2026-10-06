package com.hoatv.exam.integrity.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.exam.integrity.dtos.ExamDTO;
import com.hoatv.exam.integrity.dtos.SyncExamQuestionsSummaryDTO;
import com.hoatv.exam.integrity.services.ExamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ExamControllerTest {

    @Mock
    private ExamService examService;

    @InjectMocks
    private ExamController examController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(examController).build();
    }

    @Test
    void syncQuestionsReturns200WithSummary() throws Exception {
        ExamDTO updatedExam = new ExamDTO(
            "exam-1",
            "Calculus",
            3600,
            5.0,
            5,
            List.of("math"),
            List.of(),
            "ACTIVE"
        );
        SyncExamQuestionsSummaryDTO summary = new SyncExamQuestionsSummaryDTO(
            "exam-1",
            5,
            4,
            1,
            List.of(),
            updatedExam
        );

        when(examService.syncQuestionsFromBank("exam-1")).thenReturn(summary);

        mockMvc.perform(post("/api/exams/exam-1/sync-questions"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.examId").value("exam-1"))
            .andExpect(jsonPath("$.totalQuestions").value(5))
            .andExpect(jsonPath("$.syncedCount").value(4))
            .andExpect(jsonPath("$.unlinkedCount").value(1))
            .andExpect(jsonPath("$.updatedExam.title").value("Calculus"));

        verify(examService).syncQuestionsFromBank("exam-1");
    }

    @Test
    void syncQuestionsReturns404WhenExamNotFound() throws Exception {
        when(examService.syncQuestionsFromBank("missing-exam"))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        mockMvc.perform(post("/api/exams/missing-exam/sync-questions"))
            .andExpect(status().isNotFound());
    }
}
