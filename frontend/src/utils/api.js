import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Important: Don't override Content-Type for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const capsuleAPI = {
  create: (formData) =>
    api.post('/capsules/create', formData),
  getNearby: (latitude, longitude) =>
    api.post('/capsules/nearby', { latitude, longitude }),
  viewCapsule: (capsuleId, latitude, longitude) =>
    api.post(`/capsules/${capsuleId}/view`, { latitude, longitude }),
  getMyCapsules: () => api.get('/capsules/my-capsules'),
  getCapsule: (capsuleId) => api.get(`/capsules/${capsuleId}`),
  getCapsuleStats: (capsuleId) => api.get(`/capsules/${capsuleId}/stats`),
};

export default api;
