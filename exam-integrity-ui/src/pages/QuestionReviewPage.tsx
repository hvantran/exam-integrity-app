/** FE-18: Teacher question review page */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, InputAdornment,
} from '@mui/material';
import { Search, X } from 'lucide-react';
import { TeacherManQuestionReviewLayout } from '../components/templates';
import { useDraft, useEditQuestion, useRemoveQuestion, useAddQuestion } from '../hooks/useDraft';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { questionBankService } from '../services/questionBankService';
import type { DashboardSection } from '../components/organisms';
import type { DraftQuestionDTO } from '../types/exam.types';
import QuestionDisplay from '../components/molecules/QuestionDisplay';
import { Skeleton } from '../components/molecules';
import { Chip } from '../components/atoms';
import { colors } from '../design-system/tokens';

const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard:        '/teacher/dashboard',
  ingestion:        '/teacher/ingestion',
  review:           '/teacher/ingestion',
  scoring:          '/teacher/scoring',
  'question-bank':  '/teacher/question-bank',
  reports:          '/teacher/ingestion',
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

  const matchedIndex = (options ?? []).findIndex(opt => opt === raw);
  if (matchedIndex >= 0) {
    return MCQ_OPTION_LABELS[matchedIndex] ?? '';
  }

  return directLabel;
}

// ── Replace-from-Bank modal ──────────────────────────────────────────────────

interface ReplaceBankModalProps {
  open: boolean;
  insertPosition: number;   // 1-based position in the draft
  draftId: string;
  onClose: () => void;
}

