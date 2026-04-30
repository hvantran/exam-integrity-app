package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.domain.QuestionBankItem;
import com.hoatv.exam.integrity.dtos.CreateExamFromBankCommand;
import com.hoatv.exam.integrity.dtos.ExamDTO;
import com.hoatv.exam.integrity.dtos.QuestionSummaryDTO;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.QuestionBankRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Manages exam lifecycle: creation from ingestion payload, activation, archiving.
 * Does NOT perform scoring or session management (separate concerns).
 */
@Service
public class ExamService {

    private static final Logger logger = LoggerFactory.getLogger(ExamService.class);

    private final ExamRepository examRepository;
    private final QuestionBankRepository questionBankRepository;

    public ExamService(ExamRepository examRepository, QuestionBankRepository questionBankRepository) {
        this.examRepository = examRepository;
        this.questionBankRepository = questionBankRepository;
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
                    q.getId(),
                    q.getQuestionNumber(),
                    q.getContent(),
                    q.getType() != null ? q.getType().name() : "MCQ",
                    q.getPoints(),
                    q.getOptions(),
                    q.isTruncated(),
                    q.getImageData()
                ))
                .collect(Collectors.toList());
            return new ExamDTO(exam.getId(), exam.getTitle(), exam.getDurationSeconds(),
                exam.getTotalPoints(), questions.size(), exam.getTags(), questions);
        });
    }

    private ExamDTO toDTO(Exam exam) {
        return new ExamDTO(exam.getId(), exam.getTitle(), exam.getDurationSeconds(),
            exam.getTotalPoints(), exam.getQuestions().size(), exam.getTags(), null);
    }

    // ── BE-new: Create exam from random question bank sample ─────────────────

    public void deleteExam(String examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found: " + examId);
        }
        examRepository.deleteById(examId);
        logger.info("Deleted exam {} (question bank untouched)", examId);
    }

    public ExamDTO createFromBank(CreateExamFromBankCommand cmd) {
        int mcqCount = Math.max(0, cmd.mcqCount());
        int essayShortCount = Math.max(0, cmd.essayShortCount());
        int essayLongCount = Math.max(0, cmd.essayLongCount());
        if (mcqCount + essayShortCount + essayLongCount == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one question must be requested");
        }

        List<Question> selected = new ArrayList<>();

        if (mcqCount > 0) {
            List<QuestionBankItem> mcqPool = questionBankRepository.findAll().stream()
                .filter(q -> q.getType() == Question.QuestionType.MCQ)
                .collect(Collectors.toList());
            Collections.shuffle(mcqPool);
            if (mcqPool.size() < mcqCount) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Not enough MCQ questions in bank: requested " + mcqCount + ", available " + mcqPool.size());
            }
            mcqPool.subList(0, mcqCount).stream()
                .map(this::bankItemToQuestion)
                .forEach(selected::add);
        }

        if (essayShortCount > 0) {
            List<QuestionBankItem> essayShortPool = questionBankRepository.findAll().stream()
                .filter(q -> q.getType() == Question.QuestionType.ESSAY_SHORT)
                .collect(Collectors.toList());
            Collections.shuffle(essayShortPool);
            if (essayShortPool.size() < essayShortCount) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Not enough essay short questions in bank: requested " + essayShortCount + ", available " + essayShortPool.size());
            }
            essayShortPool.subList(0, essayShortCount).stream()
                .map(this::bankItemToQuestion)
                .forEach(selected::add);
        }

        if (essayLongCount > 0) {
            List<QuestionBankItem> essayLongPool = questionBankRepository.findAll().stream()
                .filter(q -> q.getType() == Question.QuestionType.ESSAY_LONG)
                .collect(Collectors.toList());
            Collections.shuffle(essayLongPool);
            if (essayLongPool.size() < essayLongCount) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Not enough essay long questions in bank: requested " + essayLongCount + ", available " + essayLongPool.size());
            }
            essayLongPool.subList(0, essayLongCount).stream()
                .map(this::bankItemToQuestion)
                .forEach(selected::add);
        }

        // Renumber 1..N
        for (int i = 0; i < selected.size(); i++) {
            selected.get(i).setQuestionNumber(i + 1);
        }

        Exam exam = new Exam();
        exam.setId(UUID.randomUUID().toString());
        exam.setTitle(cmd.title());
        exam.setDurationSeconds(cmd.durationSeconds() > 0 ? cmd.durationSeconds() : 3600);
        exam.setTags(cmd.tags() != null ? cmd.tags() : List.of());
        exam.setStatus(Exam.ExamStatus.ACTIVE);
        exam.setCreatedAt(Instant.now());
        exam.setQuestions(selected);
        exam.setTotalPoints(selected.stream().mapToDouble(Question::getPoints).sum());

        examRepository.save(exam);
        logger.info("Created exam {} from question bank ({} MCQ, {} essay short, {} essay long)", exam.getId(), mcqCount, essayShortCount, essayLongCount);
        return toDTO(exam);
    }

    private Question bankItemToQuestion(QuestionBankItem item) {
        Question q = new Question();
        q.setId(UUID.randomUUID().toString());
        q.setContent(item.getContent());
        q.setType(item.getType());
        q.setPoints(item.getPoints() > 0 ? item.getPoints() : 1.0);
        q.setOptions(item.getOptions() != null ? item.getOptions() : List.of());
        q.setCorrectAnswer(item.getCorrectAnswer());
        q.setImageData(item.getImageData());
        return q;
    }
    
    public List<String> listAllTags() {
        return examRepository.findAll().stream()
            .flatMap(e -> e.getTags().stream())
            .distinct()
            .sorted()
            .toList();
    }
}
