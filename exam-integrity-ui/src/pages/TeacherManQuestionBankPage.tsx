/** FE-19: Teacher question bank page — Stitch "Question Bank Explorer" design */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, MenuItem, Select, FormControl, InputLabel,
  Typography, IconButton, Button, Radio, RadioGroup, FormControlLabel,
  InputAdornment, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Chip } from '../components/atoms';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import HistoryIcon from '@mui/icons-material/History';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { TeacherManQuestionBankLayout } from '../components/templates';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionBankService } from '../services/questionBankService';
import type { DraftQuestionDTO, QuestionType } from '../types/exam.types';
import type { DraftQuestionEditCommand } from '../types/exam.types';
import { useAuth } from '../context/AuthContext';
import { colors, borderRadius } from '../design-system/tokens';
import type { DashboardSection } from '../components/organisms';

const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard:        '/teacher/dashboard',
  ingestion:        '/teacher/ingestion',
  review:           '/teacher/ingestion',
  scoring:          '/teacher/scoring',
  'question-bank':  '/teacher/question-bank',
  reports:          '/teacher/ingestion',
};

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'MCQ', label: 'MCQ' },
  { value: 'ESSAY_SHORT', label: 'Essay (Short)' },
  { value: 'ESSAY_LONG', label: 'Essay (Long)' },
];

/* ------------------------------------------------------------------ */
/* Inline Edit Form                                                     */
/* ------------------------------------------------------------------ */
interface EditFormState {
  content: string;
  type: QuestionType;
  difficulty: string;
  options: string[];
  correctAnswer: string;
  points: number;
  tags: string;
  imageData?: string; // Optional Base64 Data URI for the question image
}

const toEditForm = (q: DraftQuestionDTO): EditFormState => ({
  content: q.content,
  type: q.type ?? 'MCQ',
  difficulty: 'Medium',
  options: (q.options && q.options.length > 0
    ? [...q.options.map(stripOptionPrefix), '', '', '', ''].slice(0, 4)
    : ['', '', '', '']),
  correctAnswer: q.correctAnswer ?? 'A',
  points: q.points,
  tags: q.rubric?.keywords?.join(', ') ?? '',
  imageData: q.imageData ?? '',
});

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

/** Strip leading option prefixes like "A.", "A/", "A.", "B.", "B/" etc. from answer text */
const stripOptionPrefix = (text: string): string =>
  text.replace(/^[A-Da-d][./、]\s*/u, '').trim();

