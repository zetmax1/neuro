import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Initialize Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Read directly from the Zustand store (works outside React components)
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Globally catch 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      // If a refresh token exists, attempt to get a new access token
      if (refreshToken) {
        try {
          // Use raw axios to avoid interceptor loops
          const refreshResponse = await axios.post(`${apiClient.defaults.baseURL}/api/accounts/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = refreshResponse.data.access;

          // Save the new access token to both localStorage and Zustand store
          localStorage.setItem('accessToken', newAccessToken);
          useAuthStore.getState().setCredentials(newAccessToken, useAuthStore.getState().user);

          // If the backend also rotates the refresh token, update it
          if (refreshResponse.data.refresh) {
            localStorage.setItem('refreshToken', refreshResponse.data.refresh);
          }

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed → force logout
          useAuthStore.getState().logout();
          window.location.href = '/auth';

          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token → force logout
        useAuthStore.getState().logout();
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
