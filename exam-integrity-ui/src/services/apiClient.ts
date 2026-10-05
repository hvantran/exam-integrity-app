/**
 * Shared axios instance.
 * Auth handled by Keycloak OAuth via spring-cloud-gateway (session cookie).
 * On 401 it reloads the app root so the gateway redirects to Keycloak.
 */
import axios from 'axios';

export const API_BASE =
  process.env.REACT_APP_API_BASE_URL ?? '/api/exam-integrity';

const apiClient = axios.create({ baseURL: API_BASE, withCredentials: true });

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(err);
  },
);

export default apiClient;
