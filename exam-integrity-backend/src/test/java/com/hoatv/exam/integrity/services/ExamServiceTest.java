package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Exam;
import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.domain.QuestionBankItem;
import com.hoatv.exam.integrity.dtos.CreateExamFromBankCommand;
import com.hoatv.exam.integrity.dtos.ExamDTO;
import com.hoatv.exam.integrity.dtos.ExamImportPayload;
import com.hoatv.exam.integrity.dtos.UpdateExamQuestionsFromBankCommand;
import com.hoatv.exam.integrity.repositories.ExamRepository;
import com.hoatv.exam.integrity.repositories.QuestionBankRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private QuestionBankRepository questionBankRepository;

    @InjectMocks
    private ExamService examService;

    @Test
    void createFromBankSkipsQuestionsAlreadyUsedInOtherExams() {
        List<String> examTags = List.of("math");
        QuestionBankItem usedMcq = questionBankItem("bank-used-mcq", Question.QuestionType.MCQ);
        QuestionBankItem usedShort = questionBankItem("bank-used-short", Question.QuestionType.ESSAY_SHORT);
        QuestionBankItem usedLong = questionBankItem("bank-used-long", Question.QuestionType.ESSAY_LONG);
        QuestionBankItem availableMcq = questionBankItem("bank-available-mcq", Question.QuestionType.MCQ);
        QuestionBankItem availableShort = questionBankItem("bank-available-short", Question.QuestionType.ESSAY_SHORT);
        QuestionBankItem availableLong = questionBankItem("bank-available-long", Question.QuestionType.ESSAY_LONG);

        usedMcq.setTags(examTags);
        usedShort.setTags(examTags);
        usedLong.setTags(examTags);
        availableMcq.setTags(examTags);
        availableShort.setTags(examTags);
        availableLong.setTags(examTags);

        Exam existingExam = new Exam();
        existingExam.setId("exam-1");
        existingExam.setQuestions(List.of(
            questionFromBankItem("question-1", usedMcq.getId()),
            questionFromBankItem("question-2", usedShort.getId()),
            questionFromBankItem("question-3", usedLong.getId())
        ));

        when(examRepository.findAll()).thenReturn(List.of(existingExam));
        when(questionBankRepository.findAll()).thenReturn(List.of(
            usedMcq,
            usedShort,
            usedLong,
            availableMcq,
            availableShort,
            availableLong
        ));

        ExamDTO result = examService.createFromBank(new CreateExamFromBankCommand(
            "New exam",
            2700,
            examTags,
            null,
            null,
            1,
            1,
            1
        ));

        ArgumentCaptor<Exam> savedExamCaptor = ArgumentCaptor.forClass(Exam.class);
        verify(examRepository).save(savedExamCaptor.capture());

        Exam savedExam = savedExamCaptor.getValue();
        assertThat(savedExam.getQuestions()).hasSize(3);
        assertThat(savedExam.getQuestions())
            .extracting(Question::getBankItemId)
            .containsExactlyInAnyOrder(
                availableMcq.getId(),
                availableShort.getId(),
                availableLong.getId()
            );

        assertThat(result.questionCount()).isEqualTo(3);
        assertThat(result.title()).isEqualTo("New exam");
    }

    @Test
    void createFromBankRejectsExplicitSelectionWhenQuestionAlreadyUsed() {
        QuestionBankItem reusedItem = questionBankItem("bank-reused", Question.QuestionType.MCQ);
        reusedItem.setTags(List.of("math"));

        Exam existingExam = new Exam();
        existingExam.setId("exam-1");
        existingExam.setQuestions(List.of(questionFromBankItem("question-1", reusedItem.getId())));

        when(examRepository.findAll()).thenReturn(List.of(existingExam));
        when(questionBankRepository.findAll()).thenReturn(List.of(reusedItem));

        assertThatThrownBy(() -> examService.createFromBank(new CreateExamFromBankCommand(
            "New exam",
            2700,
            null,
            null,
            List.of(reusedItem.getId()),
            0,
            0,
            0
        )))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("already used in other exams");
    }

    @Test
    void createFromBankFailsWhenNoUnusedQuestionsRemainForRequestedType() {
        QuestionBankItem usedMcq = questionBankItem("bank-used-mcq", Question.QuestionType.MCQ);
        usedMcq.setTags(List.of("math"));

        Exam existingExam = new Exam();
        existingExam.setId("exam-1");
        existingExam.setQuestions(List.of(questionFromBankItem("question-1", usedMcq.getId())));

        when(examRepository.findAll()).thenReturn(List.of(existingExam));
        when(questionBankRepository.findAll()).thenReturn(List.of(usedMcq));

        assertThatThrownBy(() -> examService.createFromBank(new CreateExamFromBankCommand(
            "New exam",
            2700,
            null,
            null,
            null,
            1,
            0,
            0
        )))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Not enough available MCQ questions");
    }

    @Test
    void importFromJsonCreatesExamWithAllSupportedQuestionTypes() {
        when(questionBankRepository.findByContentHash(org.mockito.ArgumentMatchers.anyString()))
            .thenReturn(java.util.Optional.empty());
        when(questionBankRepository.save(org.mockito.ArgumentMatchers.any(QuestionBankItem.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        ExamImportPayload payload = new ExamImportPayload(
            "Imported Midterm",
            2700,
            List.of("math", "grade-5"),
            List.of(
                new ExamImportPayload.ImportedQuestion(
                    "2 + 2 = ?",
                    "MCQ",
                    null,
                    List.of("3", "4", "5", "6"),
                    "B",
                    null
                ),
                new ExamImportPayload.ImportedQuestion(
                    "Explain why 1/2 equals 2/4",
                    "ESSAY_SHORT",
                    null,
                    null,
                    null,
                    null
                ),
                new ExamImportPayload.ImportedQuestion(
                    "Solve the multi-step word problem",
                    "ESSAY_LONG",
                    null,
                    null,
                    null,
                    null
                )
            )
        );

        ExamDTO result = examService.importFromJson(payload);

        ArgumentCaptor<Exam> savedExamCaptor = ArgumentCaptor.forClass(Exam.class);
        verify(examRepository).save(savedExamCaptor.capture());

        Exam savedExam = savedExamCaptor.getValue();
        assertThat(savedExam.getTitle()).isEqualTo("Imported Midterm");
        assertThat(savedExam.getDurationSeconds()).isEqualTo(2700);
        assertThat(savedExam.getQuestions()).hasSize(3);
        assertThat(savedExam.getQuestions())
            .extracting(Question::getType)
            .containsExactly(
                Question.QuestionType.MCQ,
                Question.QuestionType.ESSAY_SHORT,
                Question.QuestionType.ESSAY_LONG
            );
        assertThat(savedExam.getQuestions())
            .extracting(Question::getPoints)
            .containsExactly(0.5, 1.0, 2.0);

        assertThat(result.title()).isEqualTo("Imported Midterm");
        assertThat(result.questionCount()).isEqualTo(3);
        assertThat(result.totalPoints()).isEqualTo(3.5);
    }

    @Test
    void importFromJsonLinksQuestionsToQuestionBank() {
        String content = "2 + 2 = ?";
        String hash = sha256(content);

        when(questionBankRepository.findByContentHash(hash)).thenReturn(java.util.Optional.empty());
        when(questionBankRepository.save(org.mockito.ArgumentMatchers.any(QuestionBankItem.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        ExamImportPayload payload = new ExamImportPayload(
            "Bank Link Test",
            1800,
            List.of("math"),
            List.of(new ExamImportPayload.ImportedQuestion(content, "MCQ", null, List.of("A", "B"), "A", null))
        );

        examService.importFromJson(payload);

        ArgumentCaptor<QuestionBankItem> bankCaptor = ArgumentCaptor.forClass(QuestionBankItem.class);
        verify(questionBankRepository).save(bankCaptor.capture());
        QuestionBankItem saved = bankCaptor.getValue();
        assertThat(saved.getContent()).isEqualTo(content);
        assertThat(saved.getContentHash()).isEqualTo(hash);
        assertThat(saved.getTags()).containsExactly("math");

        ArgumentCaptor<Exam> examCaptor = ArgumentCaptor.forClass(Exam.class);
        verify(examRepository).save(examCaptor.capture());
        assertThat(examCaptor.getValue().getQuestions().get(0).getBankItemId()).isNotNull();
    }

    @Test
    void importFromJsonReusesExistingBankItemWhenContentMatches() {
        String content = "Solve the equation";
        String hash = sha256(content);
        QuestionBankItem existing = questionBankItem("existing-bank-id", Question.QuestionType.ESSAY_SHORT);
        existing.setContentHash(hash);

        when(questionBankRepository.findByContentHash(hash)).thenReturn(java.util.Optional.of(existing));

        ExamImportPayload payload = new ExamImportPayload(
            "Dedup Test",
            1800,
            List.of("algebra"),
            List.of(new ExamImportPayload.ImportedQuestion(content, "ESSAY_SHORT", null, null, null, null))
        );

        examService.importFromJson(payload);

        verify(questionBankRepository, org.mockito.Mockito.never())
            .save(org.mockito.ArgumentMatchers.any(QuestionBankItem.class));

        ArgumentCaptor<Exam> examCaptor = ArgumentCaptor.forClass(Exam.class);
        verify(examRepository).save(examCaptor.capture());
        assertThat(examCaptor.getValue().getQuestions().get(0).getBankItemId()).isEqualTo("existing-bank-id");
    }

    @Test
    void updateQuestionsFromBankReplacesExamQuestionSet() {
        QuestionBankItem bank1 = questionBankItem("bank-1", Question.QuestionType.MCQ);
        QuestionBankItem bank2 = questionBankItem("bank-2", Question.QuestionType.ESSAY_SHORT);
        bank1.setTags(List.of("math"));
        bank2.setTags(List.of("math"));

        Exam exam = new Exam();
        exam.setId("exam-1");
        exam.setTags(List.of("math"));
        exam.setQuestions(List.of(questionFromBankItem("old-question", "bank-old")));

        when(examRepository.findById("exam-1")).thenReturn(java.util.Optional.of(exam));
        when(examRepository.findAll()).thenReturn(List.of(exam));
        when(questionBankRepository.findAll()).thenReturn(List.of(bank1, bank2));

        ExamDTO result = examService.updateQuestionsFromBank(
            "exam-1",
            new UpdateExamQuestionsFromBankCommand(List.of("bank-1", "bank-2"))
        );

        ArgumentCaptor<Exam> savedExamCaptor = ArgumentCaptor.forClass(Exam.class);
        verify(examRepository).save(savedExamCaptor.capture());

        Exam saved = savedExamCaptor.getValue();
        assertThat(saved.getQuestions()).hasSize(2);
        assertThat(saved.getQuestions())
            .extracting(Question::getBankItemId)
            .containsExactly("bank-1", "bank-2");
        assertThat(saved.getQuestions())
            .extracting(Question::getQuestionNumber)
            .containsExactly(1, 2);

        assertThat(result.questionCount()).isEqualTo(2);
    }

    @Test
    void updateQuestionsFromBankRejectsSelectionUsedByOtherExams() {
        QuestionBankItem reused = questionBankItem("bank-reused", Question.QuestionType.MCQ);
        reused.setTags(List.of("math"));

        Exam targetExam = new Exam();
        targetExam.setId("exam-target");
        targetExam.setTags(List.of("math"));
        targetExam.setQuestions(List.of());

        Exam otherExam = new Exam();
        otherExam.setId("exam-other");
        otherExam.setQuestions(List.of(questionFromBankItem("q-1", "bank-reused")));

        when(examRepository.findById("exam-target")).thenReturn(java.util.Optional.of(targetExam));
        when(examRepository.findAll()).thenReturn(List.of(targetExam, otherExam));
        when(questionBankRepository.findAll()).thenReturn(List.of(reused));

        assertThatThrownBy(() -> examService.updateQuestionsFromBank(
            "exam-target",
            new UpdateExamQuestionsFromBankCommand(List.of("bank-reused"))
        ))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("already used in other exams");
    }

    @Test
    void getFullExamBackfillsBankItemIdFromQuestionBankHash() {
        String content = "What is 7 x 8?";
        String hash = sha256(content);

        Question question = new Question();
        question.setId("q-1");
        question.setQuestionNumber(1);
        question.setContent(content);
        question.setType(Question.QuestionType.MCQ);
        question.setPoints(0.5);
        question.setOptions(List.of("54", "56", "58", "60"));

        Exam exam = new Exam();
        exam.setId("exam-1");
        exam.setTitle("Math Quiz");
        exam.setDurationSeconds(1800);
        exam.setQuestions(List.of(question));

        QuestionBankItem bankItem = questionBankItem("bank-1", Question.QuestionType.MCQ);
        bankItem.setContentHash(hash);

        when(examRepository.findById("exam-1")).thenReturn(java.util.Optional.of(exam));
        when(questionBankRepository.findByContentHash(hash)).thenReturn(java.util.Optional.of(bankItem));

        ExamDTO full = examService.getFullExam("exam-1").orElseThrow();

        assertThat(full.questions()).hasSize(1);
        assertThat(full.questions().get(0).bankItemId()).isEqualTo("bank-1");
        verify(examRepository).save(exam);
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static QuestionBankItem questionBankItem(String id, Question.QuestionType type) {
        QuestionBankItem item = new QuestionBankItem();
        item.setId(id);
        item.setType(type);
        item.setContent("Question content for " + id);
        item.setPoints(1.0);
        item.setOptions(List.of("A", "B", "C", "D"));
        return item;
    }

    private static Question questionFromBankItem(String questionId, String bankItemId) {
        Question question = new Question();
        question.setId(questionId);
        question.setBankItemId(bankItemId);
        return question;
    }
}