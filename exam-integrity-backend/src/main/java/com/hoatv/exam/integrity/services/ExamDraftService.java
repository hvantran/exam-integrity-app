package com.hoatv.exam.integrity.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.exam.integrity.domain.*;
import com.hoatv.exam.integrity.dtos.*;
import com.hoatv.exam.integrity.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

/**
 * All exam-draft business logic.
 * Controllers are kept thin (≤ 20 LOC each) and delegate here.
 */
@Service
public class ExamDraftService {

    private static final Logger logger = LoggerFactory.getLogger(ExamDraftService.class);

    private final ExamDraftRepository draftRepository;
    private final ExamRepository examRepository;
    private final QuestionBankRepository bankRepository;
    private final RestClient ingestionRestClient;
    private final ObjectMapper objectMapper;
    private final String ingestionBaseUrl;

    public ExamDraftService(ExamDraftRepository draftRepository,
                            ExamRepository examRepository,
                            QuestionBankRepository bankRepository,
                            RestClient ingestionRestClient,
                            ObjectMapper objectMapper,
                            @Value("${ingestion.service.base-url:http://localhost:8091}") String ingestionBaseUrl) {
        this.draftRepository      = draftRepository;
        this.examRepository       = examRepository;
        this.bankRepository       = bankRepository;
        this.ingestionRestClient  = ingestionRestClient;
        this.objectMapper         = objectMapper;
        this.ingestionBaseUrl     = ingestionBaseUrl;
    }

    // ── BE-01: Upload PDF ────────────────────────────────────────────────────

