package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

/**
 * MongoDB document for a scored question within a session.
 * Written by ScoringOrchestratorService once the Kafka scoring pipeline completes.
 *
 * Collection: scores
 */
@Document(collection = "scores")
public class Score {

    @Id
    private String id;

    @Indexed
    private String sessionId;

    /** References Exam.questions[n].id */
    @Indexed
    private String questionId;

    /** Points awarded. 0 if wrong; partial for essays. */
    private double earnedPoints;

    private double maxPoints;

    /** Student's submitted answer text (verbatim). */
    private String studentAnswer;

    /**
     * Essay scoring breakdown.
     * null for MCQ questions.
     */
    private ScoreBreakdown scoreBreakdown;

    /** JSON string of the full breakdown (from Python worker). Used for UI display. */
    private String scoreBreakdownJson;

    private ScoreStatus status;

    /**
     * Teacher-facing explanation of the correct answer.
     * Populated from the Question rubric model answer.
     */
    private String explanation;

    public enum ScoreStatus {
        /** MCQ correct / essay above threshold. */
        CORRECT,
        /** MCQ wrong / essay below threshold. */
        INCORRECT,
        /** Essay with partial keyword/step matches (0 < earned < max). */
        PARTIAL,
        /** Teacher manually reviewed and overrode automatic score. */
        SELF_GRADE_REQUIRED,
        /** Kafka consumer has not yet processed this question. */
        PENDING_ESSAY,
        /** Question text was truncated; auto-score unreliable. */
        INCOMPLETE_QUESTION,
        /** MCQ answer had commas (e.g. "A,B") — multiple answers detected. */
        MULTIPLE_ANSWERS_FLAG
    }

    /**
     * Detailed breakdown of essay scoring components.
     * Weights: keyword=0.35, steps=0.25, finalAnswer=0.20, semantic=0.15, format=0.05
     */
    public static class ScoreBreakdown {
        private double keywordScore;
        private double stepsScore;
        private double finalAnswerScore;
        private double semanticScore;
        private double formatScore;
        private double weightedTotal;

        public double getKeywordScore() { return keywordScore; }
        public void setKeywordScore(double keywordScore) { this.keywordScore = keywordScore; }

        public double getStepsScore() { return stepsScore; }
        public void setStepsScore(double stepsScore) { this.stepsScore = stepsScore; }

        public double getFinalAnswerScore() { return finalAnswerScore; }
        public void setFinalAnswerScore(double finalAnswerScore) { this.finalAnswerScore = finalAnswerScore; }

        public double getSemanticScore() { return semanticScore; }
        public void setSemanticScore(double semanticScore) { this.semanticScore = semanticScore; }

        public double getFormatScore() { return formatScore; }
        public void setFormatScore(double formatScore) { this.formatScore = formatScore; }

        public double getWeightedTotal() { return weightedTotal; }
        public void setWeightedTotal(double weightedTotal) { this.weightedTotal = weightedTotal; }
    }

    // ----- Getters & Setters -----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public double getEarnedPoints() { return earnedPoints; }
    public void setEarnedPoints(double earnedPoints) { this.earnedPoints = earnedPoints; }

    public double getMaxPoints() { return maxPoints; }
    public void setMaxPoints(double maxPoints) { this.maxPoints = maxPoints; }

    public String getStudentAnswer() { return studentAnswer; }
    public void setStudentAnswer(String studentAnswer) { this.studentAnswer = studentAnswer; }

    public ScoreBreakdown getScoreBreakdown() { return scoreBreakdown; }
    public void setScoreBreakdown(ScoreBreakdown scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }

    public String getScoreBreakdownJson() { return scoreBreakdownJson; }
    public void setScoreBreakdownJson(String scoreBreakdownJson) { this.scoreBreakdownJson = scoreBreakdownJson; }
    public void setScoreBreakdownFromJson(String json) { this.scoreBreakdownJson = json; }

    public ScoreStatus getStatus() { return status; }
    public void setStatus(ScoreStatus status) { this.status = status; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
