/** FE-14: Student exam-taking page */
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Alert } from '@mui/material';
import { StudentManExamLayout } from '../components/templates';
import { StudentManExamHeader, StudentManQuestionPanel, StudentManExamNavigationBar, SubmitModal } from '../components/organisms';
import StudentManFlaggedSidebar from '../components/organisms/StudentManFlaggedSidebar';
import type { QuestionOption } from '../components/organisms';
import { useSession, useQuestion, useSaveAnswer, useSubmitExam } from '../hooks/useSession';
import { useExam } from '../hooks/useExams';
import { useWebSocketTimer } from '../hooks/useWebSocketTimer';
import { useProctor } from '../hooks/useProctor';

const ExamPage: React.FC = () => {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reviewFlaggedMode, setReviewFlaggedMode] = useState(false);
  const [flaggedReviewIndex, setFlaggedReviewIndex] = useState(0);
  // Store answers per question number
  const [answerMap, setAnswerMap] = useState<Record<number, string>>({});
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});
  const [flaggedMap, setFlaggedMap] = useState<Record<number, boolean>>({});

  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: question, isLoading: questionLoading } = useQuestion(sessionId, currentQuestion);
  const { data: exam } = useExam(session?.examId ?? '');
  const saveAnswer = useSaveAnswer(sessionId);
  const submitExam = useSubmitExam(sessionId);

  const handleForceSubmit = useCallback(() => {
    submitExam.mutate();
  }, [submitExam]);

  const { remaining } = useWebSocketTimer(sessionId, handleForceSubmit);
  useProctor(sessionId, session?.studentId ?? '');

  if (sessionLoading) return <CircularProgress />;
  if (!session) return <Alert severity="error">Exam session not found.</Alert>;

  const displayRemaining = remaining ?? session.remainingSeconds;
  const totalQuestions = exam?.questionCount ?? 0;
  const answeredCount = Object.values(answeredMap).filter(Boolean).length;


  // Utility to strip leading option prefixes like "A.", "B/", etc.
  const stripOptionPrefix = (text: string): string =>
    text.replace(/^[A-Da-d][./、]\s*/u, '').trim();

  // Map string[] options from API to QuestionOption[] and strip prefix
  const mappedOptions: QuestionOption[] | undefined = question?.options?.map((text, i) => ({
    key: String.fromCharCode(65 + i), // A, B, C, D...
    text: stripOptionPrefix(text),
  }));

  // If time is up, disable UI and show message
  const timeUp = (displayRemaining !== null && displayRemaining <= 0) || remaining === 0;
  if (timeUp) {
    return (
      <StudentManExamLayout
        header={
          <StudentManExamHeader
            remainingSeconds={0}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
          />
        }
        sidebar={null}
        footer={null}
      >
        <Alert severity="warning" sx={{ mt: 4, fontSize: 18 }}>
          Time is up! Your exam is being submitted. You can no longer answer questions.
        </Alert>
      </StudentManExamLayout>
    );
  }

  // Compute flagged question numbers
  const flaggedNumbers = Object.entries(flaggedMap)
    .filter(([_, flagged]) => flagged)
    .map(([num]) => Number(num))
    .sort((a, b) => a - b);

  // If in review flagged mode, show only flagged questions and navigation
  const inReviewFlagged = reviewFlaggedMode && flaggedNumbers.length > 0;
  const flaggedQuestionNumber = inReviewFlagged ? flaggedNumbers[flaggedReviewIndex] : currentQuestion;

  return (
    <StudentManExamLayout
      header={
        <StudentManExamHeader
          remainingSeconds={displayRemaining}
          currentQuestion={flaggedQuestionNumber}
          totalQuestions={totalQuestions}
        />
      }
      sidebar={
        <StudentManFlaggedSidebar
          flaggedMap={flaggedMap}
          totalQuestions={totalQuestions}
          currentQuestion={flaggedQuestionNumber}
          onJumpTo={q => {
            if (inReviewFlagged) {
              const idx = flaggedNumbers.indexOf(q);
              if (idx !== -1) setFlaggedReviewIndex(idx);
            } else {
              setCurrentQuestion(q);
            }
          }}
        />
      }
      footer={
        <StudentManExamNavigationBar
          canGoPrev={
            inReviewFlagged
              ? flaggedReviewIndex > 0
              : flaggedQuestionNumber > 1
          }
          canGoNext={
            inReviewFlagged
              ? flaggedReviewIndex < flaggedNumbers.length - 1
              : flaggedQuestionNumber < totalQuestions
          }
          isFlagged={flaggedMap[flaggedQuestionNumber] ?? false}
          isLastQuestion={
            inReviewFlagged
              ? flaggedReviewIndex === flaggedNumbers.length - 1
              : flaggedQuestionNumber === totalQuestions
          }
          flaggedCount={flaggedNumbers.length}
          onPrevious={() => {
            if (inReviewFlagged) {
              setFlaggedReviewIndex(i => Math.max(0, i - 1));
            } else {
              setCurrentQuestion(q => Math.max(1, q - 1));
            }
          }}
          onNext={() => {
            if (inReviewFlagged) {
              setFlaggedReviewIndex(i => Math.min(flaggedNumbers.length - 1, i + 1));
            } else {
              setCurrentQuestion(q => Math.min(totalQuestions, q + 1));
            }
          }}
          onFlag={() => {
            if (!question) return;
            const next = !flaggedMap[flaggedQuestionNumber];
            setFlaggedMap(m => ({ ...m, [flaggedQuestionNumber]: next }));
            saveAnswer.mutate({ questionId: question.id, payload: { answer: answerMap[flaggedQuestionNumber] || '', flaggedForReview: next } });
          }}
          onSubmit={() => setShowSubmitModal(true)}
          onReviewFlagged={
            !inReviewFlagged && flaggedNumbers.length > 0
              ? () => {
                setReviewFlaggedMode(true);
                setFlaggedReviewIndex(0);
              }
              : undefined
          }
        />
      }
      proTips={[
        "Hệ thống sẽ tự động nộp bài khi hết thời gian. Đảm bảo bạn đã chuẩn bị giấy nháp cho các phần tự luận.",
        "Đọc kỹ yêu cầu đề bài (ví dụ: \"Đặt tính\") trước khi làm để tránh nhầm lẫn.",
        "Sử dụng tính năng Flag for Review nếu bạn chưa chắc chắn về câu trả lời."
      ]}
    >
      {questionLoading ? (
        <CircularProgress />
      ) : question ? (
        <StudentManQuestionPanel
          questionNumber={flaggedQuestionNumber}
          questionText={question.content}
          questionType={question.type}
          options={mappedOptions}
          selectedAnswer={answerMap[flaggedQuestionNumber] || ''}
          onAnswerChange={(answer: string) => {
            setAnswerMap(m => ({ ...m, [flaggedQuestionNumber]: answer }));
            if (answer) setAnsweredMap(m => ({ ...m, [flaggedQuestionNumber]: true }));
            saveAnswer.mutate({ questionId: question.id, payload: { answer, flaggedForReview: flaggedMap[flaggedQuestionNumber] ?? false } });
          }}
        />
      ) : null}

      <SubmitModal
        open={showSubmitModal}
        answeredCount={answeredCount}
        totalCount={totalQuestions}
        onBack={() => setShowSubmitModal(false)}
        onFinalSubmit={() => { submitExam.mutate(); setShowSubmitModal(false); }}
      />
    </StudentManExamLayout>
  );
};

export default ExamPage;
