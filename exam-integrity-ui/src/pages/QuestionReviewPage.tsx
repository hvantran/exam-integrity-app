/** FE-18: Teacher question review page */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CircularProgress, Alert, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { TeacherManQuestionReviewLayout } from '../components/templates';
import { useDraft, useEditQuestion, useRemoveQuestion, useAddQuestion } from '../hooks/useDraft';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { questionBankService } from '../services/questionBankService';
import type { DashboardSection } from '../components/organisms';
import type { DraftQuestionDTO } from '../types/exam.types';
import QuestionDisplay from '../components/molecules/QuestionDisplay/QuestionDisplay';
import { colors } from '../design-system/tokens';

const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard:        '/teacher/dashboard',
  ingestion:        '/teacher/ingestion',
  review:           '/teacher/ingestion',
  'question-bank':  '/teacher/question-bank',
  reports:          '/teacher/ingestion',
};

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
          <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
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
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ),
          }}
        />
        {isLoading ? (
          <div className="flex justify-center py-4"><CircularProgress size={24} /></div>
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
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  const { data: draft, isLoading } = useDraft(draftId);
  const editQuestion = useEditQuestion(draftId);
  const removeQuestion = useRemoveQuestion(draftId);

  if (isLoading) return <div className="flex justify-center items-center h-64"><CircularProgress /></div>;
  if (!draft) return <Alert severity="error">Draft not found.</Alert>;

  // Only show non-excluded questions in the reviewer
  const questions = (draft.questions ?? []).filter(q => q.reviewStatus !== 'EXCLUDED');
  const currentQ = questions[currentIdx];
  const total = questions.length;

  const handleDelete = () => {
    if (!currentQ) return;
    removeQuestion.mutate(currentQ.id, {
      onSuccess: () => {
        // move index back if we deleted the last item
        setCurrentIdx(i => Math.min(i, total - 2));
      },
    });
  };

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
        onPublish={() => navigate(`/teacher/drafts/${draftId}/publish`)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        leftPanel={
          <div className="p-4">
            {/* Question navigator pills */}
            {total > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(i)}
                    className={`px-3 py-1 rounded border text-xs font-medium transition-colors duration-150 ${currentIdx === i
                      ? 'bg-primary text-primary-on border-primary font-bold'
                      : 'bg-surface text-on-surface border-outline'} hover:opacity-85`}
                  >
                    {`Question ${q.questionNumber > 0 ? q.questionNumber : i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {currentQ ? (
              <QuestionDisplay question={currentQ} index={currentIdx} />
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
