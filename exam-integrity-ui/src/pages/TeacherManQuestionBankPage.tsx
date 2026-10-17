/** FE-19: Teacher question bank page — Stitch "Question Bank Explorer" design */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ExamIntegrityTeacherQuestionBankTemplate as TeacherManQuestionBankLayout,
  ExamIntegrityQuestionBankFilterBar,
  ExamIntegrityQuestionBankActionBar,
  ExamIntegrityQuestionBankCard,
  ExamIntegrityQuestionBankEditCard,
  ExamIntegrityQuestionBankListLoader,
  ExamIntegrityQuestionBankEndMessage,
  ExamIntegrityAddQuestionDialog,
  ExamIntegrityDeleteAllQuestionsDialog,
  ExamIntegrityQuestionBankPreviewModal,
  ScrollArea,
  type QuestionOption,
  type ExamIntegrityDashboardSection as DashboardSection,
  type ExamIntegrityQuestionBankEditFormState,
} from '@hvantran/ui-component-library';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionBankService } from '../services/questionBankService';
import type { DraftQuestionDTO, QuestionPart, QuestionType } from '../types/exam.types';
import type { DraftQuestionEditCommand } from '../types/exam.types';
import { useAuth } from '../context/AuthContext';
import { useNavDockMode, TEACHER_NAV_DOCK_STORAGE_KEY } from '../hooks/useNavDockMode';

const SECTION_ROUTES: Record<DashboardSection, string> = {
  dashboard: '/teacher/dashboard',
  ingestion: '/teacher/ingestion',
  review: '/teacher/ingestion',
  scoring: '/teacher/scoring',
  'question-bank': '/teacher/question-bank',
  reports: '/teacher/ingestion',
  settings: '/teacher/settings',
};

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'MCQ', label: 'MCQ' },
  { value: 'ESSAY_SHORT', label: 'Essay (Short)' },
  { value: 'ESSAY_LONG', label: 'Essay (Long)' },
];

const DEFAULT_POINTS_BY_TYPE: Record<QuestionType, number> = {
  MCQ: 0.5,
  ESSAY_SHORT: 1,
  ESSAY_LONG: 2,
};

export const extractOptionParts = (raw: string): { text: string; imageBase64?: string } => {
  if (!raw) return { text: '' };
  const imgIdx = raw.indexOf('data:image/');
  if (imgIdx === -1) {
    return { text: stripOptionPrefix(raw) };
  }
  const textPart = raw.substring(0, imgIdx).trim();
  const imagePart = raw.substring(imgIdx).trim();
  return {
    text: stripOptionPrefix(textPart),
    imageBase64: imagePart || undefined,
  };
};

export const serializeOption = (text: string, imageBase64?: string): string => {
  const cleanText = text.trim();
  if (cleanText && imageBase64) {
    return `${cleanText} ${imageBase64}`;
  }
  if (imageBase64) {
    return imageBase64;
  }
  return cleanText;
};

const toEditForm = (q: DraftQuestionDTO): ExamIntegrityQuestionBankEditFormState => {
  const parsed = (q.options && q.options.length > 0 ? q.options : ['', '', '', '']).map(extractOptionParts);
  const options = [...parsed.map((p) => p.text), '', '', '', ''].slice(0, 4);
  const optionImages = [...parsed.map((p) => p.imageBase64), undefined, undefined, undefined, undefined].slice(0, 4);

  return {
    content: q.content,
    type: q.type ?? 'MCQ',
    difficulty: 'Medium',
    options,
    optionImages,
    correctAnswer: resolveMcqCorrectAnswerLabel(q.correctAnswer, q.options ?? []),
    points: q.points ?? DEFAULT_POINTS_BY_TYPE[q.type ?? 'MCQ'],
    tags: q.rubric?.keywords?.join(', ') ?? '',
    imageData: q.imageData ?? '',
  };
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const stripOptionPrefix = (text: string): string => text.replace(/^[A-Da-d][./、]\s*/u, '').trim();

const resolveMcqCorrectAnswerLabel = (
  correctAnswer: string | undefined,
  options: string[] = [],
): string => {
  if (!correctAnswer || !correctAnswer.trim()) {
    return 'A';
  }

  const normalized = correctAnswer.trim();
  const labelOnlyMatch = normalized.match(/^([A-D])$/i);
  if (labelOnlyMatch) {
    return labelOnlyMatch[1].toUpperCase();
  }

  const prefixedMatch = normalized.match(/^([A-D])[./、:\-)]\s*/iu);
  if (prefixedMatch) {
    return prefixedMatch[1].toUpperCase();
  }

  const strippedAnswer = stripOptionPrefix(normalized);
  const foundIndex = options.findIndex((optionText) => stripOptionPrefix(optionText) === strippedAnswer);
  if (foundIndex >= 0 && foundIndex < OPTION_LABELS.length) {
    return OPTION_LABELS[foundIndex];
  }

  return 'A';
};

