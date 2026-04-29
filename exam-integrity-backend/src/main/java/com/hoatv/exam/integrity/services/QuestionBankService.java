package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.domain.QuestionBankItem;
import com.hoatv.exam.integrity.dtos.DraftQuestionDTO;
import com.hoatv.exam.integrity.dtos.DraftQuestionEditCommand;
import com.hoatv.exam.integrity.dtos.RubricDTO;
import com.hoatv.exam.integrity.repositories.QuestionBankRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class QuestionBankService {

    private final QuestionBankRepository bankRepository;

    public QuestionBankService(QuestionBankRepository bankRepository) {
        this.bankRepository = bankRepository;
    }

    public Page<DraftQuestionDTO> search(String q, String type, List<String> tags, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Question.QuestionType qType = null;
        if (type != null && !type.isBlank()) {
            try { qType = Question.QuestionType.valueOf(type.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        boolean hasText = q != null && !q.isBlank();
        boolean hasTags = tags != null && !tags.isEmpty();

        Page<QuestionBankItem> results;
        if (hasText && qType != null && hasTags) {
            results = bankRepository.searchByTextTypeAndTags(q, qType, tags, pageable);
        } else if (hasText && qType != null) {
            results = bankRepository.searchByTextAndType(q, qType, pageable);
        } else if (hasText && hasTags) {
            results = bankRepository.searchByTextAndTags(q, tags, pageable);
        } else if (hasText) {
            results = bankRepository.searchByText(q, pageable);
        } else if (qType != null && hasTags) {
            results = bankRepository.findByTypeAndTagsIn(qType, tags, pageable);
        } else if (qType != null) {
            results = bankRepository.findByType(qType, pageable);
        } else if (hasTags) {
            results = bankRepository.findByTagsIn(tags, pageable);
        } else {
            results = bankRepository.findAll(pageable);
        }
        return results.map(this::toDTO);
    }

    public void deleteAll() {
        bankRepository.deleteAll();
    }

    public DraftQuestionDTO addQuestion(DraftQuestionEditCommand cmd) {
        if (cmd.content() == null || cmd.content().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question content is required");
        }
        String hash = sha256(cmd.content());
        bankRepository.findByContentHash(hash).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A question with identical content already exists in the bank");
        });
        QuestionBankItem item = new QuestionBankItem();
        item.setId(UUID.randomUUID().toString());
        item.setContentHash(hash);
        item.setContent(cmd.content());
        if (cmd.type() != null && !cmd.type().isBlank()) {
            try { item.setType(Question.QuestionType.valueOf(cmd.type().toUpperCase())); }
            catch (IllegalArgumentException ignored) { item.setType(Question.QuestionType.MCQ); }
        } else {
            item.setType(Question.QuestionType.MCQ);
        }
        item.setPoints(cmd.points() > 0 ? cmd.points() : 1.0);
        item.setOptions(cmd.options() != null ? cmd.options() : List.of());
        item.setCorrectAnswer(cmd.correctAnswer());
        if (cmd.rubric() != null) {
            com.hoatv.exam.integrity.domain.Rubric rubric = new com.hoatv.exam.integrity.domain.Rubric();
            rubric.setKeywords(cmd.rubric().keywords());
            rubric.setExpectedSteps(cmd.rubric().expectedSteps());
            rubric.setFinalAnswer(cmd.rubric().finalAnswer());
            rubric.setModelAnswer(cmd.rubric().modelAnswer());
            item.setRubric(rubric);
        }
        item.setTags(List.of());
        item.setAddedAt(Instant.now());
        return toDTO(bankRepository.save(item));
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    public DraftQuestionDTO update(String id, DraftQuestionEditCommand cmd) {
        QuestionBankItem item = bankRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found: " + id));
        if (cmd.content() != null) item.setContent(cmd.content());
        if (cmd.type() != null) {
            try { item.setType(Question.QuestionType.valueOf(cmd.type().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        if (cmd.points() > 0) item.setPoints(cmd.points());
        if (cmd.options() != null) item.setOptions(cmd.options());
        if (cmd.correctAnswer() != null) item.setCorrectAnswer(cmd.correctAnswer());
        return toDTO(bankRepository.save(item));
    }

    private DraftQuestionDTO toDTO(QuestionBankItem item) {
        RubricDTO rubric = item.getRubric() == null ? null : new RubricDTO(
            item.getRubric().getKeywords(), item.getRubric().getExpectedSteps(),
            item.getRubric().getFinalAnswer(), item.getRubric().getModelAnswer(),
            item.getRubric().getFormatChecks()
        );
        return new DraftQuestionDTO(
            item.getId(), 0, item.getContent(), null,
            item.getType() != null ? item.getType().name() : null,
            item.getPoints(), item.getOptions(), item.getCorrectAnswer(),
            rubric, false, null, 1.0, null, List.of(), "APPROVED"
        );
    }
}
