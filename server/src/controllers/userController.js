import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';

/**
 * @desc    Toggle follow/unfollow another user
 * @route   POST /api/users/:userId/follow
 * @access  Private
 */
export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    if (req.user.id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Ensure target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User to follow not found'
      });
    }

    const targetObjectId = new mongoose.Types.ObjectId(userId);
    const currentObjectId = new mongoose.Types.ObjectId(req.user.id);

    const currentUser = await User.findById(req.user.id);
    const isCurrentlyFollowing = currentUser.following?.some(
      (id) => (id._id || id).toString() === userId.toString()
    );

    let updatedCurrentUser;
    let updatedTargetUser;
    let isFollowing;

    if (isCurrentlyFollowing) {
      // Unfollow atomically:
      // Remove target user from current user's following list
      updatedCurrentUser = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { following: targetObjectId } },
        { new: true }
      ).select('-password');

      // Remove current user from target user's followers list
      updatedTargetUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { followers: currentObjectId } },
        { new: true }
      ).select('-password');

      isFollowing = false;
    } else {
      // Follow atomically with $addToSet:
      // Add target user to current user's following list
      updatedCurrentUser = await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { following: targetObjectId } },
        { new: true }
      ).select('-password');

      // Add current user to target user's followers list
      updatedTargetUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { followers: currentObjectId } },
        { new: true }
      ).select('-password');

      isFollowing = true;
    }

    const following = updatedCurrentUser.following || [];
    const targetFollowers = updatedTargetUser.followers || [];

    return res.status(200).json({
      success: true,
      isFollowing,
      following,
      followingCount: following.length,
      followersCount: targetFollowers.length,
      targetUser: {
        id: updatedTargetUser._id,
        _id: updatedTargetUser._id,
        name: updatedTargetUser.name,
        username: updatedTargetUser.username,
        avatar: updatedTargetUser.avatar,
        followersCount: targetFollowers.length,
        followingCount: (updatedTargetUser.following || []).length
      }
    });
  } catch (error) {
    console.error('ToggleFollow Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating follow status'
    });
  }
};

/**
 * @desc    Get suggested users excluding the current user and already-followed users
 * @route   GET /api/users/suggestions
 * @access  Private
 */
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);
    const followingIds = (currentUser?.following || []).map((id) => id.toString());

    // Exclude current user and already followed users
    const excludedIds = [currentUserId.toString(), ...followingIds];

    // Fetch up to 6 users other than current user and already followed users
    const suggestions = await User.find({ _id: { $nin: excludedIds } })
      .select('name username avatar badge createdAt followers following')
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      users: suggestions.map((u) => ({
        id: u._id,
        _id: u._id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        badge: u.badge,
        createdAt: u.createdAt,
        followersCount: (u.followers || []).length,
        followingCount: (u.following || []).length
      }))
    });
  } catch (error) {
    console.error('GetSuggestedUsers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving suggested users'
    });
  }
};

/**
 * @desc    Get dynamic notifications computed from the logged-in user's posts
 * @route   GET /api/users/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user.id.toString();

    // Find all posts authored by the current user
    const userPosts = await Post.find({ 'author.userId': currentUserId })
      .select('content imageUrl likes comments createdAt')
      .lean();

    const notifications = [];

    userPosts.forEach((post) => {
      const postSnippet = post.content
        ? (post.content.length > 50 ? post.content.slice(0, 50) + '...' : post.content)
        : 'Photo post';

      // 1. Collect likes from other users
      if (Array.isArray(post.likes)) {
        post.likes.forEach((like) => {
          if (like.userId && like.userId.toString() !== currentUserId) {
            notifications.push({
              id: `like_${post._id}_${like.userId}`,
              type: 'like',
              user: {
                userId: like.userId,
                username: like.username
              },
              postId: post._id,
              postSnippet,
              createdAt: like.createdAt || post.createdAt
            });
          }
        });
      }

      // 2. Collect comments from other users
      if (Array.isArray(post.comments)) {
        post.comments.forEach((comment) => {
          if (comment.userId && comment.userId.toString() !== currentUserId) {
            notifications.push({
              id: `comment_${comment._id}`,
              type: 'comment',
              user: {
                userId: comment.userId,
                username: comment.username,
                avatar: comment.avatar || ''
              },
              text: comment.text,
              postId: post._id,
              postSnippet,
              createdAt: comment.createdAt || post.createdAt
            });
          }
        });
      }
    });

    // Sort notifications newest first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('GetNotifications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving notifications'
    });
  }
};

/**
 * @desc    Get user profile details, calculated stats, and user's posts
 * @route   GET /api/users/:userId/profile
 * @access  Private / Public
 */
export const getUserProfile = async (req, res) => {
  try {
    let { userId } = req.params;

    if (userId === 'me' && req.user) {
      userId = req.user.id;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('following', '_id id name username avatar badge')
      .populate('followers', '_id id name username avatar badge');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const followers = (user.followers || []).filter(Boolean);
    const following = (user.following || []).filter(Boolean);
    const followersCount = followers.length;
    const followingCount = following.length;

    // Fetch this user's posts
    const posts = await Post.find({ 'author.userId': user._id })
      .sort({ createdAt: -1 });

    // Aggregate stats from posts
    const totalPosts = posts.length;
    const totalLikesReceived = posts.reduce((acc, p) => acc + (p.likeCount || 0), 0);
    const totalCommentsReceived = posts.reduce((acc, p) => acc + (p.commentCount || 0), 0);

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
        followersCount,
        followingCount,
        createdAt: user.createdAt
      },
      stats: {
        totalPosts,
        totalLikesReceived,
        totalCommentsReceived,
        followingCount,
        followersCount
      },
      posts
    });
  } catch (error) {
    console.error('GetUserProfile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};
