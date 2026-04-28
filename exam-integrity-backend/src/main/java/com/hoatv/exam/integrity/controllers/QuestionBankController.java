package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.DraftQuestionDTO;
import com.hoatv.exam.integrity.services.QuestionBankService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@Tag(name = "Question Bank", description = "Reusable question repository")
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    public QuestionBankController(QuestionBankService questionBankService) {
        this.questionBankService = questionBankService;
    }

    @GetMapping
    public ResponseEntity<Page<DraftQuestionDTO>> searchQuestions(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "tags", required = false) List<String> tags,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(questionBankService.search(q, type, tags, page, size));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllQuestions() {
        questionBankService.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
