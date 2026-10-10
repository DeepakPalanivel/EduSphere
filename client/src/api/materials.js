import api from './axios';

export const getMaterials = (params) => api.get('/materials', { params });
export const getMaterial = (id) => api.get(`/materials/${id}`);
export const uploadMaterial = (formData) =>
  api.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateMaterial = (id, data) => api.put(`/materials/${id}`, data);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);
export const downloadMaterial = (id) => `/api/materials/${id}/download`;
