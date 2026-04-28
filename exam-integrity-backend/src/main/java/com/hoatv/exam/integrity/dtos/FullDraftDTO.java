package com.hoatv.exam.integrity.dtos;

import java.util.List;

/**
 * Full draft response used on the question-review page.
 * Combines the summary card with the complete list of parsed questions.
 */
public record FullDraftDTO(
    ExamDraftSummaryDTO summary,
    List<DraftQuestionDTO> questions
) {}
