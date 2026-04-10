import axios from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY || 'dev-key';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// ─── Templates ──────────────────────────────────────────────────
export const templateApi = {
  list: (params) => api.get('/templates', { params }),
  get: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  duplicate: (id) => api.post(`/templates/${id}/duplicate`),
};

// ─── Tags ────────────────────────────────────────────────────────
export const tagApi = {
  list: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`),
};

// ─── Render / Preview ────────────────────────────────────────────
export const renderApi = {
  preview: (data) => api.post('/preview', data),
};

// ─── Logs ────────────────────────────────────────────────────────
export const logApi = {
  list: (params) => api.get('/logs', { params }),
};

export default api;
