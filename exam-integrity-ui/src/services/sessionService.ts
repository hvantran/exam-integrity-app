/** FE-05: sessionService — exam session lifecycle */
import apiClient from './apiClient';
import type {
  SessionDTO,
  QuestionSummaryDTO,
  AnswerPayload,
  ReviewDashboardDTO,
  SessionResultSummaryDTO,
  TeacherScoreUpdatePayload,
} from '../types/exam.types';

const API = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8090/exam-integrity-backend';
const BASE = `${API}/api/sessions`;

export const sessionService = {
  createSession: (examId: string, studentId: string): Promise<SessionDTO> =>
    apiClient.post<SessionDTO>(BASE, null, { params: { examId, studentId } }).then(r => r.data),
  getSession: (sessionId: string): Promise<SessionDTO> =>
    apiClient.get<SessionDTO>(`${BASE}/${sessionId}`).then(r => r.data),
  getTimer: (sessionId: string): Promise<number> =>
    apiClient.get<number>(`${BASE}/${sessionId}/timer`).then(r => r.data),
  getQuestion: (sessionId: string, questionNumber: number): Promise<QuestionSummaryDTO> =>
    apiClient.get<QuestionSummaryDTO>(`${BASE}/${sessionId}/questions/${questionNumber}`).then(r => r.data),
  saveAnswer: (sessionId: string, questionId: string, payload: AnswerPayload): Promise<void> =>
    apiClient.patch(`${BASE}/${sessionId}/answers/${questionId}`, payload).then(() => {}),
  submitExam: (sessionId: string): Promise<void> =>
    apiClient.post(`${BASE}/${sessionId}/submit`).then(() => {}),
  getReviewDashboard: (sessionId: string): Promise<ReviewDashboardDTO | null> =>
    apiClient.get<ReviewDashboardDTO>(`${BASE}/${sessionId}/review`).then(r => r.data).catch(() => null),
  getStudentResults: (studentId: string): Promise<SessionResultSummaryDTO[]> =>
    apiClient.get<SessionResultSummaryDTO[]>(`${BASE}/student/${studentId}/results`).then(r => r.data),
  getTeacherScoringQueue: (): Promise<SessionResultSummaryDTO[]> =>
    apiClient.get<SessionResultSummaryDTO[]>(`${BASE}/teacher/scoring`).then(r => r.data),
  updateTeacherScore: (sessionId: string, questionId: string, payload: TeacherScoreUpdatePayload): Promise<ReviewDashboardDTO> =>
    apiClient.patch<ReviewDashboardDTO>(`${BASE}/${sessionId}/scores/${questionId}`, payload).then(r => r.data),
};
