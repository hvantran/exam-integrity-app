package com.hoatv.exam.integrity.dtos;

import java.util.List;

/**
 * Command to create an exam by randomly sampling questions from the question bank.
 * The backend picks mcqCount MCQ questions, essayShortCount essay short questions, and essayLongCount essay long questions at random
 * (without duplicates) and assembles them into a new ACTIVE exam.
 */
public record CreateExamFromBankCommand(
    String title,
    int durationSeconds,
    List<String> tags,
    String reviewNotes,
    List<String> selectedQuestionIds,
    int mcqCount,
    int essayShortCount,
    int essayLongCount
) {}
