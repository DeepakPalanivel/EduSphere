import api from './axios';

export const globalSearch = (q, limit = 5) => api.get('/search', { params: { q, limit } });
