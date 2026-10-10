import api from './axios';

export const getSoftwareList = (params) => api.get('/software', { params });
export const getSoftware = (id) => api.get(`/software/${id}`);
export const createSoftware = (data) => api.post('/software', data);
export const updateSoftware = (id, data) => api.put(`/software/${id}`, data);
export const deleteSoftware = (id) => api.delete(`/software/${id}`);
