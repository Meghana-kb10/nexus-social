import client from './client.js';

/**
 * Toggle follow/unfollow on a target user
 * @param {string} userId
 */
export const toggleFollow = async (userId) => {
  return await client.post(`/users/${userId}/follow`);
};

/**
 * Get real suggested users
 */
export const getSuggestedUsers = async () => {
  return await client.get('/users/suggestions');
};

/**
 * Get dynamically computed notifications for current user
 */
export const getNotifications = async () => {
  return await client.get('/users/notifications');
};

/**
 * Get user profile and computed stats
 * @param {string} userId - Target user ID or 'me'
 */
export const getUserProfile = async (userId) => {
  return await client.get(`/users/${userId}/profile`);
};
