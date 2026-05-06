/** Teacher dashboard: shows published exam list + create-from-bank dialog. */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TeacherManDashboardLayout } from '../components/templates';
import {
  AppDialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Skeleton,
} from '../components/molecules';
import { Button, Chip } from '../components/atoms';
import { useExamList, useCreateExamFromBank, useDeleteExam } from '../hooks/useExams';
import { useAuth } from '../context/AuthContext';
import type { DashboardSection } from '../components/organisms';
import type { CreateExamFromBankCommand } from '../types/exam.types';
import { colors } from '../design-system/tokens';
import { BookOpen, Clock, Plus, Star, Trash2 } from 'lucide-react';
const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
};

interface CreateExamDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (cmd: CreateExamFromBankCommand) => void;
  isLoading: boolean;
}

const CreateExamDialog: React.FC<CreateExamDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [mcqCount, setMcqCount] = useState(10);
  const [essayShortCount, setEssayShortCount] = useState(1);
  const [essayLongCount, setEssayLongCount] = useState(1);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      durationSeconds: durationMin * 60,
      tags: tags.length > 0 ? tags : undefined,
      reviewNotes: reviewNotes.trim() || undefined,
      mcqCount,
      essayShortCount,
      essayLongCount,
    });
  };

  const handleClose = () => {
    if (isLoading) return;
    setTitle('');
    setDurationMin(60);
    setTagInput('');
    setTags([]);
    setReviewNotes('');
    setMcqCount(10);
    setEssayShortCount(1);
    setEssayLongCount(1);
    onClose();
  };

  if (!open) return null;

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      disableClose={isLoading}
      closeOnBackdrop={false}
    >
      <DialogHeader>Create Exam from Question Bank</DialogHeader>
      <DialogContent>
        <form
          id="create-exam-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">Exam Name</label>
            <input
              className="w-full border border-outline rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              className="w-full border border-outline rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={durationMin}
              onChange={(e) => setDurationMin(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">Tags</label>
            <div className="flex gap-2 mb-1">
              <input
                className="flex-1 border border-outline rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    size="small"
                    onDelete={() => handleRemoveTag(t)}
                    style={{
                      backgroundColor: `${colors.primary.main}18`,
                      color: colors.primary.main,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-on-surface mb-2">
              Question Bank Selection
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1"># MCQ</label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={mcqCount}
                  onChange={(e) => setMcqCount(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  # Essay Short
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={essayShortCount}
                  onChange={(e) => setEssayShortCount(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1"># Essay Long</label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={essayLongCount}
                  onChange={(e) => setEssayLongCount(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes for this exam"
            />
          </div>
        </form>
      </DialogContent>
      <DialogFooter>
        <Button type="button" variant="neutral" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-exam-form"
          variant="primary"
          disabled={isLoading || !title.trim() || mcqCount + essayShortCount + essayLongCount === 0}
        >
          {isLoading ? 'Creating…' : 'Create Exam'}
        </Button>
      </DialogFooter>
    </AppDialog>
  );
};

// ── Exam Card ────────────────────────────────────────────────────────────────

interface ExamCardProps {
  title: string;
  durationSeconds: number;
  questionCount: number;
  totalPoints: number;
  tags?: string[];
  onDelete: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({
  title,
  durationSeconds,
  questionCount,
  totalPoints,
  tags,
  onDelete,
}) => (
  <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary-300">
    {/* Left accent bar */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-l-2xl" />

    <div className="flex flex-col flex-1 pl-5 pr-4 pt-4 pb-3">
      {/* Title */}
      <h3 className="font-semibold text-base text-gray-900 leading-snug line-clamp-2 mb-3">
        {title}
      </h3>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
          <Clock size={13} className="text-primary-500" />
          {Math.round(durationSeconds / 60)} min
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
          <BookOpen size={13} className="text-primary-500" />
          {questionCount} questions
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
          <Star size={13} className="text-amber-400" />
          {totalPoints} pts
        </span>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[11px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* Footer */}
    <div className="flex justify-end border-t border-gray-100 px-4 py-2.5">
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors duration-150"
      >
        <Trash2 size={13} />
        Delete
      </button>
    </div>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const TeacherManDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const { data: exams, isLoading, refetch: refetchExams } = useExamList();
  const createFromBank = useCreateExamFromBank();
  const deleteExam = useDeleteExam();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  const handleCreate = (cmd: CreateExamFromBankCommand) => {
    createFromBank.mutate(cmd, {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success('Exam created successfully.');
      },
      onError: (e: Error) => {
        toast.error(e.message || 'Failed to create exam.');
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteExam.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        refetchExams();
        toast.success('Exam deleted successfully.');
      },
      onError: (e: Error) => {
        toast.error(e.message || 'Failed to delete exam.');
      },
    });
  };

  return (
    <TeacherManDashboardLayout
      activeSection="dashboard"
      onNavigate={handleNavigate}
      onCreateExam={() => setDialogOpen(true)}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500 mt-1">Published exams available to students</div>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          iconPlacement="left"
          onClick={() => setDialogOpen(true)}
        >
          Create Exam from Bank
        </Button>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height={220} />
          ))}
        </div>
      )}

      {!isLoading && (!exams || exams.length === 0) && (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-300 rounded-2xl">
          <div className="text-base font-semibold mb-2">No published exams yet</div>
          <div className="text-sm">
            Create an exam from the question bank or publish a draft to get started.
          </div>
        </div>
      )}

      {!isLoading && exams && exams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id}>
              <ExamCard
                title={exam.title}
                durationSeconds={exam.durationSeconds}
                questionCount={exam.questionCount}
                totalPoints={exam.totalPoints}
                tags={exam.tags}
                onDelete={() => setDeleteTarget({ id: exam.id, title: exam.title })}
              />
            </div>
          ))}
        </div>
      )}

      <CreateExamDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        isLoading={createFromBank.isPending}
      />

      {/* Delete confirmation dialog (Tailwind-based) */}
      {deleteTarget && (
        <AppDialog
          open
          disableClose={deleteExam.isPending}
          onClose={() => {
            if (!deleteExam.isPending) setDeleteTarget(null);
          }}
        >
          <DialogHeader>Delete Exam</DialogHeader>
          <DialogContent>
            <div className="mb-4 text-gray-700">
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
              <br />
              <span className="text-gray-500 text-xs">
                Questions in the question bank will not be affected.
              </span>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button
              variant="neutral"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteExam.isPending}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteExam.isPending}>
              {deleteExam.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </AppDialog>
      )}
    </TeacherManDashboardLayout>
  );
};

export default TeacherManDashboardPage;
