import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/tokenHelper.js';
import { getDemoLoginCredentials } from '../utils/demoAccount.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    const { name, username, email, password, avatar } = req.body;

    // 1. Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, username, email, and password'
      });
    }

    const trimmedName = name.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate username format and length
    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters'
      });
    }

    // 2. Check if email already exists
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // 3. Check if username already exists
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken, please choose another'
      });
    }

    // 4. Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create user in users collection
    const user = await User.create({
      name: trimmedName,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      avatar: avatar && avatar.trim() ? avatar.trim() : undefined
    });

    // 6. Generate JWT
    const token = generateToken(user);

    const followers = user.followers || [];
    const following = user.following || [];

    // 7. Return safe user info & token
    return res.status(201).json({
      success: true,
      user: {
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
        followingCount: following.length,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during registration'
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const isDemoLogin = req.body?.demo === true;
    let { email, password } = req.body;

    if (isDemoLogin) {
      const demoCredentials = getDemoLoginCredentials();
      if (!demoCredentials) {
        return res.status(503).json({
          success: false,
          message: 'Demo account is not available right now. Please try again later.'
        });
      }
      ({ email, password } = demoCredentials);
    }

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Find user by email and explicitly select password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Compare password with bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Generate JWT
    const token = generateToken(user);

    const followers = user.followers || [];
    const following = user.following || [];

    // 5. Return safe user info & token
    return res.status(200).json({
      success: true,
      user: {
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
        followingCount: following.length,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during login'
    });
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private (Protected by authMiddleware)
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const followers = user.followers || [];
    const following = user.following || [];

    return res.status(200).json({
      success: true,
      user: {
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
        followingCount: following.length,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile'
    });
  }
};
