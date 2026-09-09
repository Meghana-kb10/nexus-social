import mongoose from 'mongoose';

// Embedded Like Subdocument Schema
const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// Embedded Comment Subdocument Schema
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

// Main Post Schema
const postSchema = new mongoose.Schema(
  {
    author: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author user ID is required']
      },
      name: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
      },
      username: {
        type: String,
        required: [true, 'Author username is required'],
        trim: true
      },
      avatar: {
        type: String,
        default: ''
      },
      badge: {
        type: String,
        default: 'Member'
      }
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'Post content cannot exceed 2000 characters']
    },
    imageUrl: {
      type: String,
      trim: true
    },
    // Embedded array of likes (no separate collection)
    likes: [likeSchema],
    likeCount: {
      type: Number,
      default: 0
    },
    // Embedded array of comments (no separate collection)
    comments: [commentSchema],
    commentCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'posts'
  }
);

// Validation: A post must contain at least text content or an image
postSchema.pre('validate', function (next) {
  const hasContent = typeof this.content === 'string' && this.content.trim().length > 0;
  const hasImage = typeof this.imageUrl === 'string' && this.imageUrl.trim().length > 0;

  if (!hasContent && !hasImage) {
    this.invalidate('content', 'A post must contain at least text content or an image URL.');
  }

  // Ensure empty whitespace strings are reset to undefined/empty
  if (this.content && !hasContent) {
    this.content = undefined;
  }
  if (this.imageUrl && !hasImage) {
    this.imageUrl = undefined;
  }

  next();
});

// Indexes for high-performance feed queries and user profile filtering
postSchema.index({ createdAt: -1 });
postSchema.index({ 'author.userId': 1 });
postSchema.index({ likeCount: -1 });
postSchema.index({ commentCount: -1 });

const Post = mongoose.model('Post', postSchema, 'posts');

export default Post;
