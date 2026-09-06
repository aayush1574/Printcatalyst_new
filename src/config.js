// API and WebSocket base URLs
// In development or single-service hosting, API_BASE is empty (relative paths).
// When frontend is hosted separately on Vercel, set VITE_API_URL in Vercel environment variables (e.g. https://your-backend.onrender.com)
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};
