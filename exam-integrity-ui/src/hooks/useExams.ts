/** FE-08 */
import { useQuery } from '@tanstack/react-query';
import { examService } from '../services/examService';

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
