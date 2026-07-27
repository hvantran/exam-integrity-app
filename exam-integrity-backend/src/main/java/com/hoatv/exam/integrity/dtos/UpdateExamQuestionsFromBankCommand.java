package com.hoatv.exam.integrity.dtos;

import java.util.List;

/**
 * Command to replace an existing exam's question set using explicit question bank IDs.
 */
public record UpdateExamQuestionsFromBankCommand(
    List<String> selectedQuestionIds
) {}
