import api from './axios';

export const getAdminStats = () => api.get('/admin/stats');
export const getUnapprovedMaterials = () => api.get('/admin/materials/unapproved');
export const approveMaterial = (id) => api.put(`/admin/materials/${id}/approve`);
export const getAllUsers = (params) => api.get('/users', { params });
export const promoteUser = (id) => api.put(`/users/${id}/promote`);
export const deactivateUser = (id) => api.put(`/users/${id}/deactivate`);
