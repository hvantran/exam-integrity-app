/**
 * SelectQuestionsFromBankDialog
 *
 * Teacher-facing dialog for building an exam by explicitly picking questions
 * from the question bank via text search and type filter.
 * Questions load via explicit page navigation (Previous/Next).
 * Passes selectedQuestionIds to the existing createFromBank endpoint.
 */
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, X as XIcon } from "lucide-react";
import AppDialog, { DialogContent, DialogFooter, DialogHeader } from './AppDialog';
import { Button } from "../atoms";
import { questionBankService } from "../../services/questionBankService";
import type { CreateExamFromBankCommand, DraftQuestionDTO, QuestionType } from "../../types/exam.types";

const TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "MCQ",
  ESSAY_SHORT: "Essay Short",
  ESSAY_LONG: "Essay Long",
};

const TYPE_BADGE: Record<QuestionType, string> = {
  MCQ: "bg-blue-50 text-blue-700",
  ESSAY_SHORT: "bg-violet-50 text-violet-700",
  ESSAY_LONG: "bg-amber-50 text-amber-700",
};

export interface SelectQuestionsFromBankDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (cmd: CreateExamFromBankCommand) => void;
  onSubmitSelection?: (selectedQuestionIds: string[]) => void;
  mode?: 'create' | 'edit';
  initialTitle?: string;
  initialDurationMin?: number;
  initialSelectedQuestionIds?: string[];
  isLoading: boolean;
}

const PAGE_SIZE = 30;

