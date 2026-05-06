/** FE-04: draftService — ingestion review workflow */
import apiClient from './apiClient';
import type {
  ExamDraftSummaryDTO,
  DraftQuestionDTO,
  DraftQuestionEditCommand,
  ExamDraftPublishCommand,
} from '../types/exam.types';

const API = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8090/exam-integrity-backend';
const BASE = `${API}/api/drafts`;

export interface FullDraftDTO {
  draftId?: string;
  summary: ExamDraftSummaryDTO;
  questions: DraftQuestionDTO[];
}

export const draftService = {
  uploadPdf: (file: File, examSetIndex: number): Promise<ExamDraftSummaryDTO> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('examSetIndex', String(examSetIndex));
    return apiClient.post<ExamDraftSummaryDTO>(BASE, fd).then((r) => r.data);
  },
  listDrafts: (status?: string): Promise<ExamDraftSummaryDTO[]> =>
    apiClient
      .get<ExamDraftSummaryDTO[]>(BASE, { params: status ? { status } : undefined })
      .then((r) => r.data),
  getDraft: (draftId: string): Promise<FullDraftDTO> =>
    apiClient.get<FullDraftDTO>(`${BASE}/${draftId}`).then((r) => r.data),
  editQuestion: (
    draftId: string,
    questionId: string,
    cmd: DraftQuestionEditCommand,
  ): Promise<void> =>
    apiClient.patch(`${BASE}/${draftId}/questions/${questionId}`, cmd).then(() => {}),
  removeQuestion: (draftId: string, questionId: string): Promise<void> =>
    apiClient.delete(`${BASE}/${draftId}/questions/${questionId}`).then(() => {}),
  addQuestion: (
    draftId: string,
    question: Partial<DraftQuestionDTO>,
    position?: number,
  ): Promise<DraftQuestionDTO> =>
    apiClient
      .post<DraftQuestionDTO>(`${BASE}/${draftId}/questions`, { ...question, position })
      .then((r) => r.data),
  publishDraft: (draftId: string, cmd: ExamDraftPublishCommand): Promise<ExamDraftSummaryDTO> =>
    apiClient.post<ExamDraftSummaryDTO>(`${BASE}/${draftId}/publish`, cmd).then((r) => r.data),
  rejectDraft: (draftId: string, reason: string): Promise<void> =>
    apiClient.post(`${BASE}/${draftId}/reject`, { reason }).then(() => {}),
};
