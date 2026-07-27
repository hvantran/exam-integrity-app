package com.hoatv.exam.integrity.dtos;

import java.util.List;

public record ExamImportPayload(
    String title,
    Integer durationSeconds,
    List<String> tags,
    List<ImportedQuestion> questions
) {
    public record ImportedQuestion(
        String content,
        String type,
        Double points,
        List<String> options,
        String correctAnswer,
        String imageData
    ) {}
}
