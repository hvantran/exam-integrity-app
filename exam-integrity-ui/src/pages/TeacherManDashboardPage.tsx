/** Teacher dashboard: shows all teacher exams + create-from-bank dialog. */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TeacherManDashboardLayout } from '../components/templates';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AppDialog,
  Combobox,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Skeleton,
  SelectQuestionsFromBankDialog,
} from '../components/molecules';
import { Button, Chip } from '../components/atoms';
import {
  useExam,
  useCreateExamFromBank,
  useDeleteExam,
  useUpdateExamQuestionsFromBank,
} from '../hooks/useExams';
import { examService } from '../services/examService';
import { questionBankService } from '../services/questionBankService';
import { useAuth } from '../context/AuthContext';
import type { DashboardSection } from '../components/organisms';
import type { CreateExamFromBankCommand, ExamDTO } from '../types/exam.types';
import { colors } from '../design-system/tokens';
import { BookOpen, Clock, Eye, ListChecks, Plus, Star, Trash2 } from 'lucide-react';
import {
  StudentManExamHeader,
  StudentManExamNavigationBar,
  StudentManQuestionPanel,
} from '../components/organisms';
import type { QuestionOption } from '../components/organisms';
const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
};

type ExamStatusFilter = 'all' | 'published' | 'draft';

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

  const { data: questionBankTags = [], isLoading: isTagsLoading } = useQuery({
    queryKey: ['question-bank-tags', 'create-exam-dialog'],
    queryFn: () => questionBankService.listTags(),
    enabled: open,
    staleTime: 60_000,
  });

  const handleAddTag = (rawTag?: string) => {
    const t = (rawTag ?? tagInput).trim();
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
            <label className="block text-xs font-medium text-on-surface mb-1">
              Question Bank Tags
            </label>
            <Combobox
              value={tagInput}
              onChange={setTagInput}
              onSelect={handleAddTag}
              options={questionBankTags.map((tag) => ({ value: tag, label: tag }))}
              className="w-full"
              placeholder={isTagsLoading ? 'Loading tags…' : 'Select or type tag and press Enter'}
              noOptionsText="No matching tag"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Selected tags control which question-bank questions are eligible for this exam.
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
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
  examId: string;
  title: string;
  durationSeconds: number;
  questionCount: number;
  totalPoints: number;
  tags?: string[];
  status?: string;
  onPreview: () => void;
  onManageQuestions: (examId: string) => void;
  isUpdatingQuestions: boolean;
  onExport: () => void;
  isExporting: boolean;
  onDelete: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({
  examId,
  title,
  durationSeconds,
  questionCount,
  totalPoints,
  tags,
  status,
  onPreview,
  onManageQuestions,
  isUpdatingQuestions,
  onExport,
  isExporting,
  onDelete,
}) => (
  <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary-300 min-h-[200px]">
    {/* Left accent bar */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-l-2xl" />

    <div className="flex flex-col flex-1 pl-5 pr-4 pt-4 pb-3">
      {/* Title */}
      <h3 className="font-semibold text-base text-gray-900 leading-snug line-clamp-2 mb-3">
        {title}
      </h3>

      {status && (
        <div className="mb-3">
          <span
            className={`inline-flex items-center text-[11px] font-semibold rounded px-1.5 h-[22px] ${status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
          >
            {status === 'ACTIVE' ? 'Published' : status}
          </span>
        </div>
      )}

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
    <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-2.5 flex-wrap">
      <button
        type="button"
        onClick={onPreview}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors duration-150"
      >
        <Eye size={13} />
        Preview
      </button>
      <button
        type="button"
        onClick={() => onManageQuestions(examId)}
        disabled={isUpdatingQuestions}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ListChecks size={13} />
        {isUpdatingQuestions ? 'Updating…' : 'Manage Questions'}
      </button>
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? 'Exporting…' : 'Export JSON'}
      </button>
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
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [manageTargetExam, setManageTargetExam] = useState<ExamDTO | null>(null);
  const [initialManagedQuestionIds, setInitialManagedQuestionIds] = useState<string[]>([]);
  const [isManageExamLoading, setIsManageExamLoading] = useState(false);
  const [examStatusFilter, setExamStatusFilter] = useState<ExamStatusFilter>('all');
  const [previewExamId, setPreviewExamId] = useState('');
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: exams, isLoading, refetch: refetchExams } = useQuery({
    queryKey: ['teacher-exams'],
    queryFn: () => examService.listAllExams(),
  });
  const { data: previewExam, isLoading: isPreviewLoading } = useExam(previewExamId);
  const createFromBank = useCreateExamFromBank();
  const deleteExam = useDeleteExam();
  const updateExamQuestions = useUpdateExamQuestionsFromBank();
  const importExamMutation = useMutation({
    mutationFn: (file: File) => examService.importFromJsonFile(file),
    onSuccess: () => {
      refetchExams();
      toast.success('Exam imported successfully.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import exam JSON file.');
    },
  });
  const exportExamMutation = useMutation({
    mutationFn: (examId: string) => examService.exportToJsonFile(examId),
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  const visibleExams = (exams ?? []).filter((exam) => {
    if (examStatusFilter === 'all') return true;
    const isPublished = exam.status === 'ACTIVE';
    return examStatusFilter === 'published' ? isPublished : !isPublished;
  });

  const publishedCount = (exams ?? []).filter((exam) => exam.status === 'ACTIVE').length;
  const draftCount = (exams ?? []).length - publishedCount;

  const previewQuestions = previewExam?.questions ?? [];
  const activePreviewQuestion = previewQuestions[previewQuestionIndex];
  const previewTotalQuestions = previewQuestions.length;

  const mapPreviewOptions = (options?: string[]): QuestionOption[] | undefined =>
    options?.map((text, index) => ({
      key: String.fromCharCode(65 + index),
      text,
    }));

  const handlePreviewClose = () => {
    setPreviewExamId('');
    setPreviewQuestionIndex(0);
  };

  const handleCreate = (cmd: CreateExamFromBankCommand) => {
    createFromBank.mutate(cmd, {
      onSuccess: () => {
        setDialogOpen(false);
        setSelectDialogOpen(false);
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

  const openManageQuestions = async (examId: string) => {
    try {
      setIsManageExamLoading(true);
      const exam = await examService.getExam(examId);
      setManageTargetExam(exam);
      const selectedIds = (exam.questions ?? [])
        .map((question) => question.bankItemId)
        .filter((id): id is string => Boolean(id));
      setInitialManagedQuestionIds(selectedIds);
      setManageDialogOpen(true);
      if (selectedIds.length === 0) {
        toast.info('No bank-linked questions found yet. Select questions to build this exam set.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load exam questions.';
      toast.error(message);
    } finally {
      setIsManageExamLoading(false);
    }
  };

  const handleSubmitManagedQuestions = (selectedQuestionIds: string[]) => {
    if (!manageTargetExam) return;
    updateExamQuestions.mutate(
      { examId: manageTargetExam.id, selectedQuestionIds },
      {
        onSuccess: () => {
          setManageDialogOpen(false);
          setManageTargetExam(null);
          setInitialManagedQuestionIds([]);
          refetchExams();
          toast.success('Exam questions updated successfully.');
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to update exam questions.');
        },
      },
    );
  };

  const handleImportFileChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importExamMutation.mutate(file);
    event.target.value = '';
  };

  const handleExportExam = async (examId: string, title: string) => {
    try {
      const blob = await exportExamMutation.mutateAsync(examId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      link.download = `${safeTitle || 'exam'}-${examId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export exam JSON file.';
      toast.error(message);
    }
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
          <div className="text-sm text-gray-500 mt-1">Exams in the system, including drafts and published exams</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={importFileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFileChange}
          />
          <Button
            variant="secondary"
            onClick={() => importFileInputRef.current?.click()}
            disabled={importExamMutation.isPending}
          >
            {importExamMutation.isPending ? 'Importing…' : 'Import Exam JSON'}
          </Button>
          <Button
            variant="secondary"
            icon={<ListChecks size={16} />}
            iconPlacement="left"
            onClick={() => setSelectDialogOpen(true)}
          >
            Select Questions
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            iconPlacement="left"
            onClick={() => setDialogOpen(true)}
          >
            Create Exam from Bank
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <div className="text-sm font-semibold text-gray-900">Filter exams</div>
          <div className="text-xs text-gray-500">
            Showing {visibleExams.length} of {(exams ?? []).length} exams
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: (exams ?? []).length },
            { key: 'published', label: 'Published', count: publishedCount },
            { key: 'draft', label: 'Draft', count: draftCount },
          ].map((option) => {
            const active = examStatusFilter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => setExamStatusFilter(option.key as ExamStatusFilter)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
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
          <div className="text-base font-semibold mb-2">No exams yet</div>
          <div className="text-sm">
            Create an exam from the question bank or publish a draft to get started.
          </div>
        </div>
      )}

      {!isLoading && exams && exams.length > 0 && visibleExams.length === 0 && (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-300 rounded-2xl">
          <div className="text-base font-semibold mb-2">
            No {examStatusFilter === 'published' ? 'published' : 'draft'} exams found
          </div>
          <div className="text-sm">
            Try a different filter to view the rest of your exam library.
          </div>
        </div>
      )}

      {!isLoading && exams && exams.length > 0 && visibleExams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {visibleExams.map((exam) => (
            <div key={exam.id}>
              <ExamCard
                examId={exam.id}
                title={exam.title}
                durationSeconds={exam.durationSeconds}
                questionCount={exam.questionCount}
                totalPoints={exam.totalPoints}
                tags={exam.tags}
                status={exam.status}
                onPreview={() => {
                  setPreviewQuestionIndex(0);
                  setPreviewExamId(exam.id);
                }}
                onManageQuestions={openManageQuestions}
                isUpdatingQuestions={updateExamQuestions.isPending || isManageExamLoading}
                onExport={() => handleExportExam(exam.id, exam.title)}
                isExporting={exportExamMutation.isPending}
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

      <SelectQuestionsFromBankDialog
        open={selectDialogOpen}
        onClose={() => setSelectDialogOpen(false)}
        onSubmit={handleCreate}
        isLoading={createFromBank.isPending}
      />

      <SelectQuestionsFromBankDialog
        open={manageDialogOpen}
        onClose={() => {
          if (updateExamQuestions.isPending) return;
          setManageDialogOpen(false);
          setManageTargetExam(null);
          setInitialManagedQuestionIds([]);
        }}
        mode="edit"
        initialTitle={manageTargetExam?.title}
        initialDurationMin={manageTargetExam ? Math.round(manageTargetExam.durationSeconds / 60) : 60}
        initialSelectedQuestionIds={initialManagedQuestionIds}
        onSubmitSelection={handleSubmitManagedQuestions}
        isLoading={updateExamQuestions.isPending}
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

      {previewExamId && (
        <AppDialog open onClose={handlePreviewClose} maxWidth="max-w-6xl">
          <DialogHeader>Exam Preview</DialogHeader>
          <DialogContent>
            <div className="mb-4 flex items-center justify-between gap-3 text-sm text-gray-500">
              <span>{previewExam?.title ?? 'Loading exam…'}</span>
              <span>
                {previewTotalQuestions > 0
                  ? `${previewQuestionIndex + 1} / ${previewTotalQuestions} questions`
                  : 'Previewing exam layout'}
              </span>
            </div>

            {isPreviewLoading ? (
              <Skeleton height={420} />
            ) : previewTotalQuestions === 0 || !activePreviewQuestion ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
                This exam does not contain previewable questions yet.
              </div>
            ) : (
              <div className="space-y-6">
                <StudentManExamHeader
                  currentQuestion={previewQuestionIndex + 1}
                  totalQuestions={previewTotalQuestions}
                  remainingSeconds={previewExam?.durationSeconds ?? 0}
                  isProctoringActive={false}
                  onSettings={() => {}}
                />
                <div className="max-h-[58vh] overflow-y-auto pr-2">
                  <div className="space-y-5 pb-2">
                    <div className="overflow-x-auto pb-1">
                      <StudentManQuestionPanel
                        questionNumber={activePreviewQuestion.questionNumber}
                        questionText={activePreviewQuestion.content}
                        questionStem={activePreviewQuestion.stem}
                        questionType={activePreviewQuestion.type}
                        options={mapPreviewOptions(activePreviewQuestion.options)}
                        questionParts={activePreviewQuestion.questionParts}
                        selectedAnswer=""
                        selectedAnswerParts={[]}
                        disabled
                        imageData={activePreviewQuestion.imageData}
                        onAnswerChange={() => {}}
                      />
                    </div>
                    <StudentManExamNavigationBar
                      canGoPrev={previewQuestionIndex > 0}
                      canGoNext={previewQuestionIndex < previewTotalQuestions - 1}
                      isLastQuestion={previewQuestionIndex === previewTotalQuestions - 1}
                      onPrevious={() =>
                        setPreviewQuestionIndex((index) => Math.max(0, index - 1))
                      }
                      onNext={() =>
                        setPreviewQuestionIndex((index) =>
                          Math.min(previewTotalQuestions - 1, index + 1),
                        )
                      }
                      onSubmit={handlePreviewClose}
                    />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="neutral" onClick={handlePreviewClose}>
              Close Preview
            </Button>
          </DialogFooter>
        </AppDialog>
      )}
    </TeacherManDashboardLayout>
  );
};

export default TeacherManDashboardPage;