interface QuestionEditCardProps {
  question: DraftQuestionDTO;
  onSave: (id: string, cmd: DraftQuestionEditCommand) => void;
  onCancel: () => void;
  isSaving: boolean;
}
const QuestionEditCard: React.FC<QuestionEditCardProps> = ({ question, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState<EditFormState>(toEditForm(question));

  const setField = <K extends keyof EditFormState>(key: K, val: EditFormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const setOption = (idx: number, val: string) =>
    setForm(prev => { const opts = [...prev.options]; opts[idx] = val; return { ...prev, options: opts }; });

  const handleSave = () => {
    const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave(question.id, {
      content: form.content,
      type: form.type,
      points: form.points,
      options: form.type === 'MCQ' ? form.options : undefined,
      correctAnswer: form.type === 'MCQ' ? form.correctAnswer : undefined,
      rubric: tagList.length ? { keywords: tagList } : undefined,
      imageData: form.imageData || undefined,
    });
  };

  return (
    <Box className="bg-surface border-2 border-primary border-l-4 rounded-lg p-3 shadow-lg">
      {/* Header */}
      <Typography className="text-xs font-semibold tracking-wide text-primary uppercase mb-2">
        Edit Question
      </Typography>

      {/* Content */}
      <TextField
        label="Question Content"
        multiline
        minRows={3}
        fullWidth
        value={form.content}
        onChange={e => setField('content', e.target.value)}
        className="mb-2"
      />

      <Box className="flex gap-2 mb-2">
        <FormControl size="small" className="flex-1">
          <InputLabel>Difficulty Level</InputLabel>
          <Select value={form.difficulty} label="Difficulty Level" onChange={e => setField('difficulty', e.target.value)}>
            {DIFFICULTY_OPTIONS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Answer options (MCQ only) */}
      {form.type === 'MCQ' && (
        <Box className="mb-2">
          <Typography className="text-xs font-semibold text-on-surface mb-1 uppercase tracking-wide">
            Answer Options
          </Typography>
          <RadioGroup value={form.correctAnswer} onChange={e => setField('correctAnswer', e.target.value)}>
            {OPTION_LABELS.map((label, idx) => (
              <Box key={label} className="flex items-center gap-1 mb-1">
                <Radio value={label} size="small" className="p-1" />
                <Typography className="text-sm font-semibold text-on-surface min-w-[20px]">{label}</Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={`Option ${label}`}
                  value={form.options[idx] ?? ''}
                  onChange={e => setOption(idx, e.target.value)}
                  className="flex-1"
                />
              </Box>
            ))}
          </RadioGroup>
        </Box>
      )}

      {/* Points + Tags row */}
      <Box className="flex gap-2 mb-3">
        <TextField
          label="Points"
          type="number"
          size="small"
          value={form.points}
          onChange={e => setField('points', Number(e.target.value))}
          className="w-30"
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Tags / Keywords (comma separated)"
          size="small"
          fullWidth
          value={form.tags}
          onChange={e => setField('tags', e.target.value)}
        />
      </Box>


      {/* Image Upload */}
      <Button
        variant="outlined"
        component="label"
        size="small"
        sx={{ mb: 2 }}
      >
        Upload Image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              setField('imageData', ev.target?.result as string);
            };
            reader.readAsDataURL(file);
          }}
        />
      </Button>
      {form.imageData && (
        <Box sx={{ mb: 2 }}>
          <img src={form.imageData} alt="Preview" style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #ccc' }} />
        </Box>
      )}

      {/* Actions */}
      <Box className="flex gap-2 justify-end">
        <Button variant="outlined" size="small" onClick={onCancel} disabled={isSaving}
          className="border-outline text-on-surface">
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={handleSave} disabled={isSaving}
          className="bg-primary hover:bg-primary-deep text-primary-on">
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Read-only Question Card                                              */
/* ------------------------------------------------------------------ */
interface QuestionCardProps {
  question: DraftQuestionDTO;
  index: number;
  onEdit: () => void;
}
const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onEdit }) => {
  const [hovered, setHovered] = useState(false);
  const tags = question.rubric?.keywords ?? [];

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        backgroundColor: colors.surface.container.lowest,
        border: `1px solid ${colors.outlineVariant}`,
        borderRadius: borderRadius.lg,
        p: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        transition: 'box-shadow 0.15s',
        boxShadow: hovered ? '0px 2px 12px rgba(0,0,0,0.06)' : 'none',
        position: 'relative',
      }}
    >
      {/* Index */}
      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colors.on.surfaceVariant, minWidth: '28px', pt: '2px' }}>
        {index + 1}.
      </Typography>

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: '14px', color: colors.on.surface, lineHeight: 1.5, mb: 1,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {question.content}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={question.type ?? 'MCQ'} size="small"
            style={{ fontSize: '11px', fontWeight: 600, backgroundColor: colors.surface.container.default, color: colors.on.surfaceVariant, borderRadius: '4px', height: '22px' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.on.surfaceVariant }}>
            <StarOutlineIcon sx={{ fontSize: '14px' }} />
            <Typography sx={{ fontSize: '12px' }}>{question.points} pts</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.on.surfaceVariant }}>
            <HistoryIcon sx={{ fontSize: '14px' }} />
            <Typography sx={{ fontSize: '12px' }}>0 uses</Typography>
          </Box>
          {tags.slice(0, 3).map(tag => (
            <Chip key={tag} label={tag} size="small"
              style={{ fontSize: '11px', backgroundColor: colors.surface.container.low, borderRadius: '4px', height: '20px' }} />
          ))}
        </Box>
      </Box>

      {/* Actions (shown on hover) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
        <Tooltip title="Edit question">
          <IconButton size="small" onClick={onEdit}
            sx={{ color: colors.primary.main, '&:hover': { backgroundColor: colors.primary.fixed } }}>
            <EditIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>
        <Button size="small" startIcon={<DeleteSweepIcon sx={{ fontSize: '16px' }} />}
          sx={{
            fontSize: '12px',
            color: '#d32f2f',
            borderColor: '#d32f2f',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#d32f2f14', borderColor: '#b71c1c' },
          }}>
          Delete
        </Button>
      </Box>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
const QuestionBankPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [type, setType] = useState<QuestionType | ''>('');
  const [tagInput, setTagInput] = useState('');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<EditFormState>({ content: '', type: 'MCQ', difficulty: 'Medium', options: ['', '', '', ''], correctAnswer: 'A', points: 1, tags: '', imageData: '' });
  const [addError, setAddError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1); }, [q, type, tagFilters]);

  const { data, isLoading } = useQuery({
    queryKey: ['question-bank', q, type, tagFilters, page],
    queryFn: () => questionBankService.search({
      q: q || undefined,
      type: type || undefined,
      tags: tagFilters.length ? tagFilters : undefined,
      page: 0,
      size: page * PAGE_SIZE,
    }),
    placeholderData: (prev) => prev,
  });

  const { mutate: updateQuestion, isPending: isSaving } = useMutation({
    mutationFn: ({ id, cmd }: { id: string; cmd: DraftQuestionEditCommand }) =>
      questionBankService.update(id, cmd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      setEditingId(null);
    },
  });

  const { mutate: addQuestion, isPending: isAdding } = useMutation({
    mutationFn: (cmd: DraftQuestionEditCommand) => questionBankService.addQuestion(cmd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      setAddOpen(false);
      setAddForm({ content: '', type: 'MCQ', difficulty: 'Medium', options: ['', '', '', ''], correctAnswer: 'A', points: 1, tags: '', imageData: '' });
      setAddError(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setAddError(msg ?? 'Failed to add question. It may already exist in the bank.');
    },
  });

  const handleAddSubmit = () => {
    if (!addForm.content.trim()) { setAddError('Question content is required.'); return; }
    setAddError(null);
    const tagList = addForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    addQuestion({
      content: addForm.content,
      type: addForm.type,
      points: addForm.points,
      options: addForm.type === 'MCQ' ? addForm.options : undefined,
      correctAnswer: addForm.type === 'MCQ' ? addForm.correctAnswer : undefined,
      rubric: tagList.length ? { keywords: tagList } : undefined,
      imageData: addForm.imageData || undefined,
      reviewStatus: undefined,
      teacherNotes: undefined,
    } as DraftQuestionEditCommand);
  };

  const { mutate: deleteAllQuestions, isPending: isDeleting } = useMutation({
    mutationFn: () => questionBankService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      setDeleteAllOpen(false);
      setEditingId(null);
    },
  });

  const addTagFilter = () => {
    const tag = tagInput.trim();
    if (tag && !tagFilters.includes(tag)) setTagFilters(prev => [...prev, tag]);
    setTagInput('');
  };

  const removeTagFilter = (tag: string) => setTagFilters(prev => prev.filter(t => t !== tag));

  return (
    <>
      <TeacherManQuestionBankLayout
        isLoading={isLoading}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        filterBar={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            {/* Search */}
            <TextField
              placeholder="Search questions…"
              value={q}
              onChange={e => setQ(e.target.value)}
              size="small"
              sx={{ flex: '1 1 220px', minWidth: '180px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: '18px', color: colors.on.surfaceVariant }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Type */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={e => setType(e.target.value as QuestionType | '')}>
                <MenuItem value="">All Types</MenuItem>
                {TYPE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Tag input */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                placeholder="Add tag filter…"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTagFilter(); } }}
                size="small"
                sx={{ width: 160 }}
              />
            </Box>

            {/* Active tag chips */}
            {tagFilters.map(tag => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onDelete={() => removeTagFilter(tag)}
                deleteIcon={<CloseIcon sx={{ fontSize: '14px' }} />}
                style={{ backgroundColor: colors.primary.fixed, color: colors.primary.deep, fontWeight: 600, fontSize: '12px' }}
              />
            ))}
          </Box>
        }
        resultsBar={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ fontSize: '13px', color: colors.on.surfaceVariant }}>
              Showing <strong>{data?.totalElements ?? 0}</strong> results
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="Add a new question to the bank">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon sx={{ fontSize: '16px' }} />}
                  onClick={() => { setAddOpen(true); setAddError(null); }}
                  sx={{
                    fontSize: '12px',
                    textTransform: 'none',
                    backgroundColor: colors.primary.main,
                    '&:hover': { backgroundColor: colors.primary.deep },
                  }}
                >
                  Add Question
                </Button>
              </Tooltip>
              {(data?.totalElements ?? 0) > 0 && (
                <Tooltip title="Delete all questions from the bank">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DeleteSweepIcon sx={{ fontSize: '16px' }} />}
                    onClick={() => setDeleteAllOpen(true)}
                    sx={{
                      fontSize: '12px',
                      color: '#d32f2f',
                      borderColor: '#d32f2f',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#d32f2f14', borderColor: '#b71c1c' },
                    }}
                  >
                    Delete All
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Box>
        }
      >
        <>
            {data?.content.map((item, i) =>
              editingId === item.id ? (
                <QuestionEditCard
                  key={item.id}
                  question={item}
                  isSaving={isSaving}
                  onSave={(id, cmd) => updateQuestion({ id, cmd })}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <QuestionCard
                  key={item.id}
                  question={item}
                  index={(page - 1) * PAGE_SIZE + i}
                  onEdit={() => setEditingId(item.id)}
                />
              )
            )}

            {data && data.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="outlined" onClick={() => setPage(p => p + 1)} sx={{ borderColor: colors.outlineVariant, color: colors.on.surface, borderRadius: borderRadius.default }}>
                  Load More Results
                </Button>
              </Box>
            )}
          </>
      </TeacherManQuestionBankLayout>

      {/* Add Question dialog */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setAddError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: colors.primary.main }}>Add New Question</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Question Content"
            multiline
            minRows={3}
            fullWidth
            value={addForm.content}
            onChange={e => setAddForm(f => ({ ...f, content: e.target.value }))}
            sx={{ mt: 1, mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Question Type</InputLabel>
              <Select value={addForm.type} label="Question Type"
                onChange={e => setAddForm(f => ({ ...f, type: e.target.value as QuestionType }))}>
                {TYPE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Difficulty Level</InputLabel>
              <Select value={addForm.difficulty} label="Difficulty Level"
                onChange={e => setAddForm(f => ({ ...f, difficulty: e.target.value }))}>
                {DIFFICULTY_OPTIONS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          {addForm.type === 'MCQ' && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: colors.on.surfaceVariant, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Answer Options
              </Typography>
              <RadioGroup value={addForm.correctAnswer} onChange={e => setAddForm(f => ({ ...f, correctAnswer: e.target.value }))}>
                {OPTION_LABELS.map((label, idx) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Radio value={label} size="small" sx={{ p: '4px' }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colors.on.surface, minWidth: '20px' }}>{label}</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Option ${label}`}
                      value={addForm.options[idx] ?? ''}
                      onChange={e => setAddForm(f => {
                        const opts = [...f.options]; opts[idx] = e.target.value; return { ...f, options: opts };
                      })}
                    />
                  </Box>
                ))}
              </RadioGroup>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <TextField
              label="Points"
              type="number"
              size="small"
              value={addForm.points}
              onChange={e => setAddForm(f => ({ ...f, points: Number(e.target.value) }))}
              sx={{ width: 120 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Tags / Keywords (comma separated)"
              size="small"
              fullWidth
              value={addForm.tags}
              onChange={e => setAddForm(f => ({ ...f, tags: e.target.value }))}
            />
          </Box>
          {/* Image Upload */}
          <Button
            variant="outlined"
            component="label"
            size="small"
            sx={{ mb: 2 }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setAddForm(f => ({ ...f, imageData: ev.target?.result as string }));
                };
                reader.readAsDataURL(file);
              }}
            />
          </Button>
          {addForm.imageData && (
            <Box sx={{ mb: 2 }}>
              <img src={addForm.imageData} alt="Preview" style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #ccc' }} />
            </Box>
          )}
          {addError && (
            <Typography sx={{ fontSize: '12px', color: '#d32f2f', mt: 1 }}>{addError}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => { setAddOpen(false); setAddError(null); }} disabled={isAdding}
            sx={{ borderColor: colors.outlineVariant, color: colors.on.surfaceVariant }}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleAddSubmit} disabled={isAdding}
            sx={{ backgroundColor: colors.primary.main, '&:hover': { backgroundColor: colors.primary.deep } }}>
            {isAdding ? 'Saving…' : 'Add Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All confirmation dialog */}
      <Dialog open={deleteAllOpen} onClose={() => setDeleteAllOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f' }}>Delete All Questions</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete <strong>all {data?.totalElements ?? ''} questions</strong> from the question bank. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setDeleteAllOpen(false)} disabled={isDeleting}
            sx={{ borderColor: colors.outlineVariant, color: colors.on.surfaceVariant }}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={() => deleteAllQuestions()} disabled={isDeleting}
            sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}>
            {isDeleting ? 'Deleting…' : 'Delete All'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuestionBankPage;
