package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.domain.QuestionBankItem;
import com.hoatv.exam.integrity.dtos.CreateExamFromBankCommand;
import com.hoatv.exam.integrity.dtos.ExamExportPayload;
import com.hoatv.exam.integrity.dtos.ExamImportPayload;
import com.hoatv.exam.integrity.dtos.ExamDTO;
import com.hoatv.exam.integrity.dtos.QuestionSummaryDTO;
import com.hoatv.exam.integrity.dtos.UpdateExamQuestionsFromBankCommand;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.QuestionBankRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
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
        return exams.stream()
            .sorted(Comparator
                .comparing((Exam exam) -> exam.getTitle() == null ? "" : exam.getTitle().toLowerCase(Locale.ROOT))
                .thenComparing(Exam::getId, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<ExamDTO> listAllExams() {
        return examRepository.findAll().stream()
            .sorted(Comparator.comparing(Exam::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public Optional<ExamDTO> getFullExam(String examId) {
        return examRepository.findById(examId).map(exam -> {
            final boolean[] hasBackfilledBankLinks = {false};
            List<QuestionSummaryDTO> questions = exam.getQuestions().stream()
                .map(q -> {
                    String bankItemId = q.getBankItemId();
                    if (bankItemId == null || bankItemId.isBlank()) {
                        String content = q.getContent();
                        if (content != null && !content.isBlank()) {
                            String hash = sha256(content);
                            bankItemId = questionBankRepository.findByContentHash(hash)
                                .map(QuestionBankItem::getId)
                                .orElse(null);
                            if (bankItemId != null) {
                                q.setBankItemId(bankItemId);
                                hasBackfilledBankLinks[0] = true;
                            }
                        }
                    }

                    QuestionStructureParser.ParsedQuestionContent parsedContent =
                        q.getType() == Question.QuestionType.MCQ
                            ? QuestionStructureParser.ParsedQuestionContent.empty()
                            : QuestionStructureParser.parse(q.getContent());

                    return new QuestionSummaryDTO(
                        q.getId(),
                        bankItemId,
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

            if (hasBackfilledBankLinks[0]) {
                examRepository.save(exam);
            }

            return new ExamDTO(exam.getId(), exam.getTitle(), exam.getDurationSeconds(),
                exam.getTotalPoints(), questions.size(), exam.getTags(), questions,
                exam.getStatus() != null ? exam.getStatus().name() : null);
        });
    }

    private ExamDTO toDTO(Exam exam) {
        return new ExamDTO(exam.getId(), exam.getTitle(), exam.getDurationSeconds(),
            exam.getTotalPoints(), exam.getQuestions().size(), exam.getTags(), null,
            exam.getStatus() != null ? exam.getStatus().name() : null);
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

        // Build blacklist: bank item IDs already used in any existing exam
        Set<String> usedBankItemIds = examRepository.findAll().stream()
            .flatMap(exam -> exam.getQuestions().stream())
            .map(Question::getBankItemId)
            .filter(id -> id != null && !id.isBlank())
            .collect(Collectors.toSet());
        logger.debug("Unique bank items already used across existing exams: {}", usedBankItemIds.size());

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

            List<String> alreadyUsed = selectedItems.stream()
                .filter(item -> usedBankItemIds.contains(item.getId()))
                .map(QuestionBankItem::getId)
                .toList();
            if (!alreadyUsed.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "The following question bank items are already used in other exams: " + alreadyUsed);
            }

            selectedItems.stream().map(this::bankItemToQuestion).forEach(selected::add);
        } else {
            if (mcqCount > 0) {
                List<QuestionBankItem> mcqPool = allBankItems.stream()
                    .filter(q -> q.getType() == Question.QuestionType.MCQ)
                    .filter(q -> matchesExamTags(q, examTags))
                    .filter(q -> !usedBankItemIds.contains(q.getId()))
                    .collect(Collectors.toList());
                Collections.shuffle(mcqPool);
                if (mcqPool.size() < mcqCount) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Not enough available MCQ questions (not already used in other exams) for selected tags: requested " + mcqCount + ", available " + mcqPool.size());
                }
                mcqPool.subList(0, mcqCount).stream()
                    .map(this::bankItemToQuestion)
                    .forEach(selected::add);
            }

            if (essayShortCount > 0) {
                List<QuestionBankItem> essayShortPool = allBankItems.stream()
                    .filter(q -> q.getType() == Question.QuestionType.ESSAY_SHORT)
                    .filter(q -> matchesExamTags(q, examTags))
                    .filter(q -> !usedBankItemIds.contains(q.getId()))
                    .collect(Collectors.toList());
                Collections.shuffle(essayShortPool);
                if (essayShortPool.size() < essayShortCount) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Not enough available essay short questions (not already used in other exams) for selected tags: requested " + essayShortCount + ", available " + essayShortPool.size());
                }
                essayShortPool.subList(0, essayShortCount).stream()
                    .map(this::bankItemToQuestion)
                    .forEach(selected::add);
            }

            if (essayLongCount > 0) {
                List<QuestionBankItem> essayLongPool = allBankItems.stream()
                    .filter(q -> q.getType() == Question.QuestionType.ESSAY_LONG)
                    .filter(q -> matchesExamTags(q, examTags))
                    .filter(q -> !usedBankItemIds.contains(q.getId()))
                    .collect(Collectors.toList());
                Collections.shuffle(essayLongPool);
                if (essayLongPool.size() < essayLongCount) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Not enough available essay long questions (not already used in other exams) for selected tags: requested " + essayLongCount + ", available " + essayLongPool.size());
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

    public ExamDTO updateQuestionsFromBank(String examId, UpdateExamQuestionsFromBankCommand cmd) {
        if (cmd == null || cmd.selectedQuestionIds() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "selectedQuestionIds is required");
        }

        List<String> selectedQuestionIds = cmd.selectedQuestionIds().stream()
            .filter(id -> id != null && !id.isBlank())
            .distinct()
            .toList();

        if (selectedQuestionIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one question must be selected");
        }

        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found: " + examId));

        List<QuestionBankItem> allBankItems = questionBankRepository.findAll();
        List<QuestionBankItem> selectedItems = selectedQuestionIds.stream()
            .map(id -> allBankItems.stream().filter(item -> id.equals(item.getId())).findFirst().orElse(null))
            .toList();

        boolean hasMissing = selectedItems.stream().anyMatch(item -> item == null);
        if (hasMissing) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "One or more selected question IDs do not exist in the question bank");
        }

        List<String> examTags = exam.getTags() != null ? exam.getTags() : List.of();
        boolean hasTagMismatch = selectedItems.stream().anyMatch(item -> !matchesExamTags(item, examTags));
        if (hasTagMismatch) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Selected question tags do not match exam tags");
        }

        Set<String> usedByOtherExams = examRepository.findAll().stream()
            .filter(existing -> !examId.equals(existing.getId()))
            .flatMap(existing -> existing.getQuestions().stream())
            .map(Question::getBankItemId)
            .filter(id -> id != null && !id.isBlank())
            .collect(Collectors.toSet());

        List<String> alreadyUsed = selectedItems.stream()
            .map(QuestionBankItem::getId)
            .filter(usedByOtherExams::contains)
            .toList();
        if (!alreadyUsed.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "The following question bank items are already used in other exams: " + alreadyUsed);
        }

        List<Question> questions = selectedItems.stream()
            .map(this::bankItemToQuestion)
            .toList();

        for (int i = 0; i < questions.size(); i++) {
            questions.get(i).setQuestionNumber(i + 1);
        }

        exam.setQuestions(questions);
        exam.setTotalPoints(questions.stream().mapToDouble(Question::getPoints).sum());

        examRepository.save(exam);
        logger.info("Updated exam {} with {} selected bank question(s)", examId, questions.size());
        return toDTO(exam);
    }

    private Question bankItemToQuestion(QuestionBankItem item) {
        Question q = new Question();
        q.setId(UUID.randomUUID().toString());
        q.setBankItemId(item.getId());
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

    public ExamDTO importFromJson(ExamImportPayload payload) {
        if (payload == null || payload.questions() == null || payload.questions().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Import JSON must include at least one question");
        }

        List<Question> questions = new ArrayList<>();
        for (int i = 0; i < payload.questions().size(); i++) {
            ExamImportPayload.ImportedQuestion imported = payload.questions().get(i);
            String content = imported.content() != null ? imported.content().trim() : "";
            if (content.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Question content is required at index " + i);
            }

            Question.QuestionType questionType = parseQuestionType(imported.type());
            double points = imported.points() != null && imported.points() > 0
                ? imported.points()
                : defaultPoints(questionType);

            Question question = new Question();
            question.setId(UUID.randomUUID().toString());
            question.setQuestionNumber(i + 1);
            question.setContent(content);
            question.setType(questionType);
            question.setPoints(points);
            question.setOptions(questionType == Question.QuestionType.MCQ
                ? normalizeOptions(imported.options())
                : List.of());
            question.setCorrectAnswer(imported.correctAnswer() != null ? imported.correctAnswer().trim() : null);
            question.setImageData(imported.imageData());
            questions.add(question);
        }

        String title = payload.title() != null && !payload.title().trim().isBlank()
            ? payload.title().trim()
            : "Imported Exam";

        int durationSeconds = payload.durationSeconds() != null && payload.durationSeconds() > 0
            ? payload.durationSeconds()
            : 3600;

        List<String> tags = payload.tags() != null
            ? payload.tags().stream()
                .filter(tag -> tag != null && !tag.isBlank())
                .map(String::trim)
                .distinct()
                .toList()
            : List.of();

        Exam exam = new Exam();
        exam.setId(UUID.randomUUID().toString());
        exam.setTitle(title);
        exam.setDurationSeconds(durationSeconds);
        exam.setTags(tags);
        exam.setStatus(Exam.ExamStatus.ACTIVE);
        exam.setCreatedAt(Instant.now());
        exam.setQuestions(questions);
        exam.setTotalPoints(questions.stream().mapToDouble(Question::getPoints).sum());

        linkQuestionsToBank(questions, exam.getId(), tags);

        examRepository.save(exam);
        logger.info("Imported exam {} from JSON payload with {} question(s)", exam.getId(), questions.size());
        return toDTO(exam);
    }

    public ExamExportPayload exportToJson(String examId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found: " + examId));

        List<ExamExportPayload.ExportedQuestion> questions = exam.getQuestions().stream()
            .map(question -> new ExamExportPayload.ExportedQuestion(
                question.getQuestionNumber(),
                question.getContent(),
                question.getType() != null ? question.getType().name() : Question.QuestionType.MCQ.name(),
                question.getPoints(),
                question.getOptions() != null ? question.getOptions() : List.of(),
                question.getCorrectAnswer(),
                question.getImageData()
            ))
            .toList();

        return new ExamExportPayload(
            exam.getTitle(),
            exam.getDurationSeconds(),
            exam.getTags() != null ? exam.getTags() : List.of(),
            questions
        );
    }

    private Question.QuestionType parseQuestionType(String rawType) {
        if (rawType == null || rawType.isBlank()) {
            return Question.QuestionType.MCQ;
        }
        try {
            return Question.QuestionType.valueOf(rawType.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Unsupported question type: " + rawType);
        }
    }

    private List<String> normalizeOptions(List<String> options) {
        if (options == null) {
            return List.of();
        }
        return options.stream()
            .filter(opt -> opt != null && !opt.isBlank())
            .map(String::trim)
            .toList();
    }

    private void linkQuestionsToBank(List<Question> questions, String examId, List<String> tags) {
        for (Question q : questions) {
            String hash = sha256(q.getContent());
            Optional<QuestionBankItem> existing = questionBankRepository.findByContentHash(hash);
            if (existing.isPresent()) {
                q.setBankItemId(existing.get().getId());
            } else {
                QuestionBankItem item = new QuestionBankItem();
                item.setId(UUID.randomUUID().toString());
                item.setContentHash(hash);
                item.setContent(q.getContent());
                item.setType(q.getType());
                item.setPoints(q.getPoints());
                item.setOptions(q.getOptions());
                item.setCorrectAnswer(q.getCorrectAnswer());
                item.setImageData(q.getImageData());
                item.setTags(tags != null ? tags : List.of());
                item.setSourceExamId(examId);
                item.setAddedAt(Instant.now());
                QuestionBankItem saved = questionBankRepository.save(item);
                q.setBankItemId(saved.getId());
            }
        }
    }

    private double defaultPoints(Question.QuestionType type) {
        return switch (type) {
            case MCQ -> 0.5;
            case ESSAY_SHORT -> 1.0;
            case ESSAY_LONG -> 2.0;
        };
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }
}
