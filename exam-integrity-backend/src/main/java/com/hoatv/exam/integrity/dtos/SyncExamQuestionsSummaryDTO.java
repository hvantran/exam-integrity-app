package com.hoatv.exam.integrity.dtos;

import java.util.List;

/**
 * Summary DTO returned when exam questions are synchronized with the question bank.
 */
public record SyncExamQuestionsSummaryDTO(
    String examId,
    int totalQuestions,
    int syncedCount,
    int unlinkedCount,
    List<String> missingBankItemIds,
    ExamDTO updatedExam
) {}

