import api from './api';

export const getMyInscriptions = () => api.get('/inscriptions/me').then(r => r.data);
export const redeemCode = (data) => api.post('/inscriptions/redeem', data).then(r => r.data);
export const cancelMyInscription = (id) => api.delete(`/inscriptions/${id}`).then(r => r.data);
