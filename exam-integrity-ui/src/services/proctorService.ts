/** FE-07: proctorService — report proctor events */
import apiClient from './apiClient';

const API = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8090/exam-integrity-backend';

export const proctorService = {
  reportEvent: (sessionId: string, eventType: string, studentId: string): Promise<void> =>
    apiClient
      .post(`${API}/api/sessions/${sessionId}/proctor/events`, { eventType, studentId })
      .then(() => {}),
};
