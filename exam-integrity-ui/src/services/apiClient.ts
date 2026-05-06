/**
 * Shared axios instance.
 * Reads credentials from sessionStorage and sends Basic Auth header on every request.
 * On 401 it clears stored credentials and reloads to the login page.
 */
import axios from 'axios';

export const API_BASE =
  process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8090/exam-integrity-backend';

const apiClient = axios.create({ baseURL: API_BASE });

apiClient.interceptors.request.use((config) => {
  const creds = sessionStorage.getItem('exam_creds');
  if (creds) {
    const { username, password } = JSON.parse(creds) as { username: string; password: string };
    config.auth = { username, password };
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('exam_creds');
      sessionStorage.removeItem('exam_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default apiClient;
