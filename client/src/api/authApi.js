import client from './client.js';

/**
 * Register a new user account.
 * @param {Object} data - { name, username, email, password, avatar? }
 * @returns {Promise<Object>} { success: true, user, token }
 */
export const signup = async (data) => {
  return client.post('/auth/signup', data);
};

/**
 * Log in an existing user with email and password.
 * @param {Object} data - { email, password }
 * @returns {Promise<Object>} { success: true, user, token }
 */
export const login = async (data) => {
  return client.post('/auth/login', data);
};

/**
 * Fetch the currently authenticated user profile.
 * Automatically attaches Authorization header via client interceptor.
 * @returns {Promise<Object>} { success: true, user }
 */
export const getMe = async () => {
  return client.get('/auth/me');
};
