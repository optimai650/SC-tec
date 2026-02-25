import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Opportunities API (público)
export const opportunitiesAPI = {
  list: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
};

// Signups API (voluntarios)
export const signupsAPI = {
  create: (data) => api.post('/signups', data),
  cancel: (id) => api.delete(`/signups/${id}`),
  getMine: () => api.get('/signups/mine'),
};

// Organizations API (org_admin)
export const organizationsAPI = {
  getMine: () => api.get('/organizations/mine'),
  updateMine: (data) => api.put('/organizations/mine', data),
  getMyOpportunities: () => api.get('/organizations/mine/opportunities'),
  createOpportunity: (data) => api.post('/organizations/mine/opportunities', data),
  updateOpportunity: (id, data) => api.put(`/organizations/mine/opportunities/${id}`, data),
  updateOpportunityStatus: (id, status) =>
    api.put(`/organizations/mine/opportunities/${id}/status`, { status }),
  getOpportunityVolunteers: (id) =>
    api.get(`/organizations/mine/opportunities/${id}/volunteers`),
  markAttendance: (opportunityId, signupId) =>
    api.put(`/organizations/mine/opportunities/${opportunityId}/volunteers/${signupId}`),
};

// Admin API (superadmin)
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  listOrganizations: (params) => api.get('/admin/organizations', { params }),
  createOrganization: (data) => api.post('/admin/organizations', data),
  updateOrgStatus: (id, status) => api.put(`/admin/organizations/${id}/status`, { status }),
  listOpportunities: () => api.get('/admin/opportunities'),
  listSignups: () => api.get('/admin/signups'),
};

export default api;
