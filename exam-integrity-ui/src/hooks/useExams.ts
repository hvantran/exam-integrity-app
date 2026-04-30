/** FE-08 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '../services/examService';
import type { CreateExamFromBankCommand } from '../types/exam.types';

export function useExamList(tags?: string[]) {
  return useQuery({
    queryKey: ['exams', tags],
    queryFn: () => examService.listExams(tags),
  });
}

export function useExam(examId: string) {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getExam(examId),
    enabled: !!examId,
  });
}

export function useCreateExamFromBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cmd: CreateExamFromBankCommand) => examService.createFromBank(cmd),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); },
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => examService.deleteExam(examId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); },
  });
}

export function useTagList() {
  return useQuery({
    queryKey: ['exam-tags'],
    queryFn: () => examService.listTags(),
  });
}
