import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes by verifying JWT Bearer token from Authorization header.
 * Attaches authenticated user data to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists in database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    // Attach verified user payload to request
    const followers = user.followers || [];
    const following = user.following || [];

    req.user = {
      id: user._id,
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      badge: user.badge,
      followers,
      following,
      followersCount: followers.length,
      followingCount: following.length
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' 
        ? 'Token has expired, please log in again' 
        : 'Not authorized, token invalid'
    });
  }
};

/**
 * Optional authentication middleware:
 * If a valid JWT Bearer token is provided, attaches authenticated user to req.user.
 * If no token or invalid token, allows request to proceed with req.user = null.
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token || token === 'null' || token === 'undefined') {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      const followers = user.followers || [];
      const following = user.following || [];
      req.user = {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        badge: user.badge,
        followers,
        following,
        followersCount: followers.length,
        followingCount: following.length
      };
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

