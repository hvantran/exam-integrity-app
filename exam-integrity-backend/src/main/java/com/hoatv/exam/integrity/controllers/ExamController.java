package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.CreateExamFromBankCommand;
import com.hoatv.exam.integrity.dtos.ExamDTO;
import com.hoatv.exam.integrity.dtos.ExamExportPayload;
import com.hoatv.exam.integrity.dtos.ExamImportPayload;
import com.hoatv.exam.integrity.dtos.UpdateExamQuestionsFromBankCommand;
import com.hoatv.exam.integrity.services.ExamService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@Tag(name = "Exam Management", description = "Browse and retrieve published exams (ACTIVE status only)")
public class ExamController {

    private final ExamService examService;
    private final ObjectMapper objectMapper;

    public ExamController(ExamService examService, ObjectMapper objectMapper) {
        this.examService = examService;
        this.objectMapper = objectMapper;
    }

    @Operation(
        summary = "List all active exams",
        description = "Returns summary cards for all ACTIVE exams. Optionally filter by one or more tags.",
        parameters = {
            @Parameter(name = "tags", description = "Tags to filter by, e.g. toan,lop4", example = "toan,lop4")
        },
        responses = {
            @ApiResponse(responseCode = "200", description = "List of exam summary cards")
        }
    )
    @GetMapping
    public ResponseEntity<List<ExamDTO>> listExams(
            @RequestParam(name = "tags", required = false) List<String> tags) {
        return ResponseEntity.ok(examService.listActive(tags));
    }

    @Operation(
        summary = "List all exams",
        description = "Returns every exam for teacher management regardless of status.",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of exam summary cards")
        }
    )
    @GetMapping("/all")
    public ResponseEntity<List<ExamDTO>> listAllExams() {
        return ResponseEntity.ok(examService.listAllExams());
    }

    @Operation(
        summary = "Get a single exam by ID (with all questions)",
        description = "Returns full exam including every question. Used when starting a session.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Exam found"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
        }
    )
    @GetMapping("/{examId}")
    public ResponseEntity<ExamDTO> getExam(@PathVariable("examId") String examId) {
        return examService.getFullExam(examId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Create exam from random question bank sample",
        description = "Randomly picks mcqCount MCQ questions, essayShortCount essay short questions, and essayLongCount essay long questions from the question bank and creates a new ACTIVE exam.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Exam created"),
            @ApiResponse(responseCode = "400", description = "Invalid counts"),
            @ApiResponse(responseCode = "422", description = "Not enough questions in bank")
        }
    )
    @PostMapping("/from-bank")
    public ResponseEntity<ExamDTO> createFromBank(@RequestBody CreateExamFromBankCommand cmd) {
        ExamDTO created = examService.createFromBank(cmd);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
        summary = "Replace exam questions from question bank",
        description = "Replaces an existing exam's question list with selected question-bank items while preserving exam metadata.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Exam updated"),
            @ApiResponse(responseCode = "404", description = "Exam or question bank item not found"),
            @ApiResponse(responseCode = "422", description = "Question selection violates exam constraints")
        }
    )
    @PutMapping("/{examId}/questions/from-bank")
    public ResponseEntity<ExamDTO> updateQuestionsFromBank(
            @PathVariable("examId") String examId,
            @RequestBody UpdateExamQuestionsFromBankCommand cmd) {
        return ResponseEntity.ok(examService.updateQuestionsFromBank(examId, cmd));
    }

    @Operation(
        summary = "Import exam from JSON file",
        description = "Accepts a JSON file with exam metadata and questions, then creates an ACTIVE exam.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Exam imported"),
            @ApiResponse(responseCode = "400", description = "Invalid JSON payload")
        }
    )
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExamDTO> importExam(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ExamImportPayload payload = objectMapper.readValue(file.getInputStream(), ExamImportPayload.class);
            ExamDTO created = examService.importFromJson(payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IOException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(
        summary = "Export exam as JSON",
        description = "Returns a JSON file containing exam metadata and all questions.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Exam JSON exported"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
        }
    )
    @GetMapping(value = "/{examId}/export", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> exportExam(@PathVariable("examId") String examId) throws IOException {
        ExamExportPayload payload = examService.exportToJson(examId);
        byte[] jsonBytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(payload);

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=exam-" + examId + ".json")
            .contentType(MediaType.APPLICATION_JSON)
            .body(jsonBytes);
    }

    @Operation(
        summary = "Delete an exam",
        description = "Deletes the exam document only. Questions remain in the question bank.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Exam deleted"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
        }
    )
    @DeleteMapping("/{examId}")
    public ResponseEntity<Void> deleteExam(@PathVariable("examId") String examId) {
        examService.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(
        summary = "List all unique tags",
        description = "Returns all unique tags assigned to exams.",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of unique tags")
        }
    )
    @GetMapping("/tags")
    public ResponseEntity<List<String>> listTags() {
        return ResponseEntity.ok(examService.listAllTags());
    }
}

