/** FE-07: proctorService — report proctor events */
import apiClient from './apiClient';

export const proctorService = {
  reportEvent: (sessionId: string, eventType: string, studentId: string): Promise<void> =>
    apiClient
      .post(`/api/sessions/${sessionId}/proctor/events`, { eventType, studentId })
      .then(() => {}),
};
