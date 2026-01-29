import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    console.log('📨 API REQUEST:', config.method.toUpperCase(), config.url);
    console.log('   Token available:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('   ✅ JWT token added to Authorization header');
    } else {
      console.warn('   ⚠️  NO JWT TOKEN FOUND in localStorage!');
    }
    
    // Important: Don't override Content-Type for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('   📤 Using FormData (no Content-Type override)');
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
  deleteCapsule: (capsuleId) => api.delete(`/capsules/${capsuleId}`),
};

// Add response error logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API ERROR:', error.response?.status, error.config.url);

    const originalRequest = error.config;

    // If we get a 401, try to refresh the access token using the refresh token.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        console.warn('No refresh token available; redirecting to login.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(error);
      }

      // Call /auth/refresh with the refresh token in Authorization header.
      return axios.post(`${API_BASE_URL}/auth/refresh`, null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
        .then((res) => {
          if (res.status === 200 && res.data?.access_token) {
            console.log('🔁 Access token refreshed');
            localStorage.setItem('access_token', res.data.access_token);
            // Update the original request Authorization header and retry
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
            return axios(originalRequest);
          }

          // If refresh didn't return a token, clear storage and fail
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          return Promise.reject(error);
        })
        .catch((refreshError) => {
          console.warn('Refresh token invalid or expired; clearing tokens.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          return Promise.reject(refreshError);
        });
    }

    if (error.response?.status === 422) {
      console.error('   Unprocessable Entity (422) - Invalid data or missing fields');
      console.error('   Response:', error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;
