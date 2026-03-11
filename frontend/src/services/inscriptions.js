import api from './api';

export const getMyInscription = () => api.get('/inscriptions/me').then(r => r.data);
export const redeemCode = (code) => api.post('/inscriptions/redeem', { code }).then(r => r.data);
export const cancelMyInscription = () => api.delete('/inscriptions/me').then(r => r.data);
