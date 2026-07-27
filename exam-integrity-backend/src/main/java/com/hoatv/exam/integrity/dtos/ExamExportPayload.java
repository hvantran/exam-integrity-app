package com.hoatv.exam.integrity.dtos;

import java.util.List;

public record ExamExportPayload(
    String title,
    int durationSeconds,
    List<String> tags,
    List<ExportedQuestion> questions
) {
    public record ExportedQuestion(
        int questionNumber,
        String content,
        String type,
        double points,
        List<String> options,
        String correctAnswer,
        String imageData
    ) {}
}
