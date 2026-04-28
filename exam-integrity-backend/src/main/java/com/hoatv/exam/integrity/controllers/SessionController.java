package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.*;
import com.hoatv.exam.integrity.services.SessionService;
import com.hoatv.exam.integrity.services.ScoringOrchestratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@Tag(name = "Exam Session", description = "Session lifecycle: create, answer, submit, review")
public class SessionController {

    private final SessionService sessionService;
    private final ScoringOrchestratorService scoringService;

    public SessionController(SessionService sessionService,
                             ScoringOrchestratorService scoringService) {
        this.sessionService = sessionService;
        this.scoringService = scoringService;
    }

    @PostMapping
    public ResponseEntity<SessionDTO> createSession(
            @RequestParam("examId") String examId,
            @RequestParam("studentId") String studentId) {
        return ResponseEntity.ok(sessionService.createSession(examId, studentId));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionDTO> getSession(@PathVariable("sessionId") String sessionId) {
        return sessionService.findSession(sessionId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{sessionId}/timer")
    public ResponseEntity<Long> getTimer(@PathVariable("sessionId") String sessionId) {
        return ResponseEntity.ok(sessionService.getRemainingSeconds(sessionId));
    }

    @GetMapping("/{sessionId}/questions/{questionNumber}")
    public ResponseEntity<QuestionSummaryDTO> getQuestion(
            @PathVariable("sessionId") String sessionId,
            @PathVariable("questionNumber") int questionNumber) {
        return ResponseEntity.ok(sessionService.getQuestion(sessionId, questionNumber));
    }

    @PatchMapping("/{sessionId}/answers/{questionId}")
    public ResponseEntity<Void> saveAnswer(
            @PathVariable("sessionId") String sessionId,
            @PathVariable("questionId") String questionId,
            @Valid @RequestBody AnswerDTO answerDTO) {
        sessionService.saveAnswer(sessionId, questionId, answerDTO.answer(), answerDTO.flaggedForReview());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<Void> submitExam(@PathVariable("sessionId") String sessionId) {
        sessionService.submitExam(sessionId, false);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/{sessionId}/review")
    public ResponseEntity<ReviewDashboardDTO> getReviewDashboard(@PathVariable("sessionId") String sessionId) {
        return scoringService.getReviewDashboard(sessionId)
            .map(dash -> dash.scores().stream()
                .anyMatch(s -> "PENDING_ESSAY".equals(s.status()))
                ? ResponseEntity.accepted().<ReviewDashboardDTO>build()
                : ResponseEntity.ok(dash))
            .orElse(ResponseEntity.notFound().build());
    }
}
