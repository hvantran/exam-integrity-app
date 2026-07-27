/** FE-03: examService — list and get exams */
import apiClient from './apiClient';
import type {
  CreateExamFromBankCommand,
  ExamDTO,
  UpdateExamQuestionsFromBankCommand,
} from '../types/exam.types';

export const examService = {
  listAllExams: (): Promise<ExamDTO[]> =>
    apiClient
      .get<ExamDTO[]>('/api/exams/all')
      .then((r) => (Array.isArray(r.data) ? r.data : [])),
  listExams: (tags?: string[]): Promise<ExamDTO[]> => {
    const params = tags?.length
      ? { params: new URLSearchParams(tags.map((t) => ['tags', t])) }
      : {};
    return apiClient
      .get<ExamDTO[]>('/api/exams', params)
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getExam: (examId: string): Promise<ExamDTO> =>
    apiClient.get<ExamDTO>(`/api/exams/${examId}`).then((r) => r.data),
  createFromBank: (cmd: CreateExamFromBankCommand): Promise<ExamDTO> =>
    apiClient.post<ExamDTO>('/api/exams/from-bank', cmd).then((r) => r.data),
  updateQuestionsFromBank: (
    examId: string,
    cmd: UpdateExamQuestionsFromBankCommand,
  ): Promise<ExamDTO> =>
    apiClient.put<ExamDTO>(`/api/exams/${examId}/questions/from-bank`, cmd).then((r) => r.data),
  importFromJsonFile: (file: File): Promise<ExamDTO> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<ExamDTO>('/api/exams/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  exportToJsonFile: (examId: string): Promise<Blob> =>
    apiClient
      .get(`/api/exams/${examId}/export`, { responseType: 'blob' })
      .then((r) => r.data as Blob),
  deleteExam: (examId: string): Promise<void> =>
    apiClient.delete(`/api/exams/${examId}`).then(() => undefined),
  listTags: (): Promise<string[]> =>
    apiClient
      .get<string[]>('/api/exams/tags')
      .then((r) => (Array.isArray(r.data) ? r.data : [])),
};
