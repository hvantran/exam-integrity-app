/** FE-18: Teacher question review page */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Alert } from '@mui/material';
import {
  ExamIntegrityTeacherQuestionReviewTemplate,
  ExamIntegrityDashboardSection,
  ExamIntegrityQuestionDisplay as QuestionDisplay,
  ExamIntegrityReplaceFromBankModal,
  ExamIntegrityQuestionReviewWorkspace,
  ExamIntegrityQuestionReviewSummaryCard,
  type DraftQuestionDTO as UCLDraftQuestionDTO,
} from '@hvantran/ui-component-library';
import { useDraft, useEditQuestion, useRemoveQuestion, useAddQuestion } from '../hooks/useDraft';
import { useAuth } from '../context/AuthContext';
import { useNavDockMode, TEACHER_NAV_DOCK_STORAGE_KEY } from '../hooks/useNavDockMode';
import { useQuery } from '@tanstack/react-query';
import { questionBankService } from '../services/questionBankService';
import type { DraftQuestionDTO, QuestionType } from '../types/exam.types';

const SECTION_ROUTES: Record<ExamIntegrityDashboardSection, string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
  settings: '/teacher/settings',
};

const MCQ_OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });
}

function normalizeMcqAnswer(answer: string | undefined, options: string[] | undefined): string {
  const raw = (answer ?? '').trim();
  if (!raw) return '';

  const directLabel = raw.toUpperCase();
  if (MCQ_OPTION_LABELS.includes(directLabel)) {
    return directLabel;
  }

  const matchedIndex = (options ?? []).findIndex((opt) => opt === raw);
  if (matchedIndex >= 0) {
    return MCQ_OPTION_LABELS[matchedIndex] ?? '';
  }

  return directLabel;
}

// ── Main page ────────────────────────────────────────────────────────────────

