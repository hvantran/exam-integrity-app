package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.dtos.ExamDTO;
import com.hoatv.exam.integrity.dtos.QuestionSummaryDTO;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Manages exam lifecycle: creation from ingestion payload, activation, archiving.
 * Does NOT perform scoring or session management (separate concerns).
 */
@Service
public class ExamService {

    private static final Logger logger = LoggerFactory.getLogger(ExamService.class);

    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public Optional<Exam> findById(String examId) {
        return examRepository.findById(examId);
    }

    public List<ExamDTO> listActive(List<String> tags) {
        List<Exam> exams = (tags == null || tags.isEmpty())
            ? examRepository.findByStatus(Exam.ExamStatus.ACTIVE)
            : examRepository.findByStatusAndTagsIn(Exam.ExamStatus.ACTIVE, tags);
        return exams.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<ExamDTO> getFullExam(String examId) {
        return examRepository.findById(examId).map(exam -> {
            List<QuestionSummaryDTO> questions = exam.getQuestions().stream()
                .map(q -> new QuestionSummaryDTO(
                    q.getId(), q.getQuestionNumber(), q.getContent(),
                    q.getType() != null ? q.getType().name() : "MCQ",
                    q.getPoints(), q.getOptions(), q.isTruncated()))
                .collect(Collectors.toList());
            return new ExamDTO(exam.getId(), exam.getTitle(), exam.getDurationSeconds(),
                exam.getTotalPoints(), questions.size(), exam.getTags(), questions);
        });
    }

    private ExamDTO toDTO(Exam exam) {
        return new ExamDTO(exam.getId(), exam.getTitle(), exam.getDurationSeconds(),
            exam.getTotalPoints(), exam.getQuestions().size(), exam.getTags(), null);
    }
}
