package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A reusable question stored in the question bank.
 * Populated from publishDraft (deduped by SHA-256 of content).
 *
 * Collection: question_bank
 */
@Document(collection = "question_bank")
public class QuestionBankItem {

    @Id
    private String id;

    @Indexed
    private String contentHash; // SHA-256 of normalised content for dedup

    private String content;

    @Indexed
    private Question.QuestionType type;

    private double points;

    private List<String> options = new ArrayList<>();

    private String correctAnswer;

    private Rubric rubric;

    @Indexed
    private List<String> tags = new ArrayList<>();

    private String sourceExamId;

    private Instant addedAt;

    // Base64-encoded image data (Data URI)
    private String imageData;

    // ----- Getters & Setters -----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContentHash() { return contentHash; }
    public void setContentHash(String contentHash) { this.contentHash = contentHash; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Question.QuestionType getType() { return type; }
    public void setType(Question.QuestionType type) { this.type = type; }

    public double getPoints() { return points; }
    public void setPoints(double points) { this.points = points; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public Rubric getRubric() { return rubric; }
    public void setRubric(Rubric rubric) { this.rubric = rubric; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getSourceExamId() { return sourceExamId; }
    public void setSourceExamId(String sourceExamId) { this.sourceExamId = sourceExamId; }

    public Instant getAddedAt() { return addedAt; }
    public void setAddedAt(Instant addedAt) { this.addedAt = addedAt; }

    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }
}