interface PreviewQuestionPayload {
  questionText: string;
  questionStem?: string;
  questionParts?: QuestionPart[];
}

const derivePreviewQuestionPayload = (question: DraftQuestionDTO): PreviewQuestionPayload => {
  const sourceText = (question.rawText?.trim() || question.content).trim();

  return {
    questionText: sourceText,
    questionStem: question.stem,
    questionParts: question.questionParts,
  };
};

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
const QuestionBankPage: React.FC = () => {
  const [dockMode, setDockMode] = useNavDockMode('pinned', TEACHER_NAV_DOCK_STORAGE_KEY);
  const [q, setQ] = useState('');
  const [type, setType] = useState<QuestionType | ''>('');
  const [tagInput, setTagInput] = useState('');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewAnswerMap, setPreviewAnswerMap] = useState<Record<string, string>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { logout, displayName } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
  };
  const handleNavigate = (section: DashboardSection) => navigate(SECTION_ROUTES[section]);

  React.useEffect(() => {
    setPage(1);
  }, [q, type, tagFilters]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['question-bank', q, type, tagFilters, page],
    queryFn: () =>
      questionBankService.search({
        q: q || undefined,
        type: type || undefined,
        tags: tagFilters.length ? tagFilters : undefined,
        page: 0,
        size: page * PAGE_SIZE,
      }),
    placeholderData: (prev) => prev,
  });

  const { data: availableTags = [], isLoading: isTagsLoading } = useQuery({
    queryKey: ['question-bank-tags'],
    queryFn: () => questionBankService.listTags(),
    staleTime: 60_000,
  });

  const hasMore = (data?.content.length ?? 0) < (data?.totalElements ?? 0);
  const isLoadingMore = isFetching && !isLoading;
  const sortedQuestions = data?.content ?? [];

  const {
    data: previewData,
    isLoading: isPreviewLoading,
    isFetching: isPreviewFetching,
  } = useQuery({
    queryKey: ['question-bank-preview', q, type, tagFilters, previewPage],
    queryFn: () =>
      questionBankService.search({
        q: q || undefined,
        type: type || undefined,
        tags: tagFilters.length ? tagFilters : undefined,
        page: 0,
        size: previewPage * PAGE_SIZE,
      }),
    enabled: previewOpen,
    placeholderData: (prev) => prev,
  });

  const hasPreviewMore = (previewData?.content.length ?? 0) < (previewData?.totalElements ?? 0);
  const isPreviewLoadingMore = isPreviewFetching && !isPreviewLoading;
  const sortedPreviewQuestions = previewData?.content ?? [];

  const mapPreviewOptions = (options?: string[]): QuestionOption[] | undefined =>
    options?.map((raw, i) => {
      const parsed = extractOptionParts(raw);
      return {
        key: String.fromCharCode(65 + i),
        text: parsed.text,
        imageBase64: parsed.imageBase64,
      };
    });

  const previewItems = sortedPreviewQuestions.map((question, idx) => {
    const previewPayload = derivePreviewQuestionPayload(question);
    return {
      id: question.id,
      questionNumber: question.questionNumber || idx + 1,
      questionText: previewPayload.questionText,
      questionStem: previewPayload.questionStem,
      questionType: question.type ?? 'MCQ',
      options: mapPreviewOptions(question.options),
      questionParts: previewPayload.questionParts,
      imageData: question.imageData,
    };
  });

  const { mutate: updateQuestion, isPending: isSaving } = useMutation({
    mutationFn: ({ id, cmd }: { id: string; cmd: DraftQuestionEditCommand }) =>
      questionBankService.update(id, cmd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      setEditingId(null);
      toast.success('Question updated successfully.');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update question.'),
  });

  const { mutate: addQuestion, isPending: isAdding } = useMutation({
    mutationFn: (cmd: DraftQuestionEditCommand) => questionBankService.addQuestion(cmd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      setAddOpen(false);
      setAddError(null);
      toast.success('Question added successfully.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const message = msg ?? 'Failed to add question. It may already exist in the bank.';
      setAddError(message);
      toast.error(message);
    },
  });

  const handleSaveEdit = (id: string, form: ExamIntegrityQuestionBankEditFormState) => {
    const tagList = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const normalizedCorrectAnswer = resolveMcqCorrectAnswerLabel(form.correctAnswer, form.options);
    const serializedOptions = form.options.map((optText, idx) =>
      serializeOption(optText, form.optionImages[idx]),
    );

    updateQuestion({
      id,
      cmd: {
        content: form.content,
        type: form.type as QuestionType,
        points: form.points,
        options: form.type === 'MCQ' ? serializedOptions : undefined,
        correctAnswer: form.type === 'MCQ' ? normalizedCorrectAnswer : undefined,
        rubric: tagList.length ? { keywords: tagList } : undefined,
        imageData: form.imageData || undefined,
      },
    });
  };

  const handleAddSubmit = (form: ExamIntegrityQuestionBankEditFormState) => {
    setAddError(null);
    const tagList = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const normalizedCorrectAnswer = resolveMcqCorrectAnswerLabel(form.correctAnswer, form.options);
    const serializedOptions = form.options.map((optText, idx) =>
      serializeOption(optText, form.optionImages[idx]),
    );

    addQuestion({
      content: form.content,
      type: form.type as QuestionType,
      points: form.points,
      options: form.type === 'MCQ' ? serializedOptions : undefined,
      correctAnswer: form.type === 'MCQ' ? normalizedCorrectAnswer : undefined,
      rubric: tagList.length ? { keywords: tagList } : undefined,
      imageData: form.imageData || undefined,
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
      toast.success('All questions deleted successfully.');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete all questions.'),
  });

  const addTagFilter = (rawTag?: string) => {
    const tag = (rawTag ?? tagInput).trim();
    if (tag && !tagFilters.includes(tag)) setTagFilters((prev) => [...prev, tag]);
    setTagInput('');
  };

  const removeTagFilter = (tag: string) => setTagFilters((prev) => prev.filter((t) => t !== tag));

  return (
    <>
      <TeacherManQuestionBankLayout
        userName={displayName}
        isLoading={isLoading}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        dockMode={dockMode}
        onDockModeChange={setDockMode}
        filterBar={
          <ExamIntegrityQuestionBankFilterBar
            searchQuery={q}
            onSearchChange={setQ}
            typeFilter={type}
            onTypeChange={(val) => setType(val as QuestionType | '')}
            typeOptions={TYPE_OPTIONS}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            availableTags={availableTags}
            isTagsLoading={isTagsLoading}
            selectedTags={tagFilters}
            onAddTag={addTagFilter}
            onRemoveTag={removeTagFilter}
          />
        }
        resultsBar={
          <ExamIntegrityQuestionBankActionBar
            totalCount={data?.totalElements ?? 0}
            onPreview={() => {
              setPreviewAnswerMap({});
              setPreviewPage(1);
              setPreviewOpen(true);
            }}
            onAddQuestion={() => {
              setAddOpen(true);
              setAddError(null);
            }}
            onDeleteAll={() => setDeleteAllOpen(true)}
          />
        }
      >
        <ScrollArea
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={() => setPage((p) => p + 1)}
          loader={<ExamIntegrityQuestionBankListLoader />}
          endMessage={(data?.totalElements ?? 0) > 0 ? <ExamIntegrityQuestionBankEndMessage /> : null}
        >
          {sortedQuestions.map((item, i) =>
            editingId === item.id ? (
              <ExamIntegrityQuestionBankEditCard
                key={item.id}
                idPrefix={`edit-${item.id}`}
                initialValues={toEditForm(item)}
                isSaving={isSaving}
                onSave={(formValues) => handleSaveEdit(item.id, formValues)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <ExamIntegrityQuestionBankCard
                key={item.id}
                index={i}
                content={item.content}
                type={item.type}
                points={item.points}
                tags={item.rubric?.keywords}
                onEdit={() => setEditingId(item.id)}
              />
            ),
          )}
        </ScrollArea>
      </TeacherManQuestionBankLayout>

      <ExamIntegrityAddQuestionDialog
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAddError(null);
        }}
        onSubmit={handleAddSubmit}
        isSubmitting={isAdding}
        error={addError}
      />

      <ExamIntegrityQuestionBankPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        questions={previewItems}
        totalElements={previewData?.totalElements ?? 0}
        isLoading={isPreviewLoading}
        isLoadingMore={isPreviewLoadingMore}
        hasMore={hasPreviewMore}
        onLoadMore={() => setPreviewPage((p) => p + 1)}
        selectedAnswers={previewAnswerMap}
        onAnswerChange={(questionId, answer) =>
          setPreviewAnswerMap((prev) => ({ ...prev, [questionId]: answer }))
        }
      />

      <ExamIntegrityDeleteAllQuestionsDialog
        isOpen={deleteAllOpen}
        onClose={() => setDeleteAllOpen(false)}
        onConfirm={() => deleteAllQuestions()}
        isDeleting={isDeleting}
        totalCount={data?.totalElements ?? 0}
      />
    </>
  );
};

export default QuestionBankPage;
