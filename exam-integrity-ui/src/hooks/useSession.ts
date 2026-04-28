/** FE-10 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import type { AnswerPayload } from '../types/exam.types';

export function useCreateSession() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ examId, studentId }: { examId: string; studentId: string }) =>
      sessionService.createSession(examId, studentId),
    onSuccess: (data) => navigate(`/exam/${data.sessionId}`),
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionService.getSession(sessionId),
    enabled: !!sessionId,
    refetchInterval: 30_000,
  });
}

export function useQuestion(sessionId: string, questionNumber: number) {
  return useQuery({
    queryKey: ['session', sessionId, 'question', questionNumber],
    queryFn: () => sessionService.getQuestion(sessionId, questionNumber),
    enabled: !!sessionId && questionNumber > 0,
  });
}

export function useSaveAnswer(sessionId: string) {
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; payload: AnswerPayload }) =>
      sessionService.saveAnswer(sessionId, questionId, payload),
  });
}

export function useSubmitExam(sessionId: string) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => sessionService.submitExam(sessionId),
    onSuccess: () => navigate(`/review/${sessionId}`),
  });
}
