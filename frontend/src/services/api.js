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
  updateProfile: (data) => api.put('/auth/profile', data),
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

  // Voluntarios
  listVolunteers: () => api.get('/admin/volunteers'),
  deleteVolunteer: (id) => api.delete(`/admin/volunteers/${id}`),

  // Signups
  updateSignupStatus: (id, status) => api.put(`/admin/signups/${id}/status`, { status }),

  // Org panel para superadmin
  getOrg: (orgId) => api.get(`/admin/orgs/${orgId}`),
  updateOrg: (orgId, data) => api.put(`/admin/orgs/${orgId}`, data),
  listOrgOpportunities: (orgId) => api.get(`/admin/orgs/${orgId}/opportunities`),
  createOrgOpportunity: (orgId, data) => api.post(`/admin/orgs/${orgId}/opportunities`, data),
  updateOrgOpportunity: (orgId, oppId, data) => api.put(`/admin/orgs/${orgId}/opportunities/${oppId}`, data),
  updateOrgOpportunityStatus: (orgId, oppId, status) =>
    api.put(`/admin/orgs/${orgId}/opportunities/${oppId}/status`, { status }),
  getOrgOpportunityVolunteers: (orgId, oppId) =>
    api.get(`/admin/orgs/${orgId}/opportunities/${oppId}/volunteers`),
  markOrgVolunteerAttendance: (orgId, oppId, signupId) =>
    api.put(`/admin/orgs/${orgId}/opportunities/${oppId}/volunteers/${signupId}`),
};

export default api;
