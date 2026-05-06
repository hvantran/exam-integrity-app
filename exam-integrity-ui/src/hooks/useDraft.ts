/** FE-09 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { draftService } from '../services/draftService';
import type {
  DraftQuestionDTO,
  DraftQuestionEditCommand,
  ExamDraftPublishCommand,
} from '../types/exam.types';

export function useDraftList(status?: string) {
  return useQuery({
    queryKey: ['drafts', status],
    queryFn: () => draftService.listDrafts(status),
  });
}

export function useDraft(draftId: string) {
  return useQuery({
    queryKey: ['draft', draftId],
    queryFn: () => draftService.getDraft(draftId),
    enabled: !!draftId,
  });
}

export function useEditQuestion(draftId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, cmd }: { questionId: string; cmd: DraftQuestionEditCommand }) =>
      draftService.editQuestion(draftId, questionId, cmd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['draft', draftId] }),
  });
}

export function useRemoveQuestion(draftId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => draftService.removeQuestion(draftId, questionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['draft', draftId] }),
  });
}

export function useAddQuestion(draftId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      question,
      position,
    }: {
      question: Partial<DraftQuestionDTO>;
      position?: number;
    }) => draftService.addQuestion(draftId, question, position),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['draft', draftId] }),
  });
}

export function usePublishDraft(draftId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cmd: ExamDraftPublishCommand) => draftService.publishDraft(draftId, cmd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['draft', draftId] });
      qc.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}
