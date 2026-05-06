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
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class QuestionBankService {

    private final QuestionBankRepository bankRepository;

    public QuestionBankService(QuestionBankRepository bankRepository) {
        this.bankRepository = bankRepository;
    }

    public Page<DraftQuestionDTO> search(String q, String type, List<String> tags, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "type"));
        Question.QuestionType qType = null;
        if (type != null && !type.isBlank()) {
            try { qType = Question.QuestionType.valueOf(type.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        boolean hasText = q != null && !q.isBlank();
        boolean hasTags = tags != null && !tags.isEmpty();
        String escapedText = hasText ? Pattern.quote(q.trim()) : q;

        Page<QuestionBankItem> results;
        if (hasText && qType != null && hasTags) {
            results = bankRepository.searchByTextTypeAndTags(escapedText, qType, tags, pageable);
        } else if (hasText && qType != null) {
            results = bankRepository.searchByTextAndType(escapedText, qType, pageable);
        } else if (hasText && hasTags) {
            results = bankRepository.searchByTextAndTags(escapedText, tags, pageable);
        } else if (hasText) {
            results = bankRepository.searchByText(escapedText, pageable);
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

    public List<String> listTags() {
        return bankRepository.findAll().stream()
            .flatMap(item -> {
                List<String> merged = new ArrayList<>();
                if (item.getTags() != null) {
                    merged.addAll(item.getTags());
                }
                if (item.getRubric() != null && item.getRubric().getKeywords() != null) {
                    merged.addAll(item.getRubric().getKeywords());
                }
                return merged.stream();
            })
            .map(String::trim)
            .filter(tag -> !tag.isBlank())
            .distinct()
            .sorted(Comparator.naturalOrder())
            .toList();
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
        item.setTags(extractKeywords(cmd));
        item.setAddedAt(Instant.now());
        item.setImageData(cmd.imageData());
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
        if (cmd.imageData() != null) item.setImageData(cmd.imageData());
        if (cmd.rubric() != null) {
            com.hoatv.exam.integrity.domain.Rubric rubric = item.getRubric();
            if (rubric == null) {
                rubric = new com.hoatv.exam.integrity.domain.Rubric();
            }
            rubric.setKeywords(cmd.rubric().keywords());
            rubric.setExpectedSteps(cmd.rubric().expectedSteps());
            rubric.setFinalAnswer(cmd.rubric().finalAnswer());
            rubric.setModelAnswer(cmd.rubric().modelAnswer());
            rubric.setFormatChecks(cmd.rubric().formatChecks());
            item.setRubric(rubric);
            item.setTags(extractKeywords(cmd));
        }
        return toDTO(bankRepository.save(item));
    }

    private List<String> extractKeywords(DraftQuestionEditCommand cmd) {
        if (cmd.rubric() == null || cmd.rubric().keywords() == null) {
            return List.of();
        }
        return cmd.rubric().keywords().stream()
            .map(String::trim)
            .filter(keyword -> !keyword.isBlank())
            .distinct()
            .toList();
    }

    private DraftQuestionDTO toDTO(QuestionBankItem item) {
        QuestionStructureParser.ParsedQuestionContent parsed = QuestionStructureParser.parse(item.getContent());
        RubricDTO rubric = item.getRubric() == null ? null : new RubricDTO(
            item.getRubric().getKeywords(), item.getRubric().getExpectedSteps(),
            item.getRubric().getFinalAnswer(), item.getRubric().getModelAnswer(),
            item.getRubric().getFormatChecks()
        );
        return new DraftQuestionDTO(
            item.getId(),
            0,
            item.getContent(),
            null,
            parsed.stem(),
            item.getType() != null ? item.getType().name() : null,
            item.getPoints(),
            item.getOptions(),
            parsed.parts(),
            item.getCorrectAnswer(),
            rubric,
            false,
            item.getImageData(),
            null,
            1.0,
            null,
            List.of(),
            "APPROVED"
        );
    }
}
