package com.hoatv.exam.integrity.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * Embedded question inside an Exam document.
 * Not a top-level MongoDB collection — lives inside exams[].questions[].
 */
public class Question {

    /** UUID assigned by backend at ingestion time. Used as answer key. */
    private String id;

    /** 1-based display order within the exam. */
    private int questionNumber;

    /** Full question text (may include newlines for multi-part questions). */
    private String content;

    private QuestionType type;

    /** Points this question is worth (e.g. 0.5, 1.0, 2.5). */
    private double points;

    /**
     * MCQ answer options in display order.
     * Example: ["A. Ha Noi", "B. Ho Chi Minh", "C. Da Nang", "D. Hue"]
     * Empty for essay questions.
     */
    private List<String> options = new ArrayList<>();

    /**
     * Correct answer key for MCQ (e.g. "A. Ha Noi") or model essay answer.
     * Shown to student only in ReviewDashboard.
     */
    private String correctAnswer;

    /**
     * Scoring rubric for essay questions.
     * Defines keywords, expected steps, final answer, and format criteria.
     */
    private Rubric rubric;

    /** True when OCR/parser detected the question text was cut off by a page break. */
    private boolean truncated;

    /** Base64-encoded image data (Data URI) for question image, optional. */
    private String imageData;

    public enum QuestionType {
        /** Single-choice or multi-choice with fixed options. */
        MCQ,
        /** Short written answer (1-3 sentences). */
        ESSAY_SHORT,
        /** Long-form calculation or multi-step problem. */
        ESSAY_LONG
    }

    // ----- Getters & Setters -----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public QuestionType getType() { return type; }
    public void setType(QuestionType type) { this.type = type; }

    public double getPoints() { return points; }
    public void setPoints(double points) { this.points = points; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public Rubric getRubric() { return rubric; }
    public void setRubric(Rubric rubric) { this.rubric = rubric; }

    public boolean isTruncated() { return truncated; }
    public void setTruncated(boolean truncated) { this.truncated = truncated; }

    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }
}
