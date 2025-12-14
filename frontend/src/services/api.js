import axios from 'axios';

/**
 * Axios instance configured for API requests.
 * - Base URL points to the backend API endpoint
 * - Credentials (cookies) are included for JWT authentication
 * - JSON content-type is set by default for all requests
 */
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;

