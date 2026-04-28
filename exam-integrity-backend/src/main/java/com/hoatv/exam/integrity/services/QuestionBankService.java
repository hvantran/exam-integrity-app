package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.domain.QuestionBankItem;
import com.hoatv.exam.integrity.dtos.DraftQuestionDTO;
import com.hoatv.exam.integrity.dtos.RubricDTO;
import com.hoatv.exam.integrity.repositories.QuestionBankRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

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
