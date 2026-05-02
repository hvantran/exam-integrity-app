/** FE-19: Teacher question bank page — Stitch "Question Bank Explorer" design */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { Chip, Button, Modal, Select } from '../components/atoms';
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

// ── Input style helpers ───────────────────────────────────────────────────────

const inputCls = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white w-full';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

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
  imageData?: string;
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
    <div
      className="rounded-lg p-3 shadow-lg bg-surface-lowest border-2 border-l-4 border-primary"
    >
      {/* Header */}
      <p className="text-xs font-semibold tracking-wide uppercase mb-2 text-primary">
        Edit Question
      </p>

      {/* Content */}
      <textarea
        className={`${inputCls} resize-y min-h-[72px] mb-2`}
        placeholder="Question Content"
        rows={3}
        value={form.content}
        onChange={e => setField('content', e.target.value)}
      />

      <div className="flex gap-2 mb-2">
        <Select
          value={form.difficulty}
          onChange={val => setField('difficulty', val)}
          options={DIFFICULTY_OPTIONS.map(d => ({ value: d, label: d }))}
          className="flex-1"
        />
      </div>

      {/* Answer options (MCQ only) */}
      {form.type === 'MCQ' && (
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-on-surfaceVariant">
            Answer Options
          </p>
          {OPTION_LABELS.map((label, idx) => (
            <label key={label} className="flex items-center gap-1 mb-1 cursor-pointer">
              <input
                type="radio"
                name={`correctAnswer-${question.id}`}
                value={label}
                checked={form.correctAnswer === label}
                onChange={e => setField('correctAnswer', e.target.value)}
                className="accent-violet-600 w-4 h-4 shrink-0"
              />
              <span className="text-sm font-semibold min-w-[20px] text-on-surface">{label}</span>
              <input
                className={`${inputCls} flex-1`}
                placeholder={`Option ${label}`}
                value={form.options[idx] ?? ''}
                onChange={e => setOption(idx, e.target.value)}
              />
            </label>
          ))}
        </div>
      )}

      {/* Points + Tags row */}
      <div className="flex gap-2 mb-3">
        <input
          type="number"
          className={`${inputCls} w-24`}
          placeholder="Points"
          min={0}
          value={form.points}
          onChange={e => setField('points', Number(e.target.value))}
        />
        <input
          className={`${inputCls} flex-1`}
          placeholder="Tags / Keywords (comma separated)"
          value={form.tags}
          onChange={e => setField('tags', e.target.value)}
        />
      </div>

      {/* Image Upload */}
      <label
        className="inline-flex items-center gap-1.5 mb-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition text-on-surface"
      >
        Upload Image
        <input
          type="file"
          accept="image/*"
          className="hidden"
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
      </label>
      {form.imageData && (
        <div className="mb-2">
          <img src={form.imageData} alt="Preview" className="max-h-40 rounded-lg border border-gray-300" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outlined" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
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
  const tags = question.rubric?.keywords ?? [];

  return (
    <div
      className="group rounded-lg px-5 py-4 flex items-start gap-4 relative bg-surface-lowest border border-outlineVariant transition-shadow hover:shadow-md"
    >
      {/* Index */}
      <span className="text-[13px] font-semibold text-on-surfaceVariant min-w-[28px] pt-0.5 shrink-0">
        {index + 1}.
      </span>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface leading-relaxed mb-2 line-clamp-2">
          {question.content}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center text-[11px] font-semibold bg-surface-high text-on-surfaceVariant rounded px-1.5 h-[22px]">
            {question.type ?? 'MCQ'}
          </span>
          <div className="flex items-center gap-1 text-on-surfaceVariant">
            <StarOutlineIcon sx={{ fontSize: '14px' }} />
            <span className="text-xs">{question.points} pts</span>
          </div>
          <div className="flex items-center gap-1 text-on-surfaceVariant">
            <HistoryIcon sx={{ fontSize: '14px' }} />
            <span className="text-xs">0 uses</span>
          </div>
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="inline-flex items-center text-[11px] bg-surface-low text-on-surfaceVariant rounded px-1.5 h-5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions (shown on hover) */}
      <div className="flex items-center gap-1 transition-opacity duration-150 opacity-0 group-hover:opacity-100">
        <button
          title="Edit question"
          onClick={onEdit}
          className="rounded-full p-1 transition hover:bg-violet-50 text-primary"
        >
          <EditIcon sx={{ fontSize: '18px' }} />
        </button>
        <button
          className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition hover:bg-red-50 text-error-600 border-error-600"
        >
          <DeleteSweepIcon sx={{ fontSize: '16px' }} />
          Delete
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MCQ Options Form (shared between Add and Edit dialogs)              */
/* ------------------------------------------------------------------ */
interface McqOptionsProps {
  options: string[];
  correctAnswer: string;
  idPrefix: string;
  onOptionChange: (idx: number, val: string) => void;
  onCorrectAnswerChange: (val: string) => void;
}

const McqOptionsForm: React.FC<McqOptionsProps> = ({ options, correctAnswer, idPrefix, onOptionChange, onCorrectAnswerChange }) => (
  <div className="mb-4">
    <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-on-surfaceVariant">
      Answer Options
    </p>
    {OPTION_LABELS.map((label, idx) => (
      <label key={label} className="flex items-center gap-2 mb-2 cursor-pointer">
        <input
          type="radio"
          name={`${idPrefix}-correctAnswer`}
          value={label}
          checked={correctAnswer === label}
          onChange={e => onCorrectAnswerChange(e.target.value)}
          className="accent-violet-600 w-4 h-4 shrink-0"
        />
        <span className="text-sm font-semibold min-w-[20px] text-on-surface">{label}</span>
        <input
          className={`${inputCls} flex-1`}
          placeholder={`Option ${label}`}
          value={options[idx] ?? ''}
          onChange={e => onOptionChange(idx, e.target.value)}
        />
      </label>
    ))}
  </div>
);

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
  const [addForm, setAddForm] = useState<EditFormState>({
    content: '', type: 'MCQ', difficulty: 'Medium',
    options: ['', '', '', ''], correctAnswer: 'A', points: 1, tags: '', imageData: '',
  });
  const [addError, setAddError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

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
          <div className="flex gap-2 items-center overflow-x-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-[500px]">
              <SearchIcon
                sx={{ fontSize: '18px' }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surfaceVariant"
              />
              <input
                className={`${inputCls} pl-8`}
                placeholder="Search questions…"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>

            {/* Type */}
            <Select
              value={type}
              onChange={val => setType(val as QuestionType | '')}
              options={TYPE_OPTIONS}
              placeholder="All Types"
              className="min-w-[160px]"
            />

            {/* Tag input */}
            <input
              className={`${inputCls} w-36 shrink-0`}
              placeholder="Add tag filter…"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTagFilter(); } }}
            />

            {/* Active tag chips */}
            {tagFilters.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs font-semibold bg-primary-100 text-primary-deep rounded-full px-2 h-6 shrink-0">
                {tag}
                <button type="button" onClick={() => removeTagFilter(tag)} className="leading-none hover:opacity-70">
                  <CloseIcon sx={{ fontSize: '14px' }} />
                </button>
              </span>
            ))}
          </div>
        }
        resultsBar={
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] text-on-surfaceVariant">
              Showing <strong>{data?.totalElements ?? 0}</strong> results
            </span>
            <div className="flex gap-2 items-center">
              <span title="Add a new question to the bank">
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<AddCircleOutlineIcon sx={{ fontSize: '16px' }} />}
                  onClick={() => { setAddOpen(true); setAddError(null); }}
                >
                  Add Question
                </Button>
              </span>
              {(data?.totalElements ?? 0) > 0 && (
                <span title="Delete all questions from the bank">
                  <Button
                    size="sm"
                    variant="danger"
                    startIcon={<DeleteSweepIcon sx={{ fontSize: '16px' }} />}
                    onClick={() => setDeleteAllOpen(true)}
                  >
                    Delete All
                  </Button>
                </span>
              )}
            </div>
          </div>
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
                index={i}
                onEdit={() => setEditingId(item.id)}
              />
            )
          )}

          {data && data.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outlined"
                onClick={() => setPage(p => p + 1)}
              >
                Load More Results
              </Button>
            </div>
          )}
        </>
      </TeacherManQuestionBankLayout>

      {/* Add Question modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); setAddError(null); }}
        title="Add New Question"
        actions={
          <>
            <Button variant="outlined" size="sm" onClick={() => { setAddOpen(false); setAddError(null); }} disabled={isAdding}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddSubmit} disabled={isAdding}>
              {isAdding ? 'Saving…' : 'Add Question'}
            </Button>
          </>
        }
      >
        <textarea
          className={`${inputCls} resize-y min-h-[72px] mb-4`}
          placeholder="Question Content"
          rows={3}
          value={addForm.content}
          onChange={e => setAddForm(f => ({ ...f, content: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls}>Question Type</label>
            <Select
              value={addForm.type}
              onChange={val => setAddForm(f => ({ ...f, type: val as QuestionType }))}
              options={TYPE_OPTIONS}
            />
          </div>
          <div>
            <label className={labelCls}>Difficulty Level</label>
            <Select
              value={addForm.difficulty}
              onChange={val => setAddForm(f => ({ ...f, difficulty: val }))}
              options={DIFFICULTY_OPTIONS.map(d => ({ value: d, label: d }))}
            />
          </div>
        </div>

        {addForm.type === 'MCQ' && (
          <McqOptionsForm
            options={addForm.options}
            correctAnswer={addForm.correctAnswer}
            idPrefix="add"
            onOptionChange={(idx, val) => setAddForm(f => {
              const opts = [...f.options]; opts[idx] = val; return { ...f, options: opts };
            })}
            onCorrectAnswerChange={val => setAddForm(f => ({ ...f, correctAnswer: val }))}
          />
        )}

        <div className="flex gap-3 mb-3">
          <div>
            <label className={labelCls}>Points</label>
            <input
              type="number"
              className={`${inputCls} w-24`}
              min={0}
              value={addForm.points}
              onChange={e => setAddForm(f => ({ ...f, points: Number(e.target.value) }))}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Tags / Keywords (comma separated)</label>
            <input
              className={inputCls}
              value={addForm.tags}
              onChange={e => setAddForm(f => ({ ...f, tags: e.target.value }))}
            />
          </div>
        </div>

        {/* Image Upload */}
        <label className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 text-sm border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
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
        </label>
        {addForm.imageData && (
          <div className="mb-3">
            <img src={addForm.imageData} alt="Preview" className="max-h-40 rounded-lg border border-gray-300" />
          </div>
        )}
        {addError && (
          <p className="text-xs mt-1 text-error-600">{addError}</p>
        )}
      </Modal>

      {/* Delete All confirmation modal */}
      <Modal
        open={deleteAllOpen}
        onClose={() => setDeleteAllOpen(false)}
        title="Delete All Questions"
        titleClassName="text-error-600"
        maxWidth="max-w-sm"
        actions={
          <>
            <Button variant="outlined" size="sm" onClick={() => setDeleteAllOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={() => deleteAllQuestions()} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete All'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          This will permanently delete{' '}
          <strong>all {data?.totalElements ?? ''} questions</strong> from the question bank.
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default QuestionBankPage;
