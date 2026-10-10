/** FE-23: draftRepository — optional local cache for draft state (localStorage) */
import type { DraftQuestionDTO } from '../types/exam.types';
import { getScopedItem, setScopedItem, removeScopedItem } from '../utils/storage';

export const draftRepository = {
  saveDraftCache: (draftId: string, questions: DraftQuestionDTO[], userId?: string | null): void => {
    try {
      setScopedItem(`draft_${draftId}`, JSON.stringify(questions), userId);
    } catch {
      // Ignore storage errors (private browsing, full quota)
    }
  },
  getDraftCache: (draftId: string, userId?: string | null): DraftQuestionDTO[] | null => {
    try {
      const raw = getScopedItem(`draft_${draftId}`, userId);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clearDraftCache: (draftId: string, userId?: string | null): void => {
    removeScopedItem(`draft_${draftId}`, userId);
  },
};
