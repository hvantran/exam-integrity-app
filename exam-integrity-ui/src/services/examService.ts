/** FE-03: examService — list and get exams */
import apiClient from './apiClient';
import type { CreateExamFromBankCommand, ExamDTO } from '../types/exam.types';

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
  createFromBank: (cmd: CreateExamFromBankCommand): Promise<ExamDTO> =>
    apiClient.post<ExamDTO>(`${API}/api/exams/from-bank`, cmd).then(r => r.data),
  deleteExam: (examId: string): Promise<void> =>
    apiClient.delete(`${API}/api/exams/${examId}`).then(() => undefined),
  listTags: (): Promise<string[]> =>
    apiClient.get<string[]>(`${API}/api/exams/tags`).then(r => Array.isArray(r.data) ? r.data : []),

};
