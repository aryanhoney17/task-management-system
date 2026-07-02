import api from './axios';

export const registerApi = (data) => api.post('/auth/register', data);
export const loginApi = (data) => api.post('/auth/login', data);
export const getProfileApi = () => api.get('/auth/me');
