package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.events.ProctorAlertEvent;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;

@RestController
@RequestMapping("/api/sessions/{sessionId}/proctor")
@Tag(name = "Proctoring", description = "Anti-cheat event capture during exam session")
public class ProctorController {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ProctorController(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Operation(
        summary = "Report a proctoring event",
        description = "Called by the UI proctoring hook on suspicious actions."
            + " Events are forwarded to Kafka topic proctor.alert for async risk scoring."
            + " Sessions with riskScore >= 70 are flagged for teacher review."
            + " Known eventType values:"
            + " TAB_BLUR (student switched tab),"
            + " TAB_FOCUS (student returned),"
            + " COPY_PASTE (Ctrl+C detected),"
            + " CONTEXT_MENU (right-click blocked),"
            + " FULLSCREEN_EXIT (fullscreen exited).",
        parameters = {
            @Parameter(name = "eventType", description = "Anti-cheat event type", example = "TAB_BLUR"),
            @Parameter(name = "studentId", description = "Keycloak subject of the student", example = "student-uuid")
        },
        responses = {
            @ApiResponse(responseCode = "202", description = "Event queued"),
            @ApiResponse(responseCode = "404", description = "Session not found")
        }
    )
    @PostMapping("/events")
    public ResponseEntity<Void> reportEvent(
            @PathVariable("sessionId") String sessionId,
            @RequestParam("eventType") String eventType,
            @RequestParam("studentId") String studentId) {
        ProctorAlertEvent event = new ProctorAlertEvent(
            sessionId, studentId, eventType, 10, Instant.now()
        );
        kafkaTemplate.send("proctor.alert", sessionId, event);
        return ResponseEntity.accepted().build();
    }
}
