import axios from 'axios';
import { auth } from '../stores/auth';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((cfg) => {
  if (auth.token) cfg.headers.Authorization = `Bearer ${auth.token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      auth.logout();
      if (location.pathname !== '/login') location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err) => err.response?.data?.error || err.message || '请求失败';
