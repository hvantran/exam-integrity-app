/** FE-14: Student exam-taking page */
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Alert } from '@mui/material';
import { StudentManExamLayout } from '../components/templates';
import { StudentManExamHeader, StudentManQuestionPanel, StudentManExamNavigationBar, SubmitModal } from '../components/organisms';
import type { QuestionOption } from '../components/organisms';
import { useSession, useQuestion, useSaveAnswer, useSubmitExam } from '../hooks/useSession';
import { useExam } from '../hooks/useExams';
import { useWebSocketTimer } from '../hooks/useWebSocketTimer';
import { useProctor } from '../hooks/useProctor';

const ExamPage: React.FC = () => {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
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

  return (
    <StudentManExamLayout
      header={
        <StudentManExamHeader
          remainingSeconds={displayRemaining}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />
      }
      sidebar={null}
      footer={
        <StudentManExamNavigationBar
          canGoPrev={currentQuestion > 1}
          canGoNext={currentQuestion < totalQuestions}
          onPrevious={() => setCurrentQuestion(q => Math.max(1, q - 1))}
          onNext={() => setCurrentQuestion(q => Math.min(totalQuestions, q + 1))}
          isFlagged={flaggedMap[currentQuestion] ?? false}
          onFlag={() => {
            if (!question) return;
            const next = !flaggedMap[currentQuestion];
            setFlaggedMap(m => ({ ...m, [currentQuestion]: next }));
            saveAnswer.mutate({ questionId: question.id, payload: { answer: answerMap[currentQuestion] || '', flaggedForReview: next } });
          }}
          onSubmit={() => setShowSubmitModal(true)}
        />
      }
    >
      {questionLoading ? (
        <CircularProgress />
      ) : question ? (
        <StudentManQuestionPanel
          questionNumber={question.questionNumber}
          questionText={question.content}
          questionType={question.type}
          options={mappedOptions}
          selectedAnswer={answerMap[currentQuestion] || ''}
          onAnswerChange={(answer: string) => {
            setAnswerMap(m => ({ ...m, [currentQuestion]: answer }));
            if (answer) setAnsweredMap(m => ({ ...m, [currentQuestion]: true }));
            saveAnswer.mutate({ questionId: question.id, payload: { answer, flaggedForReview: flaggedMap[currentQuestion] ?? false } });
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
