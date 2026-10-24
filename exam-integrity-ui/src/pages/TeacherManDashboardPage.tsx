/** Teacher dashboard: shows all teacher exams + create-from-bank dialog. */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Skeleton,
  Button,
  Input,
  EmptyState,
  ConfirmationDialog,
  ExamIntegrityTeacherDashboardTemplate as TeacherManDashboardLayout,
  ExamIntegrityQuestionPickerModal,
  ExamIntegrityExamCard,
  ExamIntegrityCreateExamDialog,
  ExamIntegrityExamFilterBar,
  ExamIntegrityExamPreviewModal,
  useTheme,
  type ExamIntegrityDashboardSection as DashboardSection,
} from '@hvantran/ui-component-library';
import {
  useExam,
  useCreateExamFromBank,
  useDeleteExam,
  useSyncExamQuestions,
  useUpdateExamQuestionsFromBank,
} from '../hooks/useExams';
import { examService } from '../services/examService';
import { questionBankService } from '../services/questionBankService';
import { useNavDockMode, TEACHER_NAV_DOCK_STORAGE_KEY } from '../hooks/useNavDockMode';
import { useAuth } from '../context/AuthContext';
import type { CreateExamFromBankCommand, ExamDTO, QuestionType } from '../types/exam.types';
import { ListChecks, Plus } from 'lucide-react';
const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
  settings: '/teacher/settings',
};

type ExamStatusFilter = 'all' | 'published' | 'draft';

// ── Page ─────────────────────────────────────────────────────────────────────

const TeacherManDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, displayName } = useAuth();
  const { theme, setTheme } = useTheme();
  const [dockMode, setDockMode] = useNavDockMode('pinned', TEACHER_NAV_DOCK_STORAGE_KEY);
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
  const [syncTarget, setSyncTarget] = useState<{
    id: string;
    title: string;
    linkedCount?: number;
  } | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: exams,
    isLoading,
    refetch: refetchExams,
  } = useQuery({
    queryKey: ['teacher-exams'],
    queryFn: () => examService.listAllExams(),
  });
  const { data: questionBankTags = [], isLoading: isTagsLoading } = useQuery({
    queryKey: ['question-bank-tags', 'create-exam-dialog'],
    queryFn: () => questionBankService.listTags(),
    enabled: dialogOpen,
    staleTime: 60_000,
  });
  const { data: previewExam, isLoading: isPreviewLoading } = useExam(previewExamId);
  const createFromBank = useCreateExamFromBank();
  const deleteExam = useDeleteExam();
  const updateExamQuestions = useUpdateExamQuestionsFromBank();
  const syncExamQuestions = useSyncExamQuestions();
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
  };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  const visibleExams = (exams ?? []).filter((exam) => {
    if (examStatusFilter === 'all') return true;
    const isPublished = exam.status === 'ACTIVE';
    return examStatusFilter === 'published' ? isPublished : !isPublished;
  });

  const publishedCount = (exams ?? []).filter((exam) => exam.status === 'ACTIVE').length;
  const draftCount = (exams ?? []).length - publishedCount;

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

  const handleOpenSyncDialog = async (examId: string, title: string) => {
    try {
      const exam = await examService.getExam(examId);
      const linkedCount = (exam.questions ?? []).filter((q) => Boolean(q.bankItemId)).length;
      if (linkedCount === 0) {
        toast.info(`"${title}" has no questions linked to the question bank.`);
        return;
      }
      setSyncTarget({ id: examId, title, linkedCount });
    } catch {
      setSyncTarget({ id: examId, title });
    }
  };

  const handleConfirmSync = () => {
    if (!syncTarget) return;
    syncExamQuestions.mutate(syncTarget.id, {
      onSuccess: (data) => {
        setSyncTarget(null);
        refetchExams();
        toast.success(
          `Successfully synced ${data.syncedCount} question(s) from question bank for "${syncTarget.title}".`,
        );
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to sync questions from question bank.');
      },
    });
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
      userName={displayName}
      themeMode={theme}
      onThemeModeChange={setTheme}
      onNavigate={handleNavigate}
      onCreateExam={() => setDialogOpen(true)}
      onLogout={handleLogout}
      dockMode={dockMode}
      onDockModeChange={setDockMode}
      headerTitle="Dashboard"
      headerSubtitle="Exams in the system, including drafts and published exams"
      headerActionsSlot={
        <>
          <Input
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
        </>
      }
      filtersSlot={
        <ExamIntegrityExamFilterBar
          title="Filter exams"
          subtitle={`Showing ${visibleExams.length} of ${(exams ?? []).length} exams`}
          selectedKey={examStatusFilter}
          onSelectKey={(k) => setExamStatusFilter(k as ExamStatusFilter)}
          options={[
            { key: 'all', label: 'All', count: (exams ?? []).length },
            { key: 'published', label: 'Published', count: publishedCount },
            { key: 'draft', label: 'Draft', count: draftCount },
          ]}
        />
      }
      syncDialogState={
        syncTarget
          ? {
              examId: syncTarget.id,
              examTitle: syncTarget.title,
              linkedQuestionCount: syncTarget.linkedCount,
            }
          : null
      }
      onConfirmSync={handleConfirmSync}
      onCancelSync={() => setSyncTarget(null)}
      isSyncingQuestions={syncExamQuestions.isPending}
      gridSlot={
        isLoading
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} height={220} />)
          : exams && exams.length > 0 && visibleExams.length > 0
            ? visibleExams.map((exam) => (
                <ExamIntegrityExamCard
                  key={exam.id}
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
                  onSyncQuestions={handleOpenSyncDialog}
                  isSyncingQuestions={syncExamQuestions.isPending && syncTarget?.id === exam.id}
                  onExport={() => handleExportExam(exam.id, exam.title)}
                  isExporting={exportExamMutation.isPending}
                  onDelete={() => setDeleteTarget({ id: exam.id, title: exam.title })}
                />
              ))
            : null
      }
    >
      {/* Empty States */}
      {!isLoading && (!exams || exams.length === 0) && (
        <EmptyState
          title="No exams yet"
          description="Create an exam from the question bank or publish a draft to get started."
        />
      )}

      {!isLoading && exams && exams.length > 0 && visibleExams.length === 0 && (
        <EmptyState
          title={`No ${examStatusFilter === 'published' ? 'published' : 'draft'} exams found`}
          description="Try a different filter to view the rest of your exam library."
        />
      )}

      <ExamIntegrityCreateExamDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        isLoading={createFromBank.isPending}
        availableTags={questionBankTags}
        isTagsLoading={isTagsLoading}
      />

      <ExamIntegrityQuestionPickerModal
        open={selectDialogOpen}
        onClose={() => setSelectDialogOpen(false)}
        onSubmit={(result) =>
          handleCreate({
            title: result.title,
            durationSeconds:
              result.durationSeconds ?? (result.durationMin ? result.durationMin * 60 : 3600),
            mcqCount: result.mcqCount ?? 0,
            essayShortCount: result.essayShortCount ?? 0,
            essayLongCount: result.essayLongCount ?? 0,
            selectedQuestionIds: result.selectedQuestionIds,
          })
        }
        isLoading={createFromBank.isPending}
        onSearchQuestions={(params) =>
          questionBankService.search({
            ...params,
            type: params.type as QuestionType | undefined,
          })
        }
        onFetchByIds={(ids) => questionBankService.fetchByIds(ids)}
      />

      <ExamIntegrityQuestionPickerModal
        open={manageDialogOpen}
        onClose={() => {
          if (updateExamQuestions.isPending) return;
          setManageDialogOpen(false);
          setManageTargetExam(null);
          setInitialManagedQuestionIds([]);
        }}
        mode="edit"
        initialTitle={manageTargetExam?.title}
        initialDurationMin={
          manageTargetExam ? Math.round(manageTargetExam.durationSeconds / 60) : 60
        }
        initialSelectedQuestionIds={initialManagedQuestionIds}
        onSubmitSelection={handleSubmitManagedQuestions}
        isLoading={updateExamQuestions.isPending}
        onSearchQuestions={(params) =>
          questionBankService.search({
            ...params,
            type: params.type as QuestionType | undefined,
          })
        }
        onFetchByIds={(ids) => questionBankService.fetchByIds(ids)}
      />

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete Exam"
        content={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? Questions in the question bank will not be affected.`
            : undefined
        }
        positiveText={deleteExam.isPending ? 'Deleting…' : 'Delete'}
        positiveVariant="danger"
        positiveAction={handleDeleteConfirm}
        negativeText="Cancel"
        negativeAction={() => {
          if (!deleteExam.isPending) setDeleteTarget(null);
        }}
        onClose={() => {
          if (!deleteExam.isPending) setDeleteTarget(null);
        }}
        loading={deleteExam.isPending}
      />

      {/* Exam Preview Modal */}
      <ExamIntegrityExamPreviewModal
        open={Boolean(previewExamId)}
        onClose={handlePreviewClose}
        examTitle={previewExam?.title ?? 'Exam Preview'}
        durationSeconds={previewExam?.durationSeconds ?? 0}
        questions={previewExam?.questions}
        isLoading={isPreviewLoading}
      />
    </TeacherManDashboardLayout>
  );
};

export default TeacherManDashboardPage;