const ReplaceBankModal: React.FC<ReplaceBankModalProps> = ({ open, insertPosition, draftId, onClose }) => {
  const [search, setSearch] = useState('');
  const addQuestion = useAddQuestion(draftId);

  const { data, isLoading } = useQuery({
    queryKey: ['question-bank-pick', search],
    queryFn: () => questionBankService.search({ q: search || undefined, size: 20 }),
    enabled: open,
    placeholderData: prev => prev,
  });

  const handlePick = (q: DraftQuestionDTO) => {
    addQuestion.mutate(
      {
        question: {
          content: q.content,
          type: q.type,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer,
          rubric: q.rubric,
        },
        position: insertPosition,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <div className="flex items-center justify-between w-full">
          <span>Select questions from the bank</span>
          <IconButton size="small" onClick={onClose}><X size={18} /></IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          size="small"
          placeholder="Search question content…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><Search size={18} /></InputAdornment>
            ),
          }}
        />
        {isLoading ? (
          <div className="py-2">
            <Skeleton height={40} width="100%" className="mb-2" />
            <Skeleton height={40} width="100%" className="mb-2" />
            <Skeleton height={40} width="100%" className="mb-2" />
            <Skeleton height={40} width="100%" />
          </div>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Content</TableCell>
                <TableCell width={80}>Type</TableCell>
                <TableCell width={60}>Points</TableCell>
                <TableCell width={80} />
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.content ?? []).map(q => (
                <TableRow key={q.id} hover>
                  <TableCell className="max-w-[420px] truncate">
                    <span className="text-sm font-normal truncate block">{q.content}</span>
                  </TableCell>
                  <TableCell>
                    <Chip label={q.type} size="small" />
                  </TableCell>
                  <TableCell>{q.points}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={addQuestion.isPending}
                      onClick={() => handlePick(q)}
                      className="!bg-primary !text-primary-on !rounded !px-3 !py-1 hover:!bg-primary-deep"
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data?.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="text-center text-gray-400 text-sm py-2">No questions found.</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────

const QuestionReviewPage: React.FC = () => {
  const { draftId = '' } = useParams<{ draftId: string }>();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [scoreInput, setScoreInput] = useState<number | ''>('');
  const [correctAnswerInput, setCorrectAnswerInput] = useState('');
  const [pendingCorrectAnswers, setPendingCorrectAnswers] = useState<Record<string, string>>({});
  const [pendingQuestionImages, setPendingQuestionImages] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  const { data: draft, isLoading } = useDraft(draftId);
  const editQuestion = useEditQuestion(draftId);
  const removeQuestion = useRemoveQuestion(draftId);

  // Only show non-excluded questions in the reviewer
  const questions = (draft?.questions ?? []).filter(q => q.reviewStatus !== 'EXCLUDED');
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

    setPendingCorrectAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  }, [currentQ?.id, currentQ?.type, currentQ?.correctAnswer, currentQ?.options, pendingCorrectAnswers]);

  // Clean up local pending image once server state catches up.
  useEffect(() => {
    if (!currentQ) return;

    const pendingImage = pendingQuestionImages[currentQ.id];
    if (pendingImage === undefined) return;

    const persistedImage = currentQ.imageData ?? '';
    if (pendingImage !== persistedImage) return;

    setPendingQuestionImages(prev => {
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
        setCurrentIdx(i => Math.min(i, total - 2));
      },
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
    setPendingCorrectAnswers(prev => ({
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

      setPendingQuestionImages(prev => ({
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
    setPendingQuestionImages(prev => ({
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
      const targetQuestion = questions.find(q => q.id === questionId);
      if (!targetQuestion || targetQuestion.type !== 'MCQ') continue;

      const persistedAnswer = normalizeMcqAnswer(targetQuestion.correctAnswer, targetQuestion.options);
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
      const targetQuestion = questions.find(q => q.id === questionId);
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
      return;
    }

    navigate(`/teacher/drafts/${draftId}/publish`, {
      state: {
        pendingQuestionImages,
      },
    });
  };

  // Now early returns can happen
  if (isLoading) {
    return (
      <TeacherManQuestionReviewLayout
        questionNumber={currentIdx + 1}
        totalQuestions={1}
        examName="Loading draft..."
        isLoading
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSaveDraft={() => navigate('/teacher/ingestion')}
        onPublish={() => {}}
      />
    );
  }
  if (!draft) return <Alert severity="error">Draft not found.</Alert>;

  const displayImageData = currentQ ? (pendingQuestionImages[currentQ.id] ?? currentQ.imageData) : undefined;

  return (
    <>
      <TeacherManQuestionReviewLayout
        questionNumber={currentIdx + 1}
        totalQuestions={total}
        examName={draft.summary.title ?? draft.summary.originalFilename}
        onReplace={() => setBankModalOpen(true)}
        onApprove={() => {
          if (currentQ) editQuestion.mutate({ questionId: currentQ.id, cmd: { reviewStatus: 'APPROVED' } });
        }}
        onDelete={handleDelete}
        isLoading={removeQuestion.isPending || editQuestion.isPending}
        onSaveDraft={() => navigate('/teacher/ingestion')}
        onPublish={handlePublishNavigation}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        leftPanel={
          <div className="p-4">
            {saveError && (
              <Alert severity="warning" className="mb-3">
                {saveError}
              </Alert>
            )}

            {/* Question navigator pills */}
            {total > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {questions.map((q, i) => (
                  <Button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(i)}
                    variant="outlined"
                    size="small"
                    className={`px-3 py-1 rounded border text-xs font-medium transition-colors duration-150 ${currentIdx === i
                      ? 'bg-primary text-primary-on border-primary font-bold'
                      : 'bg-surface text-on-surface border-outline'} hover:opacity-85`}
                  >
                    {`Question ${q.questionNumber > 0 ? q.questionNumber : i + 1}`}
                  </Button>
                ))}
              </div>
            )}

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
              <Alert severity="info">
                No questions were extracted from this PDF.
              </Alert>
            )}

            <div className="flex gap-2 mt-4 items-center">
              <Button variant="outlined" size="small" disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(i => i - 1)} className="!rounded !px-3 !py-1">← Prev</Button>
              <span className="flex-1 text-center text-xs text-gray-500">{total > 0 ? `${currentIdx + 1} / ${total}` : 'No questions'}</span>
              <Button variant="outlined" size="small" disabled={currentIdx >= total - 1}
                onClick={() => setCurrentIdx(i => i + 1)} className="!rounded !px-3 !py-1">Next →</Button>
            </div>
          </div>
        }
        rightPanel={
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-700 mb-1">Draft Info</div>
            <div className="text-xs text-gray-500">{draft.summary.originalFilename}</div>
            <div className="text-xs text-gray-500 mt-2">{total} questions · {draft.summary.totalPoints} pts</div>
            {draft.summary.flaggedQuestionCount > 0 && (
              <div className="text-xs text-yellow-700 mt-2">⚠ {draft.summary.flaggedQuestionCount} questions need review</div>
            )}
          </div>
        }
      />

      <ReplaceBankModal
        open={bankModalOpen}
        insertPosition={currentIdx + 1}
        draftId={draftId}
        onClose={() => setBankModalOpen(false)}
      />
    </>
  );
};

export default QuestionReviewPage;
