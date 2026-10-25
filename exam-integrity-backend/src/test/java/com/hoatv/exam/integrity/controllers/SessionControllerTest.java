package com.hoatv.exam.integrity.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.exam.integrity.dtos.ReviewDashboardDTO;
import com.hoatv.exam.integrity.dtos.TeacherScoreUpdateDTO;
import com.hoatv.exam.integrity.services.SessionReviewService;
import com.hoatv.exam.integrity.services.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SessionControllerTest {

    @Mock
    private SessionService sessionService;

    @Mock
    private SessionReviewService sessionReviewService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        SessionController controller = new SessionController(sessionService, sessionReviewService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void markAllIncorrectCallsServiceAndReturnsDashboard() throws Exception {
        ReviewDashboardDTO dashboard = new ReviewDashboardDTO(
            "session-1",
            0.0,
            10.0,
            0.0,
            List.of(1, 2),
            List.of()
        );

        when(sessionReviewService.markAllIncorrect("session-1")).thenReturn(dashboard);

        mockMvc.perform(post("/api/sessions/session-1/scores/mark-all-incorrect"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sessionId").value("session-1"))
            .andExpect(jsonPath("$.finalScore10").value(0.0))
            .andExpect(jsonPath("$.totalEarned").value(0.0));

        verify(sessionReviewService).markAllIncorrect("session-1");
    }

    @Test
    void updateTeacherScoreCallsServiceAndReturnsDashboard() throws Exception {
        TeacherScoreUpdateDTO updateDTO = new TeacherScoreUpdateDTO(4.5, "Good work");
        ReviewDashboardDTO dashboard = new ReviewDashboardDTO(
            "session-1",
            4.5,
            10.0,
            4.5,
            List.of(),
            List.of()
        );

        when(sessionReviewService.gradeEssay(eq("session-1"), eq("q-1"), any(TeacherScoreUpdateDTO.class)))
            .thenReturn(dashboard);

        mockMvc.perform(patch("/api/sessions/session-1/scores/q-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sessionId").value("session-1"))
            .andExpect(jsonPath("$.finalScore10").value(4.5));

        verify(sessionReviewService).gradeEssay(eq("session-1"), eq("q-1"), any(TeacherScoreUpdateDTO.class));
    }
}
