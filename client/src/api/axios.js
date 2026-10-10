import axios from 'axios';

// Production backend URL — update this if your Render URL changes
const PROD_API = 'https://edusphere-api-v51d.onrender.com/api';

// In development, Vite proxy handles /api → localhost:5000
const baseURL = import.meta.env.DEV ? '/api' : PROD_API;

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
