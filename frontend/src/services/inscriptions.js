import api from './api';

export const getMyInscription = () => api.get('/inscriptions/me').then(r => r.data);
export const getMyCertificate = () => api.get('/inscriptions/me/certificate').then(r => r.data);
export const redeemCode = (data) => api.post('/inscriptions/redeem', data).then(r => r.data);
export const cancelMyInscription = () => api.delete('/inscriptions/me').then(r => r.data);
