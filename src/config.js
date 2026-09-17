// API and WebSocket base URLs
// Default fallback to live production backend on Render when hosted on Vercel without env vars
const PROD_BACKEND_URL = 'https://printcatalyst-new.onrender.com';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // If hosted on Vercel, Firebase, Netlify, or custom domain without explicit VITE_API_URL
  if (typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('web.app') ||
    window.location.hostname.includes('firebaseapp.com') ||
    (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'))
  )) {
    return PROD_BACKEND_URL;
  }
  // Local development with Vite reverse proxy
  return '';
};

export const API_BASE = getBaseUrl();

export const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  if (API_BASE) {
    return API_BASE.replace(/^http/, 'ws');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return PROD_BACKEND_URL.replace(/^http/, 'ws');
  }
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return typeof window !== 'undefined' ? `${protocol}//${window.location.host}` : 'ws://localhost:5000';
};