const SelectQuestionsFromBankDialog: React.FC<SelectQuestionsFromBankDialogProps> = ({
  open,
  onClose,
  onSubmit,
  onSubmitSelection,
  mode = 'create',
  initialTitle,
  initialDurationMin,
  initialSelectedQuestionIds,
  isLoading,
}) => {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [durationMin, setDurationMin] = useState(initialDurationMin ?? 60);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "">("");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle ?? "");
    setDurationMin(initialDurationMin ?? 60);
    setSelectedIds(new Set(initialSelectedQuestionIds ?? []));
    setSearchText("");
    setDebouncedSearch("");
    setTypeFilter("");
    setPage(0);
    setShowSelectedOnly(false);
  }, [open, initialTitle, initialDurationMin, initialSelectedQuestionIds]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(id);
  }, [searchText]);

  // Reset to first page whenever the filter changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, typeFilter]);

  const { data, isLoading: isSearching } = useQuery({
    queryKey: ["question-bank-picker", debouncedSearch, typeFilter, page],
    queryFn: () =>
      questionBankService.search({
        q: debouncedSearch || undefined,
        type: (typeFilter as QuestionType) || undefined,
        page,
        size: PAGE_SIZE,
      }),
    enabled: open,
    staleTime: 30_000,
  });

  // Fetch selected questions by ID when the selected-only view is active
  const selectedIdsArray = Array.from(selectedIds);
  const { data: selectedQuestions, isLoading: isLoadingSelected } = useQuery({
    queryKey: ["question-bank-by-ids", selectedIdsArray],
    queryFn: () => questionBankService.fetchByIds(selectedIdsArray),
    enabled: open && showSelectedOnly && selectedIds.size > 0,
    staleTime: 60_000,
  });

  const displayedQuestions = showSelectedOnly ? (selectedQuestions ?? []) : (data?.content ?? []);
  const totalElements = showSelectedOnly ? displayedQuestions.length : (data?.totalElements ?? 0);
  const totalPages = showSelectedOnly ? 1 : Math.max(1, data?.totalPages ?? 1);
  const canPrev = !showSelectedOnly && page > 0;
  const canNext = !showSelectedOnly && page < totalPages - 1;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedIds.size === 0) return;

    const selectedQuestionIds = Array.from(selectedIds);

    if (isEditMode) {
      onSubmitSelection?.(selectedQuestionIds);
      return;
    }

    if (!title.trim()) return;
    onSubmit?.({
      title: title.trim(),
      durationSeconds: durationMin * 60,
      mcqCount: 0,
      essayShortCount: 0,
      essayLongCount: 0,
      selectedQuestionIds,
    });
  };

  const handleClose = () => {
    if (isLoading) return;
    setTitle("");
    setDurationMin(60);
    setSearchText("");
    setDebouncedSearch("");
    setTypeFilter("");
    setPage(0);
    setSelectedIds(new Set());
    setShowSelectedOnly(false);
    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      disableClose={isLoading}
      closeOnBackdrop={false}
      maxWidth="max-w-3xl"
    >
      <DialogHeader>{isEditMode ? 'Manage Exam Questions' : 'Select Questions from Bank'}</DialogHeader>

      <DialogContent>
        {/* Exam metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-on-surface mb-1">Exam Name</label>
            <input
              className="w-full border border-outline rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter exam title"
              required
              disabled={isEditMode}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Duration (min)
            </label>
            <input
              type="number"
              min={1}
              className="w-full border border-outline rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={durationMin}
              onChange={(e) => setDurationMin(Math.max(1, Number(e.target.value)))}
              disabled={isEditMode}
            />
          </div>
        </div>

        {/* Search + type filter */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              className="w-full border border-gray-300 rounded pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Filter questions by text…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <XIcon size={13} />
              </button>
            )}
          </div>
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as QuestionType | "")}
          >
            <option value="">All types</option>
            <option value="MCQ">MCQ</option>
            <option value="ESSAY_SHORT">Essay Short</option>
            <option value="ESSAY_LONG">Essay Long</option>
          </select>
        </div>

        {/* Question list */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* List header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>
              {totalElements} question{totalElements !== 1 ? "s" : ""} found
            </span>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setShowSelectedOnly((v) => !v)}
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                  showSelectedOnly
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
                title={showSelectedOnly ? 'Show all questions' : 'Show selected questions only'}
              >
                {selectedIds.size} selected
                {showSelectedOnly && (
                  <XIcon size={10} className="ml-0.5" />
                )}
              </button>
            )}
          </div>

          {/* Scrollable rows */}
          <div className="overflow-y-auto max-h-64">
            {(isSearching && !showSelectedOnly) || (showSelectedOnly && isLoadingSelected) ? (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                Loading…
              </div>
            ) : null}

            {!isSearching && !isLoadingSelected && displayedQuestions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm gap-1">
                <BookOpen size={20} />
                <span>No questions match your filter</span>
              </div>
            )}

            {!isLoadingSelected && displayedQuestions.length > 0 && (
              <>
                {displayedQuestions.map((q) => {
                  const selected = selectedIds.has(q.id);
                  const typeLabel = q.type ? TYPE_LABELS[q.type] : "—";
                  const typeBadge = q.type ? TYPE_BADGE[q.type] : "bg-gray-100 text-gray-500";
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => toggleSelection(q.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 text-left transition-colors duration-100 ${
                        selected ? "bg-primary-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 transition-colors flex items-center justify-center ${
                          selected
                            ? "bg-primary-600 border-primary-600"
                            : "bg-white border-gray-400"
                        }`}
                      >
                        {selected && (
                          <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                            <path
                              d="M1 4l2.5 2.5L9 1"
                              stroke="white"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${typeBadge}`}
                          >
                            {typeLabel}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {q.points} pt{q.points !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2 leading-snug">
                          {q.stem ?? q.content}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {!showSelectedOnly && (
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Page {page + 1} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="neutral"
                        disabled={!canPrev || isSearching}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="neutral"
                        disabled={!canNext || isSearching}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>

      <DialogFooter>
        <Button type="button" variant="neutral" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading || (!isEditMode && !title.trim()) || selectedIds.size === 0}
        >
          {isLoading
            ? isEditMode
              ? "Updating…"
              : "Creating…"
            : isEditMode
              ? `Update Questions (${selectedIds.size} selected)`
              : `Create Exam (${selectedIds.size} question${selectedIds.size !== 1 ? "s" : ""})`}
        </Button>
      </DialogFooter>
    </AppDialog>
  );
};

export default SelectQuestionsFromBankDialog;
