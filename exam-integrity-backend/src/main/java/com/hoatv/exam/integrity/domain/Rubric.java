package com.hoatv.exam.integrity.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * Essay scoring rubric embedded in a Question.
 * Used by the Python scoring-worker to evaluate student essay answers.
 */
public class Rubric {

    /**
     * Required keywords/phrases for the answer.
     * Each keyword matched counts toward the keyword score component.
     * Example: ["cong hoa xa hoi chu nghia", "doc lap", "tu do"]
     */
    private List<String> keywords = new ArrayList<>();

    /**
     * Expected solution steps (for math/multi-step problems).
     * Each step is a short description of what should appear.
     * Example: ["Dat tinh", "Thuc hien phep tinh", "Viet ket qua va don vi"]
     */
    private List<String> expectedSteps = new ArrayList<>();

    /**
     * The expected final answer string.
     * Example: "648" or "15 cm2"
     */
    private String finalAnswer;

    /**
     * Model answer text for semantic similarity comparison.
     * Compared against student answer using Vietnamese-SBERT.
     */
    private String modelAnswer;

    /**
     * Format requirements: proper unit, sentence structure, punctuation.
     * Each item is a short check description.
     * Example: ["Ket qua phai co don vi", "Viet cau hoan chinh"]
     */
    private List<String> formatChecks = new ArrayList<>();

    // ----- Getters & Setters -----

    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }

    public List<String> getExpectedSteps() { return expectedSteps; }
    public void setExpectedSteps(List<String> expectedSteps) { this.expectedSteps = expectedSteps; }

    public String getFinalAnswer() { return finalAnswer; }
    public void setFinalAnswer(String finalAnswer) { this.finalAnswer = finalAnswer; }

    public String getModelAnswer() { return modelAnswer; }
    public void setModelAnswer(String modelAnswer) { this.modelAnswer = modelAnswer; }

    public List<String> getFormatChecks() { return formatChecks; }
    public void setFormatChecks(List<String> formatChecks) { this.formatChecks = formatChecks; }
}
