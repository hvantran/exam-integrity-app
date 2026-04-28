/** FE-23: draftRepository — optional local cache for draft state (localStorage) */
import type { DraftQuestionDTO, ExamDraftSummaryDTO } from '../types/exam.types';

const KEY_PREFIX = 'exam_draft_';

export const draftRepository = {
  saveDraftCache: (draftId: string, questions: DraftQuestionDTO[]): void => {
    try {
      localStorage.setItem(`${KEY_PREFIX}${draftId}`, JSON.stringify(questions));
    } catch {
      // Ignore storage errors (private browsing, full quota)
    }
  },
  getDraftCache: (draftId: string): DraftQuestionDTO[] | null => {
    try {
      const raw = localStorage.getItem(`${KEY_PREFIX}${draftId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clearDraftCache: (draftId: string): void => {
    localStorage.removeItem(`${KEY_PREFIX}${draftId}`);
  },
};