    public ExamDraftSummaryDTO uploadPdf(MultipartFile file, Integer examSetIndex) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "File must not be empty");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new ResponseStatusException(BAD_REQUEST, "Only PDF files accepted");
        }

        // Build multipart body for ingestion service.
        // RestTemplate's FormHttpMessageConverter detects non-String values
        // and automatically sets Content-Type: multipart/form-data; boundary=...
        // which FastAPI's UploadFile parsing requires.
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        try {
            final byte[] bytes = file.getBytes();
            body.add("file", new ByteArrayResource(bytes) {
                @Override public String getFilename() { return filename; }
            });
        } catch (Exception e) {
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY, "Cannot read uploaded file");
        }

        String query = examSetIndex != null ? "?exam_set_index=" + examSetIndex : "";
        String url = ingestionBaseUrl + "/api/ingestion/upload" + query;
        Map<?, ?> response;
        try {
            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
            response = resp.getBody();
        } catch (Exception e) {
            logger.error("Ingestion service call failed", e);
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY, "PDF ingestion failed: " + e.getMessage());
        }

        if (response == null) {
            throw new ResponseStatusException(UNPROCESSABLE_ENTITY, "Empty response from ingestion service");
        }

        String status = (String) response.get("status");
        if ("MULTI_SET_DETECTED".equals(status)) {
            // Return a summary that signals multi-set to controller
            ExamDraft placeholder = new ExamDraft();
            placeholder.setStatus(ExamDraft.DraftStatus.PENDING_REVIEW);
            placeholder.setOriginalFilename(filename);
            // We return a DTO with status=MULTI_SET_DETECTED — controller maps to 202
            return toSummaryDTO(placeholder, "MULTI_SET_DETECTED");
        }

        Map<?, ?> parsedExam = (Map<?, ?>) response.get("parsed_exam");
        String jobId = (String) response.get("job_id");

        ExamDraft draft = buildDraftFromParsedExam(parsedExam, filename, jobId, examSetIndex);
        ExamDraft saved = draftRepository.save(draft);
        logger.info("Draft {} created from PDF {}", saved.getId(), filename);
        return toSummaryDTO(saved, null);
    }

    // ── BE-02: List drafts ────────────────────────────────────────────────────

    public List<ExamDraftSummaryDTO> listDrafts(String status) {
        List<ExamDraft> drafts = (status != null)
            ? draftRepository.findByStatus(ExamDraft.DraftStatus.valueOf(status))
            : draftRepository.findAll();
        return drafts.stream().map(d -> toSummaryDTO(d, null)).collect(Collectors.toList());
    }

    // ── BE-03: Get full draft (transitions PENDING→UNDER_REVIEW) ─────────────

    public FullDraftDTO getDraftFull(String draftId) {
        ExamDraft draft = findDraftOrThrow(draftId);
        if (draft.getStatus() == ExamDraft.DraftStatus.PENDING_REVIEW) {
            draft.setStatus(ExamDraft.DraftStatus.UNDER_REVIEW);
            draftRepository.save(draft);
        }
        ExamDraftSummaryDTO summary = toSummaryDTO(draft, null);
        List<DraftQuestionDTO> questions = draft.getQuestions().stream()
            .map(this::toDraftQuestionDTO)
            .collect(Collectors.toList());
        return new FullDraftDTO(summary, questions);
    }

    // ── BE-04: Edit question ──────────────────────────────────────────────────

    public void editQuestion(String draftId, String questionId, DraftQuestionEditCommand cmd) {
        ExamDraft draft = findDraftOrThrow(draftId);
        requireEditable(draft);

        DraftQuestion q = findQuestionOrThrow(draft, questionId);
        if (cmd.content()       != null) q.setContent(cmd.content());
        if (cmd.type()          != null) q.setType(Question.QuestionType.valueOf(cmd.type()));
        if (cmd.points()        > 0)     q.setPoints(cmd.points());
        if (cmd.options()       != null) q.setOptions(cmd.options());
        if (cmd.correctAnswer() != null) q.setCorrectAnswer(cmd.correctAnswer());
        if (cmd.rubric()        != null) q.setRubric(toRubricDomain(cmd.rubric()));
        if (cmd.reviewStatus()  != null) q.setReviewStatus(DraftQuestion.ReviewStatus.valueOf(cmd.reviewStatus()));
        draftRepository.save(draft);
    }

    // ── BE-05: Remove question ────────────────────────────────────────────────

    public void removeQuestion(String draftId, String questionId) {
        ExamDraft draft = findDraftOrThrow(draftId);
        requireEditable(draft);

        boolean removed = draft.getQuestions().removeIf(q -> questionId.equals(q.getId()));
        if (!removed) throw new ResponseStatusException(NOT_FOUND, "Question not found");
        resequence(draft.getQuestions());
        draftRepository.save(draft);
    }

    // ── BE-06: Add question ───────────────────────────────────────────────────

    public DraftQuestionDTO addQuestion(String draftId, DraftQuestionEditCommand cmd, Integer position) {
        ExamDraft draft = findDraftOrThrow(draftId);
        requireEditable(draft);

        DraftQuestion q = new DraftQuestion();
        q.setId(UUID.randomUUID().toString());
        q.setContent(cmd.content() != null ? cmd.content() : "");
        if (cmd.type() != null)           q.setType(Question.QuestionType.valueOf(cmd.type()));
        if (cmd.points() > 0)             q.setPoints(cmd.points());
        if (cmd.options() != null)        q.setOptions(cmd.options());
        if (cmd.correctAnswer() != null)  q.setCorrectAnswer(cmd.correctAnswer());
        if (cmd.rubric() != null)         q.setRubric(toRubricDomain(cmd.rubric()));
        q.setReviewStatus(DraftQuestion.ReviewStatus.APPROVED);
        q.setParserConfidence(1.0);

        List<DraftQuestion> questions = draft.getQuestions();
        int insertAt = (position != null && position > 0 && position <= questions.size())
            ? position - 1 : questions.size();
        questions.add(insertAt, q);
        resequence(questions);
        draftRepository.save(draft);
        return toDraftQuestionDTO(q);
    }

    // ── BE-07: Publish draft ──────────────────────────────────────────────────

    public ExamDTO publishDraft(String draftId, ExamDraftPublishCommand cmd) {
        ExamDraft draft = findDraftOrThrow(draftId);
        if (draft.getStatus() == ExamDraft.DraftStatus.APPROVED) {
            throw new ResponseStatusException(CONFLICT, "Draft already published");
        }
        requireEditable(draft);

        // Validation
        List<DraftQuestion> approved = draft.getQuestions().stream()
            .filter(q -> q.getReviewStatus() != DraftQuestion.ReviewStatus.EXCLUDED)
            .filter(q -> {
                // Auto-exclude essay questions that have no rubric — don't block publish
                boolean essayWithoutRubric = (q.getType() == Question.QuestionType.ESSAY_SHORT
                        || q.getType() == Question.QuestionType.ESSAY_LONG)
                        && q.getRubric() == null;
                if (essayWithoutRubric) {
                    q.setReviewStatus(DraftQuestion.ReviewStatus.EXCLUDED);
                    logger.warn("Auto-excluding essay question {} (no rubric) during publish", q.getId());
                }
                return !essayWithoutRubric;
            })
            .collect(Collectors.toList());
        if (approved.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "No questions to publish");
        }

        // Build Exam
        Exam exam = new Exam();
        exam.setId(UUID.randomUUID().toString());
        exam.setTitle(cmd.title() != null ? cmd.title() : draft.getTitle());
        exam.setDurationSeconds(cmd.durationSeconds() > 0 ? cmd.durationSeconds() : draft.getDurationSeconds());
        exam.setTags(cmd.tags() != null ? cmd.tags() : draft.getTags());
        exam.setStatus(Exam.ExamStatus.ACTIVE);
        exam.setUploadedBy(draft.getUploadedBy());
        exam.setCreatedAt(Instant.now());

        List<Question> questions = approved.stream()
            .map(this::toQuestion)
            .collect(Collectors.toList());
        // Renumber sequentially 1..N so student navigation by position always works,
        // regardless of which questions were excluded during review.
        for (int i = 0; i < questions.size(); i++) {
            questions.get(i).setQuestionNumber(i + 1);
        }
        exam.setQuestions(questions);
        exam.setTotalPoints(questions.stream().mapToDouble(Question::getPoints).sum());

        examRepository.save(exam);

        // Copy questions to bank (dedup by SHA-256)
        copyToQuestionBank(questions, exam.getId(), exam.getTags());

        // Finalize draft
        draft.setStatus(ExamDraft.DraftStatus.APPROVED);
        draft.setTags(cmd.tags() != null ? cmd.tags() : draft.getTags());
        draft.setReviewNotes(cmd.reviewNotes());
        draft.setReviewedAt(Instant.now());
        draftRepository.save(draft);

        logger.info("Draft {} published as exam {}", draftId, exam.getId());
        return new ExamDTO(exam.getId(), exam.getTitle(), exam.getDurationSeconds(),
                exam.getTotalPoints(), questions.size(), exam.getTags(), null);
    }

    // ── BE-08: Reject draft ───────────────────────────────────────────────────

    public void rejectDraft(String draftId, String reason) {
        ExamDraft draft = findDraftOrThrow(draftId);
        if (draft.getStatus() == ExamDraft.DraftStatus.APPROVED) {
            throw new ResponseStatusException(CONFLICT, "Cannot reject an already approved draft");
        }
        draft.setStatus(ExamDraft.DraftStatus.REJECTED);
        draft.setReviewNotes(reason);
        draft.setReviewedAt(Instant.now());
        draftRepository.save(draft);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private ExamDraft findDraftOrThrow(String draftId) {
        return draftRepository.findById(draftId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Draft not found: " + draftId));
    }

    private DraftQuestion findQuestionOrThrow(ExamDraft draft, String questionId) {
        return draft.getQuestions().stream()
            .filter(q -> questionId.equals(q.getId()))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Question not found: " + questionId));
    }

    private void requireEditable(ExamDraft draft) {
        if (draft.getStatus() == ExamDraft.DraftStatus.APPROVED
         || draft.getStatus() == ExamDraft.DraftStatus.REJECTED) {
            throw new ResponseStatusException(CONFLICT, "Draft is " + draft.getStatus() + ", cannot edit");
        }
    }

    private void resequence(List<DraftQuestion> questions) {
        for (int i = 0; i < questions.size(); i++) {
            questions.get(i).setQuestionNumber(i + 1);
        }
    }

    private void copyToQuestionBank(List<Question> questions, String examId, List<String> tags) {
        for (Question q : questions) {
            String hash = sha256(q.getContent());
            if (bankRepository.findByContentHash(hash).isEmpty()) {
                QuestionBankItem item = new QuestionBankItem();
                item.setId(UUID.randomUUID().toString());
                item.setContentHash(hash);
                item.setContent(q.getContent());
                item.setType(q.getType());
                item.setPoints(q.getPoints());
                item.setOptions(q.getOptions());
                item.setCorrectAnswer(q.getCorrectAnswer());
                item.setRubric(q.getRubric());
                item.setTags(tags != null ? tags : List.of());
                item.setSourceExamId(examId);
                item.setAddedAt(Instant.now());
                bankRepository.save(item);
            }
        }
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString(); // fallback — should never fail
        }
    }

    @SuppressWarnings("unchecked")
    private ExamDraft buildDraftFromParsedExam(Map<?, ?> parsedExam, String filename,
                                               String jobId, Integer examSetIndex) {
        ExamDraft draft = new ExamDraft();
        draft.setOriginalFilename(filename);
        draft.setIngestionJobId(jobId);
        draft.setUploadedAt(Instant.now());
        draft.setStatus(ExamDraft.DraftStatus.PENDING_REVIEW);
        draft.setExamSetIndex(examSetIndex);

        if (parsedExam == null) return draft;

        draft.setTitle(parsedExam.containsKey("title") ? (String) parsedExam.get("title") : filename);
        draft.setPdfType(parsedExam.containsKey("pdf_type") ? (String) parsedExam.get("pdf_type") : "text");
        draft.setOcrUsed(Boolean.TRUE.equals(parsedExam.get("ocr_used")));
        Object docOcr = parsedExam.get("document_ocr_confidence");
        if (docOcr instanceof Number) draft.setDocumentOcrConfidence(((Number) docOcr).doubleValue());
        Object tp = parsedExam.get("total_points");
        if (tp instanceof Number) draft.setTotalPoints(((Number) tp).doubleValue());
        Object dp = parsedExam.get("detected_points_sum");
        if (dp instanceof Number) draft.setDetectedPointsSum(((Number) dp).doubleValue());
        Object dur = parsedExam.get("duration_seconds");
        if (dur instanceof Number) draft.setDurationSeconds(((Number) dur).intValue());
        Object mismatch = parsedExam.get("has_point_mismatch");
        draft.setHasPointMismatch(Boolean.TRUE.equals(mismatch));

        List<?> rawWarnings = (List<?>) parsedExam.get("data_warnings");
        if (rawWarnings != null) {
            draft.setParserWarnings(rawWarnings.stream().map(Object::toString).collect(Collectors.toList()));
        }

        List<?> rawQuestions = (List<?>) parsedExam.get("questions");
        if (rawQuestions != null) {
            List<DraftQuestion> dqs = new ArrayList<>();
            for (Object rq : rawQuestions) {
                if (rq instanceof Map) {
                    dqs.add(mapToDraftQuestion((Map<?, ?>) rq));
                }
            }
            draft.setQuestions(dqs);
        }
        return draft;
    }

    private DraftQuestion mapToDraftQuestion(Map<?, ?> map) {
        DraftQuestion q = new DraftQuestion();
        q.setId(UUID.randomUUID().toString());
        Object qn = map.get("question_number");
        if (qn instanceof Number) q.setQuestionNumber(((Number) qn).intValue());
        q.setContent(map.containsKey("content") ? (String) map.get("content") : "");
        q.setRawText((String) map.get("raw_text"));
        String typeStr = map.containsKey("question_type") ? (String) map.get("question_type") : "MCQ";
        try { q.setType(Question.QuestionType.valueOf(typeStr)); }
        catch (Exception e) { q.setType(Question.QuestionType.MCQ); }
        Object pts = map.get("points");
        if (pts instanceof Number) q.setPoints(((Number) pts).doubleValue());
        @SuppressWarnings("unchecked")
        List<String> opts = (List<String>) map.get("options");
        if (opts != null) q.setOptions(opts);
        q.setCorrectAnswer((String) map.get("correct_answer"));
        Object ocr = map.get("ocr_confidence");
        if (ocr instanceof Number) q.setOcrConfidence(((Number) ocr).doubleValue());
        Object pc = map.get("parser_confidence");
        if (pc instanceof Number) q.setParserConfidence(((Number) pc).doubleValue());
        Object pn = map.get("page_number");
        if (pn instanceof Number) q.setPageNumber(((Number) pn).intValue());
        q.setTruncated(Boolean.TRUE.equals(map.get("is_truncated")));
        q.setReviewStatus(DraftQuestion.ReviewStatus.PENDING);
        @SuppressWarnings("unchecked")
        List<String> warns = (List<String>) map.get("warnings");
        if (warns != null) q.setParserWarnings(warns);
        return q;
    }

    private Question toQuestion(DraftQuestion dq) {
        Question q = new Question();
        q.setId(dq.getId());
        q.setQuestionNumber(dq.getQuestionNumber());
        q.setContent(dq.getContent());
        q.setType(dq.getType());
        q.setPoints(dq.getPoints());
        q.setOptions(dq.getOptions() != null ? dq.getOptions() : List.of());
        q.setCorrectAnswer(dq.getCorrectAnswer());
        q.setRubric(dq.getRubric());
        q.setTruncated(dq.isTruncated());
        return q;
    }

    private ExamDraftSummaryDTO toSummaryDTO(ExamDraft d, String overrideStatus) {
        String statusStr = overrideStatus != null ? overrideStatus
            : (d.getStatus() != null ? d.getStatus().name() : "PENDING_REVIEW");
        int flagged = (int) d.getQuestions().stream()
            .filter(q -> q.getParserConfidence() < 0.8 || (q.getOcrConfidence() != null && q.getOcrConfidence() < 0.75))
            .count();
        return new ExamDraftSummaryDTO(
            d.getId(), d.getTitle(), d.getOriginalFilename(), d.getPdfType(),
            d.isOcrUsed(), d.getDocumentOcrConfidence(), d.getQuestions().size(),
            flagged, d.isHasPointMismatch(), d.getTotalPoints(), d.getDetectedPointsSum(),
            d.getTags(), statusStr, d.getUploadedAt(), d.getUploadedBy()
        );
    }

    private DraftQuestionDTO toDraftQuestionDTO(DraftQuestion q) {
        RubricDTO rubricDTO = q.getRubric() == null ? null : new RubricDTO(
            q.getRubric().getKeywords(), q.getRubric().getExpectedSteps(),
            q.getRubric().getFinalAnswer(), q.getRubric().getModelAnswer(),
            q.getRubric().getFormatChecks()
        );
        return new DraftQuestionDTO(
            q.getId(), q.getQuestionNumber(), q.getContent(), q.getRawText(),
            q.getType() != null ? q.getType().name() : null,
            q.getPoints(), q.getOptions(), q.getCorrectAnswer(), rubricDTO,
            q.isTruncated(), q.getOcrConfidence(), q.getParserConfidence(),
            q.getPageNumber(), q.getParserWarnings(),
            q.getReviewStatus() != null ? q.getReviewStatus().name() : "PENDING"
        );
    }

    private Rubric toRubricDomain(RubricDTO dto) {
        if (dto == null) return null;
        Rubric r = new Rubric();
        r.setKeywords(dto.keywords() != null ? dto.keywords() : List.of());
        r.setExpectedSteps(dto.expectedSteps() != null ? dto.expectedSteps() : List.of());
        r.setFinalAnswer(dto.finalAnswer());
        r.setModelAnswer(dto.modelAnswer());
        r.setFormatChecks(dto.formatChecks() != null ? dto.formatChecks() : List.of());
        return r;
    }
}
