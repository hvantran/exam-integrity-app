import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '../services/sessionService';
import type { TeacherScoreUpdatePayload } from '../types/exam.types';

export function useReviewDashboard(sessionId: string) {
  return useQuery({
    queryKey: ['review', sessionId],
    queryFn: () => sessionService.getReviewDashboard(sessionId),
    enabled: !!sessionId,
  });
}

export function useStudentResults(studentId: string) {
  return useQuery({
    queryKey: ['student-results', studentId],
    queryFn: () => sessionService.getStudentResults(studentId),
    enabled: !!studentId,
    refetchOnMount: 'always',
  });
}

export function useTeacherScoringQueue() {
  return useQuery({
    queryKey: ['teacher-scoring'],
    queryFn: () => sessionService.getTeacherScoringQueue(),
  });
}

export function useTeacherScore(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; payload: TeacherScoreUpdatePayload }) =>
      sessionService.updateTeacherScore(sessionId, questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-scoring'] });
      queryClient.invalidateQueries({ queryKey: ['student-results'] });
    },
  });
}
