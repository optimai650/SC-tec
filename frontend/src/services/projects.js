import api from './api';

export const getPublicProjects = () => api.get('/projects/public').then(r => r.data);
export const getProjectByToken = (qrToken) => api.get(`/projects/by-token/${qrToken}`).then(r => r.data);
export const getMyProjects = () => api.get('/projects/my').then(r => r.data);
export const getAllProjects = () => api.get('/projects').then(r => r.data);
export const createProject = (data) => api.post('/projects', data).then(r => r.data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data);
export const generateCode = (id, matricula) => api.post(`/projects/${id}/generate-code`, { matricula }).then(r => r.data);
