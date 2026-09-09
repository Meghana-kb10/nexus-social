import axios from 'axios';

// Resolve API base URL from Vite environment variable with safe fallback
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Reusable Axios client instance configured for JSON communication
 */
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10s request timeout
});

/**
 * Request Interceptor:
 * Reads token from localStorage and attaches Bearer authorization header if present.
 * Prevents attaching "Bearer null", "Bearer undefined", or empty tokens.
 */
client.interceptors.request.use(
  (config) => {
    try {
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && typeof token === 'string' && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
          config.headers.Authorization = `Bearer ${token.trim()}`;
        } else {
          delete config.headers.Authorization;
        }
      }
    } catch (e) {
      console.warn('Could not read token from localStorage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Standardizes backend error messages while preserving HTTP status codes.
 * Ensures caller receives meaningful error messages from backend responses or network failures.
 */
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // Server responded with non-2xx status (400, 401, 404, 500, etc.)
      errorMessage = error.response.data?.message || `Request failed with status ${error.response.status}`;
    } else if (error.request) {
      // Network failure / server unreachable
      errorMessage = 'Network error: Cannot reach the backend server. Please verify the server is running.';
    } else {
      errorMessage = error.message;
    }

    // Attach human-readable error message to the error object
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

export default client;
