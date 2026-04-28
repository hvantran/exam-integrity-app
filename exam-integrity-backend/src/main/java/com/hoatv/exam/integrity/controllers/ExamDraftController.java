package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.*;
import com.hoatv.exam.integrity.services.ExamDraftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

/**
 * Teacher-facing draft lifecycle:
 * Upload PDF -> Review questions -> Patch corrections -> Publish as Exam
 */
@RestController
@RequestMapping("/api/drafts")
@Tag(name = "Exam Draft", description = "PDF ingestion, draft review and publishing workflow")
public class ExamDraftController {

    private final ExamDraftService draftService;

    public ExamDraftController(ExamDraftService draftService) {
        this.draftService = draftService;
    }

    @Operation(
        summary = "Upload a PDF and create an exam draft",
        description = "Forwards the PDF to pdf-ingestion-service, receives ParsedExam,"
            + " stores as ExamDraft (status=PENDING_REVIEW)."
            + " If the PDF has multiple exam sets, returns status=MULTI_SET_DETECTED"
            + " and the UI must show a set-picker before re-calling with ?exam_set_index=N.",
        parameters = {
            @Parameter(name = "exam_set_index",
                description = "0-based index of the exam set to import. Required for multi-set PDFs.",
                example = "0")
        },
        responses = {
            @ApiResponse(responseCode = "201", description = "Draft created (status=PENDING_REVIEW)"),
            @ApiResponse(responseCode = "202", description = "Multi-set PDF: show set picker (status=MULTI_SET_DETECTED)"),
            @ApiResponse(responseCode = "400", description = "Not a PDF or empty file"),
            @ApiResponse(responseCode = "422", description = "PDF unreadable or corrupt")
        }
    )
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ExamDraftSummaryDTO> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(name = "examSetIndex", required = false) Integer examSetIndex) {
        ExamDraftSummaryDTO result = draftService.uploadPdf(file, examSetIndex);
        HttpStatus status = "MULTI_SET_DETECTED".equals(result.status()) ? HttpStatus.ACCEPTED : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(result);
    }

    @Operation(
        summary = "List exam drafts for the current teacher",
        description = "Returns summary cards (no question content). Filter by status.",
        parameters = {
            @Parameter(name = "status",
                description = "PENDING_REVIEW | UNDER_REVIEW | APPROVED | REJECTED",
                example = "PENDING_REVIEW")
        },
        responses = {
            @ApiResponse(responseCode = "200", description = "List of draft summary cards")
        }
    )
    @GetMapping
    public ResponseEntity<List<ExamDraftSummaryDTO>> listDrafts(
            @RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(draftService.listDrafts(status));
    }

    @GetMapping("/{draftId}")
    public ResponseEntity<FullDraftDTO> getDraft(@PathVariable("draftId") String draftId) {
        return ResponseEntity.ok(draftService.getDraftFull(draftId));
    }

    @PatchMapping("/{draftId}/questions/{questionId}")
    public ResponseEntity<Void> editQuestion(
            @PathVariable("draftId") String draftId,
            @PathVariable("questionId") String questionId,
            @Valid @RequestBody DraftQuestionEditCommand command) {
        draftService.editQuestion(draftId, questionId, command);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{draftId}/questions/{questionId}")
    public ResponseEntity<Void> removeQuestion(
            @PathVariable("draftId") String draftId,
            @PathVariable("questionId") String questionId) {
        draftService.removeQuestion(draftId, questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{draftId}/questions")
    public ResponseEntity<DraftQuestionDTO> addQuestion(
            @PathVariable("draftId") String draftId,
            @RequestParam(name = "position", required = false) Integer position,
            @Valid @RequestBody DraftQuestionEditCommand command) {
        DraftQuestionDTO created = draftService.addQuestion(draftId, command, position);
        return ResponseEntity.status(201).body(created);
    }

    @PostMapping("/{draftId}/publish")
    public ResponseEntity<ExamDTO> publishDraft(
            @PathVariable("draftId") String draftId,
            @Valid @RequestBody ExamDraftPublishCommand command) {
        return ResponseEntity.status(201).body(draftService.publishDraft(draftId, command));
    }

    @PostMapping("/{draftId}/reject")
    public ResponseEntity<Void> rejectDraft(
            @PathVariable("draftId") String draftId,
            @RequestParam(name = "reason", required = false) String reason) {
        draftService.rejectDraft(draftId, reason);
        return ResponseEntity.noContent().build();
    }
}
