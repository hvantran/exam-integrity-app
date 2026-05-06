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
import java.util.Set;
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
                .map(q -> {
                    QuestionStructureParser.ParsedQuestionContent parsedContent =
                        q.getType() == Question.QuestionType.MCQ
                            ? QuestionStructureParser.ParsedQuestionContent.empty()
                            : QuestionStructureParser.parse(q.getContent());

                    return new QuestionSummaryDTO(
                        q.getId(),
                        q.getQuestionNumber(),
                        q.getContent(),
                        parsedContent.stem(),
                        q.getType() != null ? q.getType().name() : "MCQ",
                        q.getPoints(),
                        q.getOptions(),
                        parsedContent.parts(),
                        q.isTruncated(),
                        q.getImageData()
                    );
                })
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
        List<String> examTags = cmd.tags() != null ? cmd.tags() : List.of();
        List<String> selectedQuestionIds = cmd.selectedQuestionIds() != null
            ? cmd.selectedQuestionIds().stream().filter(id -> id != null && !id.isBlank()).distinct().toList()
            : List.of();

        int mcqCount = Math.max(0, cmd.mcqCount());
        int essayShortCount = Math.max(0, cmd.essayShortCount());
        int essayLongCount = Math.max(0, cmd.essayLongCount());
        if (selectedQuestionIds.isEmpty() && mcqCount + essayShortCount + essayLongCount == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one question must be requested");
        }

        List<Question> selected = new ArrayList<>();

        List<QuestionBankItem> allBankItems = questionBankRepository.findAll();

        if (!selectedQuestionIds.isEmpty()) {
            List<QuestionBankItem> selectedItems = allBankItems.stream()
                .filter(item -> selectedQuestionIds.contains(item.getId()))
                .toList();

            if (selectedItems.size() != selectedQuestionIds.size()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "One or more selected question IDs do not exist in the question bank");
            }

            boolean hasTagMismatch = selectedItems.stream()
                .anyMatch(item -> !matchesExamTags(item, examTags));
            if (hasTagMismatch) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Selected question tags do not match exam tags");
            }

            selectedItems.stream().map(this::bankItemToQuestion).forEach(selected::add);
        } else {
            if (mcqCount > 0) {
                List<QuestionBankItem> mcqPool = allBankItems.stream()
                    .filter(q -> q.getType() == Question.QuestionType.MCQ)
                    .filter(q -> matchesExamTags(q, examTags))
                    .collect(Collectors.toList());
                Collections.shuffle(mcqPool);
                if (mcqPool.size() < mcqCount) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Not enough MCQ questions in bank for selected tags: requested " + mcqCount + ", available " + mcqPool.size());
                }
                mcqPool.subList(0, mcqCount).stream()
                    .map(this::bankItemToQuestion)
                    .forEach(selected::add);
            }

            if (essayShortCount > 0) {
                List<QuestionBankItem> essayShortPool = allBankItems.stream()
                    .filter(q -> q.getType() == Question.QuestionType.ESSAY_SHORT)
                    .filter(q -> matchesExamTags(q, examTags))
                    .collect(Collectors.toList());
                Collections.shuffle(essayShortPool);
                if (essayShortPool.size() < essayShortCount) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Not enough essay short questions in bank for selected tags: requested " + essayShortCount + ", available " + essayShortPool.size());
                }
                essayShortPool.subList(0, essayShortCount).stream()
                    .map(this::bankItemToQuestion)
                    .forEach(selected::add);
            }

            if (essayLongCount > 0) {
                List<QuestionBankItem> essayLongPool = allBankItems.stream()
                    .filter(q -> q.getType() == Question.QuestionType.ESSAY_LONG)
                    .filter(q -> matchesExamTags(q, examTags))
                    .collect(Collectors.toList());
                Collections.shuffle(essayLongPool);
                if (essayLongPool.size() < essayLongCount) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Not enough essay long questions in bank for selected tags: requested " + essayLongCount + ", available " + essayLongPool.size());
                }
                essayLongPool.subList(0, essayLongCount).stream()
                    .map(this::bankItemToQuestion)
                    .forEach(selected::add);
            }
        }

        // Renumber 1..N
        for (int i = 0; i < selected.size(); i++) {
            selected.get(i).setQuestionNumber(i + 1);
        }

        Exam exam = new Exam();
        exam.setId(UUID.randomUUID().toString());
        exam.setTitle(cmd.title());
        exam.setDurationSeconds(cmd.durationSeconds() > 0 ? cmd.durationSeconds() : 3600);
        exam.setTags(examTags);
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

    private boolean matchesExamTags(QuestionBankItem item, List<String> examTags) {
        if (examTags == null || examTags.isEmpty()) {
            return true;
        }
        if (item.getTags() == null || item.getTags().isEmpty()) {
            return false;
        }
        Set<String> normalizedExamTags = examTags.stream()
            .filter(tag -> tag != null && !tag.isBlank())
            .map(tag -> tag.trim().toLowerCase())
            .collect(Collectors.toSet());
        return item.getTags().stream()
            .filter(tag -> tag != null && !tag.isBlank())
            .map(tag -> tag.trim().toLowerCase())
            .anyMatch(normalizedExamTags::contains);
    }
    
    public List<String> listAllTags() {
        return examRepository.findAll().stream()
            .flatMap(e -> e.getTags().stream())
            .distinct()
            .sorted()
            .toList();
    }
}
