// Shared axios client + JWT interceptors.
// Replaces the duplicated `axios.create({...})` + `interceptors.request` block
// that was copy-pasted across Dashboard, Analyze, and Login.
//
// The response interceptor gives us a single place to handle expired / invalid
// sessions: any 401 (or 403) from the API clears the stored token and redirects
// to /login so the user re-authenticates instead of seeing a generic error.

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track whether we've already kicked off a redirect for the current expired
// session, so a burst of parallel requests (e.g. Dashboard's three initial
// fetches) doesn't queue up multiple navigate calls / replace-history races.
let redirecting = false;

function handleUnauthorized() {
  if (redirecting) return;
  // Don't redirect when the user is already on the login page — Login uses
  // 401 to mean "wrong credentials" and shows an inline error, not a redirect.
  if (window.location.pathname.startsWith('/login')) return;
  redirecting = true;
  localStorage.removeItem('token');
  // Use a hard navigation rather than react-router so the redirect fires even
  // if the failing request originated outside a React-mounted component tree
  // (e.g. a stale tab, a service worker, or a third-party hook).
  window.location.href = '/login';
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default api;
