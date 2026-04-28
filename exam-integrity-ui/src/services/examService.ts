/** FE-03: examService — list and get exams */
import apiClient from './apiClient';
import type { ExamDTO } from '../types/exam.types';

const API = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8090/exam-integrity-backend';

export const examService = {
  listExams: (tags?: string[]): Promise<ExamDTO[]> => {
    const params = tags?.length ? { params: new URLSearchParams(tags.map(t => ['tags', t])) } : {};
    return apiClient.get<ExamDTO[]>(`${API}/api/exams`, params).then(r =>
      Array.isArray(r.data) ? r.data : []
    );
  },
  getExam: (examId: string): Promise<ExamDTO> =>
    apiClient.get<ExamDTO>(`${API}/api/exams/${examId}`).then(r => r.data),
};
