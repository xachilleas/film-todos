/**
 * API Client Configuration
 * Configures Axios instance with base URL, headers, and interceptors.
 * Handles authentication token injection and global error handling.
 *
 * @module api
 * @requires axios
 */

import axios from 'axios';

/**
 * Axios instance configured for the Film-Todos API
 *
 * Features:
 * - Base URL: http://localhost:3000/api
 * - JSON content type
 * - Automatic token injection via request interceptor
 * - 401 Unauthorized handling via response interceptor
 */
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

/**
 * Request Interceptor
 * Automatically adds JWT token to Authorization header for authenticated requests.
 *
 * Flow:
 * 1. Request is about to be sent
 * 2. Check localStorage for existing token
 * 3. If token exists, add as Bearer token to Authorization header
 * 4. Continue with the request
 *
 * @param {AxiosRequestConfig} config - The request configuration
 * @returns {AxiosRequestConfig} Modified request configuration with auth header
 * @throws {Error} If the request fails (propagates error)
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

/**
 * Response Interceptor
 * Handles global error responses, particularly 401 Unauthorized.
 *
 * Flow:
 * 1. Response is received or error occurs
 * 2. If error is 401 Unauthorized:
 *    - Clear invalid authentication state from localStorage
 *    - Redirect user to login page
 * 3. Otherwise, propagate the error
 *
 * @param {AxiosResponse} response - Successful response
 * @returns {AxiosResponse} The response (passed through)
 * @param {AxiosError} error - Error response
 * @returns {Promise<AxiosError>} Rejected promise with the error
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
            // Clear authentication state
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;