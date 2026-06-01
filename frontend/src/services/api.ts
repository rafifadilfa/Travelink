import axios from 'axios';

// ============================================================
// TOURIST API CLIENT (default export)
// Pakai token wisatawan dari localStorage key 'token'.
// ============================================================
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ============================================================
// GUIDE API CLIENT (named export)
// Pakai token pemandu dari localStorage key 'guide_token'.
// Redirect ke /guide/auth kalau token expired atau tidak valid.
// ============================================================
export const guideApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

guideApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('guide_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

guideApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('guide_token');
      localStorage.removeItem('guide');
      window.location.href = '/guide/auth';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// ADMIN API CLIENT (named export)
// Pakai token admin dari localStorage key 'admin_token'.
// Redirect ke /admin/auth kalau token expired atau tidak valid.
// ============================================================
export const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

adminApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin');
      window.location.href = '/admin/auth';
    }
    return Promise.reject(error);
  }
);
