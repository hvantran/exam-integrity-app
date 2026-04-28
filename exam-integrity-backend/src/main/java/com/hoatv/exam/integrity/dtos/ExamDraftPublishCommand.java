package com.hoatv.exam.integrity.dtos;

import java.util.List;

/**
 * Command sent when the teacher clicks "Publish Exam".
 * Backend converts the ExamDraft to an Exam document.
 * Tags entered here are stored on both ExamDraft and the final Exam.
 */
public record ExamDraftPublishCommand(
    String title,
    int durationSeconds,
    /** Free-form tags for filtering (e.g. ["toan", "lop4", "tuan12"]). */
    List<String> tags,
    String reviewNotes
) {}
