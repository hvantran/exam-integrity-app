/**
 * Resolves the base URL for Gateway auth endpoints (/oauth2/..., /logout).
 *
 * In production/Docker container deployments (Nginx), all gateway endpoints
 * (/api, /oauth2, /login, /logout) are reverse-proxied to api-gateway on the same origin.
 * Returning an empty string '' (same-origin relative URL) ensures that session cookies
 * and host headers match the current browser origin (whether localhost, LAN IP, or custom domain),
 * preventing infinite redirect loops caused by cross-origin cookie isolation.
 *
 * For local development using the React dev server (port 3000), requests fallback to the
 * gateway URL (http://localhost:6081 or http://<hostname>:6081) if no custom URL is provided.
 */
export const getGatewayBaseUrl = (): string => {
  const envGateway =
    (window as any)._env_?.REACT_APP_GATEWAY_URL || process.env.REACT_APP_GATEWAY_URL;

  const isCurrentHostLocal =
    typeof window !== 'undefined' &&
    (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1');

  if (envGateway) {
    // If envGateway specifies localhost but user is accessing via LAN IP or external domain,
    // do not use localhost as it breaks cross-origin auth.
    if (!isCurrentHostLocal && envGateway.includes('localhost')) {
      if (window.location?.port !== '3000') {
        return '';
      }
      return `${window.location.protocol}//${window.location.hostname}:6081`;
    }
    return envGateway;
  }

  // Local React development server (port 3000) fallback
  if (isCurrentHostLocal && window.location?.port === '3000') {
    return 'http://localhost:6081';
  }

  // Production (Docker / Nginx reverse proxy): use same-origin relative path
  return '';
};