const QuestionReviewPage: React.FC = () => {
  const { draftId = '' } = useParams<{ draftId: string }>();
  const [dockMode, setDockMode] = useNavDockMode('pinned', TEACHER_NAV_DOCK_STORAGE_KEY);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [scoreInput, setScoreInput] = useState<number | ''>('');
  const [correctAnswerInput, setCorrectAnswerInput] = useState('');
  const [pendingCorrectAnswers, setPendingCorrectAnswers] = useState<Record<string, string>>({});
  const [pendingQuestionImages, setPendingQuestionImages] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout, displayName } = useAuth();
  const handleLogout = () => {
    logout();
  };
  const handleNavigate = (section: ExamIntegrityDashboardSection) =>
    navigate(SECTION_ROUTES[section]);

  const { data: draft, isLoading } = useDraft(draftId);
  const editQuestion = useEditQuestion(draftId);
  const removeQuestion = useRemoveQuestion(draftId);
  const addQuestion = useAddQuestion(draftId);

  const { data: bankData, isLoading: isBankLoading } = useQuery({
    queryKey: ['question-bank-pick', bankSearch],
    queryFn: () => questionBankService.search({ q: bankSearch || undefined, size: 20 }),
    enabled: bankModalOpen,
    placeholderData: (prev) => prev,
  });

  // Only show non-excluded questions in the reviewer
  const questions = (draft?.questions ?? []).filter((q) => q.reviewStatus !== 'EXCLUDED');
  const currentQ = questions[currentIdx];
  const total = questions.length;

  // Keep score input in sync with the current question.
  useEffect(() => {
    if (!currentQ) {
      setScoreInput('');
      return;
    }

    setScoreInput(currentQ.points ?? 0);
  }, [currentQ?.id, currentQ?.points]);

  // Keep selected MCQ answer stable when navigating between questions.
  useEffect(() => {
    if (!currentQ) {
      setCorrectAnswerInput('');
      return;
    }

    const pendingAnswer = pendingCorrectAnswers[currentQ.id];
    if (pendingAnswer !== undefined) {
      setCorrectAnswerInput(pendingAnswer);
      return;
    }

    setCorrectAnswerInput(normalizeMcqAnswer(currentQ.correctAnswer, currentQ.options));
  }, [currentQ?.id, currentQ?.correctAnswer, currentQ?.options, pendingCorrectAnswers]);

  // Clean up local pending answer once server state catches up.
  useEffect(() => {
    if (!currentQ || currentQ.type !== 'MCQ') return;

    const pendingAnswer = pendingCorrectAnswers[currentQ.id];
    if (pendingAnswer === undefined) return;

    const persistedAnswer = normalizeMcqAnswer(currentQ.correctAnswer, currentQ.options);
    if (pendingAnswer !== persistedAnswer) return;

    setPendingCorrectAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  }, [
    currentQ?.id,
    currentQ?.type,
    currentQ?.correctAnswer,
    currentQ?.options,
    pendingCorrectAnswers,
  ]);

  // Clean up local pending image once server state catches up.
  useEffect(() => {
    if (!currentQ) return;

    const pendingImage = pendingQuestionImages[currentQ.id];
    if (pendingImage === undefined) return;

    const persistedImage = currentQ.imageData ?? '';
    if (pendingImage !== persistedImage) return;

    setPendingQuestionImages((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  }, [currentQ?.id, currentQ?.imageData, pendingQuestionImages]);

  const handleDelete = () => {
    if (!currentQ) return;
    removeQuestion.mutate(currentQ.id, {
      onSuccess: () => {
        // move index back if we deleted the last item
        setCurrentIdx((i) => Math.min(i, total - 2));
        toast.success('Question removed from draft.');
      },
      onError: (e: Error) => toast.error(e.message || 'Failed to remove question.'),
    });
  };

  const handleScoreBlur = () => {
    if (!currentQ || scoreInput === '') return;

    const normalizedScore = Math.max(0, Number(scoreInput));
    if (normalizedScore === currentQ.points) return;

    editQuestion.mutate({
      questionId: currentQ.id,
      cmd: {
        points: normalizedScore,
        reviewStatus: 'CORRECTED',
      },
    });
  };

  const handleCorrectAnswerChange = (value: string) => {
    if (!currentQ || currentQ.type !== 'MCQ') return;
    setCorrectAnswerInput(value);
    setSaveError(null);
    setPendingCorrectAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }));

    const persistedAnswer = normalizeMcqAnswer(currentQ.correctAnswer, currentQ.options);
    if (value === persistedAnswer) return;

    editQuestion.mutate(
      {
        questionId: currentQ.id,
        cmd: {
          correctAnswer: value,
          reviewStatus: 'CORRECTED',
        },
      },
      {
        onError: () => setSaveError('Unable to save correct answer. Please try again.'),
      },
    );
  };

  const handleCorrectAnswerBlur = () => {
    if (!currentQ || currentQ.type !== 'MCQ') return;
    const normalizedAnswer = correctAnswerInput;
    if (normalizedAnswer === normalizeMcqAnswer(currentQ.correctAnswer, currentQ.options)) return;

    editQuestion.mutate({
      questionId: currentQ.id,
      cmd: {
        correctAnswer: normalizedAnswer,
        reviewStatus: 'CORRECTED',
      },
    });
  };

  const handleQuestionImageUpload = async (file: File) => {
    if (!currentQ) return;

    try {
      setSaveError(null);
      const imageData = await toDataUrl(file);
      if (!imageData) return;

      setPendingQuestionImages((prev) => ({
        ...prev,
        [currentQ.id]: imageData,
      }));

      await editQuestion.mutateAsync({
        questionId: currentQ.id,
        cmd: {
          imageData,
          reviewStatus: 'CORRECTED',
        },
      });
    } catch {
      setSaveError('Unable to save image. Please retry upload before publishing.');
    }
  };

  const handleQuestionImageRemove = async () => {
    if (!currentQ) return;

    setSaveError(null);
    setPendingQuestionImages((prev) => ({
      ...prev,
      [currentQ.id]: '',
    }));

    try {
      await editQuestion.mutateAsync({
        questionId: currentQ.id,
        cmd: {
          imageData: '',
          reviewStatus: 'CORRECTED',
        },
      });
    } catch {
      setSaveError('Unable to remove image. Please try again.');
    }
  };

  const handlePublishNavigation = async () => {
    setSaveError(null);
    let hasPersistFailure = false;

    // Persist any unanswered buffered MCQ selections before opening verification.
    const pendingEntries = Object.entries(pendingCorrectAnswers);

    for (const [questionId, selectedAnswer] of pendingEntries) {
      const targetQuestion = questions.find((q) => q.id === questionId);
      if (!targetQuestion || targetQuestion.type !== 'MCQ') continue;

      const persistedAnswer = normalizeMcqAnswer(
        targetQuestion.correctAnswer,
        targetQuestion.options,
      );
      if (selectedAnswer === persistedAnswer) continue;

      try {
        await editQuestion.mutateAsync({
          questionId,
          cmd: {
            correctAnswer: selectedAnswer,
            reviewStatus: 'CORRECTED',
          },
        });
      } catch {
        hasPersistFailure = true;
      }
    }

    const pendingImageEntries = Object.entries(pendingQuestionImages);

    for (const [questionId, pendingImageData] of pendingImageEntries) {
      const targetQuestion = questions.find((q) => q.id === questionId);
      if (!targetQuestion) continue;

      const persistedImage = targetQuestion.imageData ?? '';
      if (pendingImageData === persistedImage) continue;

      try {
        await editQuestion.mutateAsync({
          questionId,
          cmd: {
            imageData: pendingImageData,
            reviewStatus: 'CORRECTED',
          },
        });
      } catch {
        hasPersistFailure = true;
      }
    }

    if (hasPersistFailure) {
      setSaveError('Some updates were not saved yet. Please retry and publish again.');
      toast.error('Some updates were not saved yet. Please retry and publish again.');
      return;
    }

    toast.success('All draft updates saved. Opening publish page...');
    navigate(`/teacher/drafts/${draftId}/publish`, {
      state: {
        pendingQuestionImages,
      },
    });
  };

  const handlePickFromBank = (q: UCLDraftQuestionDTO) => {
    addQuestion.mutate(
      {
        question: {
          content: q.content,
          type: q.type as QuestionType,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer,
          rubric: q.rubric,
        },
        position: currentIdx + 1,
      },
      {
        onSuccess: () => {
          toast.success('Question inserted from bank.');
          setBankModalOpen(false);
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to insert question.'),
      },
    );
  };

  // Now early returns can happen
  if (isLoading) {
    return (
      <ExamIntegrityTeacherQuestionReviewTemplate
        userName={displayName}
        questionNumber={currentIdx + 1}
        totalQuestions={1}
        examName="Loading draft..."
        isLoading
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSaveDraft={() => navigate('/teacher/ingestion')}
        onPublish={() => {}}
        dockMode={dockMode}
        onDockModeChange={setDockMode}
      />
    );
  }
  if (!draft) return <Alert severity="error">Draft not found.</Alert>;

  const displayImageData = currentQ
    ? (pendingQuestionImages[currentQ.id] ?? currentQ.imageData)
    : undefined;

  return (
    <>
      <ExamIntegrityTeacherQuestionReviewTemplate
        userName={displayName}
        questionNumber={currentIdx + 1}
        totalQuestions={total}
        examName={draft.summary.title ?? draft.summary.originalFilename}
        onReplace={() => setBankModalOpen(true)}
        onApprove={() => {
          if (currentQ)
            editQuestion.mutate(
              { questionId: currentQ.id, cmd: { reviewStatus: 'APPROVED' } },
              {
                onSuccess: () => toast.success('Question approved.'),
                onError: (e: Error) => toast.error(e.message || 'Failed to approve question.'),
              },
            );
        }}
        onDelete={handleDelete}
        isLoading={removeQuestion.isPending || editQuestion.isPending}
        onSaveDraft={() => navigate('/teacher/ingestion')}
        onPublish={handlePublishNavigation}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        dockMode={dockMode}
        onDockModeChange={setDockMode}
        leftPanel={
          <ExamIntegrityQuestionReviewWorkspace
            saveError={saveError}
            questions={questions}
            currentIndex={currentIdx}
            onSelectIndex={setCurrentIdx}
            onPrev={() => setCurrentIdx((i) => i - 1)}
            onNext={() => setCurrentIdx((i) => i + 1)}
          >
            {currentQ ? (
              <QuestionDisplay
                question={currentQ}
                index={currentIdx}
                questionScore={scoreInput}
                onQuestionScoreChange={setScoreInput}
                onQuestionScoreBlur={handleScoreBlur}
                questionImageData={displayImageData}
                onQuestionImageUpload={handleQuestionImageUpload}
                onQuestionImageRemove={handleQuestionImageRemove}
                selectedCorrectAnswer={correctAnswerInput}
                onCorrectAnswerChange={handleCorrectAnswerChange}
                onCorrectAnswerBlur={handleCorrectAnswerBlur}
              />
            ) : (
              <Alert severity="info">No questions were extracted from this PDF.</Alert>
            )}
          </ExamIntegrityQuestionReviewWorkspace>
        }
        rightPanel={
          <ExamIntegrityQuestionReviewSummaryCard
            filename={draft.summary.originalFilename}
            totalQuestions={total}
            totalPoints={draft.summary.totalPoints}
            flaggedCount={draft.summary.flaggedQuestionCount}
          />
        }
      />

      <ExamIntegrityReplaceFromBankModal
        open={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        search={bankSearch}
        onSearchChange={setBankSearch}
        questions={bankData?.content as unknown as UCLDraftQuestionDTO[]}
        isLoading={isBankLoading}
        isSelecting={addQuestion.isPending}
        onSelect={handlePickFromBank}
      />
    </>
  );
};

export default QuestionReviewPage;
