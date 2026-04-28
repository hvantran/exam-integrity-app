package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.ExamDTO;
import com.hoatv.exam.integrity.services.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@Tag(name = "Exam Management", description = "Browse and retrieve published exams (ACTIVE status only)")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
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
}
