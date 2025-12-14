import axios from 'axios';

/**
 * Axios instance configured for API requests.
 * - Base URL points to the backend API endpoint
 * - Credentials (cookies) are included for JWT authentication
 * - JSON content-type is set by default for all requests
 * - Admin PIN is included for demo mode unlock
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add admin PIN header if available
api.interceptors.request.use((config) => {
  const adminPin = sessionStorage.getItem('adminPin');
  if (adminPin) {
    config.headers['x-admin-pin'] = adminPin;
  }
  return config;
});

// Helper to check if demo mode is blocking an action
export const isDemoModeError = (error) => {
  return error?.response?.data?.demoMode === true;
};

// Helper to clear admin PIN
export const clearAdminPin = () => {
  sessionStorage.removeItem('adminPin');
};

// Helper to check if PIN is set
export const hasAdminPin = () => {
  return !!sessionStorage.getItem('adminPin');
};

export default api;
