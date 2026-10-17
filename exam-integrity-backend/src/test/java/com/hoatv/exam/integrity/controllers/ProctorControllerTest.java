package com.hoatv.exam.integrity.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.exam.integrity.dtos.ProctorEventRequestDTO;
import com.hoatv.exam.integrity.events.ProctorAlertEvent;
import com.hoatv.springboot.common.advices.DefaultExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProctorControllerTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        ProctorController controller = new ProctorController(kafkaTemplate);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new DefaultExceptionHandler())
            .build();
    }

    @Test
    void reportEventWithRequestBodyQueuesEvent() throws Exception {
        ProctorEventRequestDTO request = new ProctorEventRequestDTO("TAB_BLUR", "student-123");

        mockMvc.perform(post("/api/sessions/sess-1/proctor/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isAccepted());

        ArgumentCaptor<ProctorAlertEvent> captor = ArgumentCaptor.forClass(ProctorAlertEvent.class);
        verify(kafkaTemplate).send(eq("proctor.alert"), eq("sess-1"), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("TAB_BLUR");
        assertThat(captor.getValue().studentId()).isEqualTo("student-123");
    }

    @Test
    void reportEventWithQueryParamsQueuesEvent() throws Exception {
        mockMvc.perform(post("/api/sessions/sess-2/proctor/events")
                .param("eventType", "COPY_PASTE")
                .param("studentId", "student-456"))
            .andExpect(status().isAccepted());

        ArgumentCaptor<ProctorAlertEvent> captor = ArgumentCaptor.forClass(ProctorAlertEvent.class);
        verify(kafkaTemplate).send(eq("proctor.alert"), eq("sess-2"), captor.capture());
        assertThat(captor.getValue().eventType()).isEqualTo("COPY_PASTE");
        assertThat(captor.getValue().studentId()).isEqualTo("student-456");
    }

    @Test
    void reportEventMissingEventTypeThrowsBadRequest() throws Exception {
        ProctorEventRequestDTO request = new ProctorEventRequestDTO("", "student-123");

        mockMvc.perform(post("/api/sessions/sess-1/proctor/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void reportEventMissingStudentIdThrowsBadRequest() throws Exception {
        ProctorEventRequestDTO request = new ProctorEventRequestDTO("TAB_BLUR", null);

        mockMvc.perform(post("/api/sessions/sess-1/proctor/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
