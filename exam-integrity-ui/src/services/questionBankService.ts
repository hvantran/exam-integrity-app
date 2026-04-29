/** FE-06: questionBankService — search and update question bank */
import apiClient from './apiClient';
import type { QuestionBankPageDTO, QuestionType, DraftQuestionDTO, DraftQuestionEditCommand } from '../types/exam.types';

const API = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8090/exam-integrity-backend';

export interface QuestionBankSearchParams {
  q?: string;
  type?: QuestionType;
  tags?: string[];
  page?: number;
  size?: number;
}

export const questionBankService = {
  search: (params: QuestionBankSearchParams): Promise<QuestionBankPageDTO> => {
    const { tags, ...rest } = params;
    const query: Record<string, unknown> = { ...rest };
    if (tags?.length) query['tags'] = tags.join(',');
    return apiClient.get<QuestionBankPageDTO>(`${API}/api/questions`, { params: query }).then(r => r.data);
  },

  update: (id: string, cmd: DraftQuestionEditCommand): Promise<DraftQuestionDTO> =>
    apiClient.put<DraftQuestionDTO>(`${API}/api/questions/${id}`, cmd).then(r => r.data),

  addQuestion: (cmd: DraftQuestionEditCommand): Promise<DraftQuestionDTO> =>
    apiClient.post<DraftQuestionDTO>(`${API}/api/questions`, cmd).then(r => r.data),

  deleteAll: (): Promise<void> =>
    apiClient.delete(`${API}/api/questions`).then(() => undefined),
};
