import client from './client.js';

/**
 * Fetch the public post feed with optional filters and pagination.
 * @param {Object} params - { filter?: 'all' | 'latest' | 'popular', page?: number, limit?: number }
 * @returns {Promise<Object>} { success: true, posts: [...], pagination: { page, limit, total, hasMore } }
 */
export const getFeed = async (params = {}) => {
  return client.get('/posts', { params });
};

/**
 * Create a new social post with text content, an image URL, or both.
 * Requires authentication (token attached automatically).
 * @param {Object} data - { content?: string, imageUrl?: string }
 * @returns {Promise<Object>} { success: true, post: {...} }
 */
export const createPost = async (data) => {
  return client.post('/posts', data);
};

/**
 * Toggle like / unlike on a post.
 * Requires authentication (token attached automatically).
 * @param {string} postId - MongoDB ObjectId of the target post
 * @returns {Promise<Object>} { success: true, liked: boolean, likeCount: number }
 */
export const toggleLike = async (postId) => {
  return client.post(`/posts/${postId}/like`);
};

/**
 * Add an embedded comment to a post.
 * Requires authentication (token attached automatically).
 * @param {string} postId - MongoDB ObjectId of the target post
 * @param {string} text - The comment content
 * @returns {Promise<Object>} { success: true, comment: {...}, commentCount: number }
 */
export const addComment = async (postId, text) => {
  return client.post(`/posts/${postId}/comments`, { text });
};

/**
 * Fetch a single post by ID including embedded likes and comments.
 * @param {string} postId - MongoDB ObjectId of the target post
 * @returns {Promise<Object>} { success: true, post: {...} }
 */
export const getPostById = async (postId) => {
  return client.get(`/posts/${postId}`);
};

/**
 * Fetch top trending hashtags aggregated from real posts.
 */
export const getTrendingHashtags = async () => {
  return client.get('/posts/trending/hashtags');
};
