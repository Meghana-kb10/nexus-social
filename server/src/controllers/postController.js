import mongoose from 'mongoose';
import Post from '../models/Post.js';

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    const trimmedImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';

    // Validate that at least one of content or imageUrl is provided
    if (!trimmedContent && !trimmedImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'A post must contain either text content or an image URL'
      });
    }

    // Validate maximum content length
    if (trimmedContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot exceed 2000 characters'
      });
    }

    // Create the post with authenticated user as author
    const post = await Post.create({
      author: {
        userId: req.user.id,
        name: req.user.name,
        username: req.user.username,
        avatar: req.user.avatar || '',
        badge: req.user.badge || 'Member'
      },
      content: trimmedContent || undefined,
      imageUrl: trimmedImageUrl || undefined,
      likes: [],
      likeCount: 0,
      comments: [],
      commentCount: 0
    });

    return res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('CreatePost Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
};

/**
 * @desc    Get public post feed with sorting & pagination
 * @route   GET /api/posts
 * @access  Public
 */
export const getFeed = async (req, res) => {
  try {
    const filter = (req.query.filter || 'all').toLowerCase();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const userId = req.query.userId?.trim();

    // Base query filter
    const query = {};

    // Filter by author user ID if provided
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query['author.userId'] = userId;
    }

    // Filter by search term if provided (matches text content, author name, or username)
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { content: searchRegex },
        { 'author.name': searchRegex },
        { 'author.username': searchRegex }
      ];
    }

    // Determine sorting criteria
    let sortQuery = { createdAt: -1 };
    if (filter === 'popular') {
      sortQuery = { likeCount: -1, createdAt: -1 };
    } else if (filter === 'latest' || filter === 'all') {
      sortQuery = { createdAt: -1 };
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    console.error('GetFeed Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving feed'
    });
  }
};

/**
 * @desc    Get trending hashtags aggregated from existing posts
 * @route   GET /api/posts/trending/hashtags
 * @access  Public
 */
export const getTrendingHashtags = async (req, res) => {
  try {
    const posts = await Post.find({ content: { $exists: true, $ne: '' } })
      .select('content createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const tagCounts = {};
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;

    posts.forEach((post) => {
      if (post.content) {
        const matches = post.content.match(hashtagRegex);
        if (matches) {
          const uniqueTagsInPost = new Set(matches.map((t) => t.toLowerCase()));
          uniqueTagsInPost.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });

    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        postsCount: `${count} post${count > 1 ? 's' : ''}`,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      hashtags: sortedTags
    });
  } catch (error) {
    console.error('GetTrendingHashtags Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving trending topics'
    });
  }
};

/**
 * @desc    Get a single post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    return res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('GetPostById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving post'
    });
  }
};

/**
 * @desc    Toggle like / unlike on a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked this post
    const hasLiked = post.likes.some(
      (like) => like.userId.toString() === req.user.id.toString()
    );

    let updatedPost;

    if (hasLiked) {
      // User already liked -> UNLIKE atomically
      updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $pull: { likes: { userId: req.user.id } },
          $inc: { likeCount: -1 }
        },
        { new: true }
      );

      // Guard against negative like count
      if (updatedPost.likeCount < 0) {
        updatedPost.likeCount = 0;
        await updatedPost.save();
      }

      return res.status(200).json({
        success: true,
        liked: false,
        likeCount: Math.max(0, updatedPost.likeCount),
        likes: updatedPost.likes
      });
    } else {
      // User has not liked -> LIKE atomically using $addToSet to avoid duplicates
      updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $addToSet: {
            likes: {
              userId: req.user.id,
              username: req.user.username,
              createdAt: new Date()
            }
          },
          $inc: { likeCount: 1 }
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        liked: true,
        likeCount: updatedPost.likeCount,
        likes: updatedPost.likes
      });
    }
  } catch (error) {
    console.error('ToggleLike Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating like status'
    });
  }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty'
      });
    }

    if (trimmedText.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 1000 characters'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Build the embedded comment subdocument from req.user
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      userId: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar || '',
      text: trimmedText,
      createdAt: new Date()
    };

    // Push comment and increment commentCount atomically
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $push: { comments: newComment },
        $inc: { commentCount: 1 }
      },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      comment: newComment,
      commentCount: updatedPost.commentCount
    });
  } catch (error) {
    console.error('AddComment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};
