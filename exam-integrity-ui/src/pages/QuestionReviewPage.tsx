/** FE-18: Teacher question review page */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, CircularProgress, Alert, Typography, Button, Chip,
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
  overview:         '/teacher/ingestion',
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Select questions from the bank
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          size="small"
          placeholder="Search question content…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ),
          }}
        />
        {isLoading ? (
          <CircularProgress size={24} />
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
                  <TableCell sx={{ maxWidth: 420 }}>
                    <Typography variant="body2" noWrap>{q.content}</Typography>
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
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data?.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No questions found.
                    </Typography>
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

  if (isLoading) return <CircularProgress />;
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
          <Box sx={{ p: 2 }}>
            {/* Question navigator pills */}
            {total > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {questions.map((q, i) => (
                  <Chip
                    key={q.id}
                    label={`Question ${q.questionNumber > 0 ? q.questionNumber : i + 1}`}
                    size="small"
                    onClick={() => setCurrentIdx(i)}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: currentIdx === i ? 700 : 400,
                      backgroundColor: currentIdx === i ? colors.primary.main : colors.surface.container.low,
                      color: currentIdx === i ? colors.primary.on : colors.on.surface,
                      border: `1px solid ${currentIdx === i ? colors.primary.main : colors.outlineVariant}`,
                      '&:hover': { opacity: 0.85 },
                    }}
                  />
                ))}
              </Box>
            )}

            {currentQ ? (
              <QuestionDisplay question={currentQ} index={currentIdx} />
            ) : (
              <Alert severity="info">
                No questions were extracted from this PDF.
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button variant="outlined" size="small" disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(i => i - 1)}>← Prev</Button>
              <Typography sx={{ flex: 1, textAlign: 'center', alignSelf: 'center', fontSize: '0.85rem', color: colors.on.surfaceVariant }}>
                {total > 0 ? `${currentIdx + 1} / ${total}` : 'No questions'}
              </Typography>
              <Button variant="outlined" size="small" disabled={currentIdx >= total - 1}
                onClick={() => setCurrentIdx(i => i + 1)}>Next →</Button>
            </Box>
          </Box>
        }
        rightPanel={
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Draft Info</Typography>
            <Typography variant="body2" color="text.secondary">{draft.summary.originalFilename}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {total} questions · {draft.summary.totalPoints} pts
            </Typography>
            {draft.summary.flaggedQuestionCount > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                ⚠ {draft.summary.flaggedQuestionCount} questions need review
              </Typography>
            )}
          </Box>
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
