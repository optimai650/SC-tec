import api from './api';

// Matrículas
export const getMatriculas = (fairId) => api.get('/admin/matriculas', { params: fairId ? { fairId } : {} }).then(r => r.data);
export const importMatriculas = (csv) => api.post('/admin/matriculas', { csv }).then(r => r.data);
export const deleteMatricula = (id) => api.delete(`/admin/matriculas/${id}`).then(r => r.data);

// Ferias
export const getFairs = () => api.get('/admin/fairs').then(r => r.data);
export const createFair = (data) => api.post('/admin/fairs', data).then(r => r.data);
export const updateFair = (id, data) => api.put(`/admin/fairs/${id}`, data).then(r => r.data);
export const deleteFair = (id) => api.delete(`/admin/fairs/${id}`).then(r => r.data);
export const activateFair = (id) => api.post(`/admin/fairs/${id}/activate`).then(r => r.data);
export const setFairPeriods = (id, periodIds) => api.post(`/admin/fairs/${id}/periods`, { periodIds }).then(r => r.data);

// Periodos
export const getPeriods = () => api.get('/admin/periods').then(r => r.data);
export const createPeriod = (data) => api.post('/admin/periods', data).then(r => r.data);
export const updatePeriod = (id, data) => api.put(`/admin/periods/${id}`, data).then(r => r.data);
export const deletePeriod = (id) => api.delete(`/admin/periods/${id}`).then(r => r.data);

// Inscripciones admin
export const getAllInscriptions = () => api.get('/admin/inscriptions').then(r => r.data);
export const deleteInscription = (id) => api.delete(`/admin/inscriptions/${id}`).then(r => r.data);

// Socios
export const getAllSocios = () => api.get('/socios/all').then(r => r.data);
export const createSocio = (data) => api.post('/socios', data).then(r => r.data);
export const updateSocio = (id, data) => api.put(`/socios/${id}`, data).then(r => r.data);
export const deleteSocio = (id) => api.delete(`/socios/${id}`).then(r => r.data);
export const createSocioAdminUser = (socioId, data) => api.post(`/socios/${socioId}/admin-user`, data).then(r => r.data);

// Stats
export const getStats = (fairId) => api.get('/admin/stats', { params: fairId ? { fairId } : {} }).then(r => r.data);
