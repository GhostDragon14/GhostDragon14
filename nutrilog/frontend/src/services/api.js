import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('nutrilog_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('nutrilog_token');
      window.location.href = '/login';
    }
    if (err.response?.status === 403 && err.response.data?.upgradeRequired) {
      toast.error('Upgrade your plan to access this feature');
    }
    return Promise.reject(err);
  }
);

export default api;
