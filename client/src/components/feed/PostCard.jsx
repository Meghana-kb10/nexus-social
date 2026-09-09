import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, CommentIcon, ShareIcon, MoreHorizontalIcon, SendIcon } from '../common/Icons';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useReducedMotion } from '../3d/useReducedMotion';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

export const PostCard = ({ post, onToggleLike, onAddComment, onShare }) => {
  const { user, isFollowingUser, toggleFollowUser } = useAuth();
  const { prefersReducedMotion, isTouchDevice } = useReducedMotion();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [commentError, setCommentError] = useState('');

  const handleCardMouseMove = (e) => {
    if (isTouchDevice || prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -y * 3.2,
      y: x * 3.2,
      active: true
    });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0, active: false });
  };

  const postId = post._id || post.id;
  const authorUserId = post.author?.userId || post.author?.id;
  const isFollowing = isFollowingUser(authorUserId);
  const currentUserId = user?.id || user?._id;
  const isOwnPost = Boolean(currentUserId && authorUserId && currentUserId.toString() === authorUserId.toString());
  const authorName = post.author?.name || 'Anonymous';
  const authorUsername = post.author?.username || 'user';
  const authorAvatar = post.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  const authorBadge = post.author?.badge || null;
  const authorTier = post.author?.tier || null;

  const displayTime = post.createdAt ? formatRelativeTime(post.createdAt) : (post.timestamp || 'Just now');
  const displayContent = post.content || post.text || '';
  const displayImage = post.imageUrl || post.image || null;

  const isLiked = Boolean(
    currentUserId &&
    post.likes &&
    Array.isArray(post.likes) &&
    post.likes.some(
      (like) => (like.userId === currentUserId || like.userId?.toString() === currentUserId.toString())
    )
  );

  const likesCount = post.likeCount ?? post.likesCount ?? 0;
  const commentsCount = post.commentCount ?? post.commentsCount ?? (post.comments ? post.comments.length : 0);
  const sharesCount = post.sharesCount ?? 0;

  // Like tooltip displaying real usernames of who liked the post
  const likeTooltip = post.likes && post.likes.length > 0
    ? `Liked by: ${post.likes.map(l => `@${l.username || 'user'}`).join(', ')}`
    : isLiked ? 'You liked this' : 'Like post';

  // Toggle like with duplicate-submission guard
  const handleLikeClick = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onToggleLike(postId);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  // Submit comment with validation & in-flight guard
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    if (isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentError('');

    try {
      await onAddComment(postId, trimmed);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
      setCommentError(err.userMessage || 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <article
      ref={cardRef}
      className="post-card"
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      style={{
        transform: tilt.active
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-2px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: tilt.active ? 'transform 0.08s ease-out' : 'transform 0.35s ease, box-shadow 0.35s ease',
        boxShadow: tilt.active
          ? '0 14px 30px -4px rgba(0, 0, 0, 0.5), 0 0 16px rgba(37, 99, 235, 0.12)'
          : 'var(--shadow-card)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Post Header */}
      <div className="post-header">
        <div
          className="post-author-block"
          onClick={() => authorUserId && navigate(`/profile/${authorUserId}`)}
          style={{ cursor: 'pointer' }}
          title={`View ${authorName}'s profile`}
        >
          <Avatar src={authorAvatar} size={42} />
          <div className="post-author-meta">
            <div className="post-author-line1">
              <span className="post-author-name">{authorName}</span>
              {authorBadge && (
                <Badge label={authorBadge} tier={authorTier} />
              )}
            </div>
            <div className="post-author-line2">
              <span>@{authorUsername}</span>
              <span>•</span>
              <span>{displayTime}</span>
            </div>
          </div>
        </div>

        <div className="post-header-actions">
          {!isOwnPost && authorUserId && (
            <button
              type="button"
              className={`btn-post-follow ${isFollowing ? 'following' : ''}`}
              onClick={async () => {
                if (isUpdatingFollow) return;
                setIsUpdatingFollow(true);
                try {
                  await toggleFollowUser(authorUserId);
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsUpdatingFollow(false);
                }
              }}
              disabled={isUpdatingFollow}
              aria-label={isFollowing ? `Unfollow @${authorUsername}` : `Follow @${authorUsername}`}
            >
              {isUpdatingFollow ? '...' : isFollowing ? 'Following' : '+ Follow'}
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-more-options"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post options"
            >
              <MoreHorizontalIcon size={18} />
            </button>

            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '36px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px',
                  boxShadow: 'var(--shadow-elevated)',
                  zIndex: 20,
                  minWidth: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <button
                  type="button"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/post/${postId}`);
                  }}
                >
                  View Post
                </button>
                <button
                  type="button"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  onClick={() => {
                    onShare(postId);
                    setShowMenu(false);
                  }}
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Tag/Badge (if present) */}
      {post.tag && (
        <span className="post-tag-pill">
          <span>{post.tag}</span>
        </span>
      )}

      {/* Post Text Content */}
      {displayContent && <p className="post-text">{displayContent}</p>}

      {/* Post Attached Media / Image (if present) */}
      {displayImage && (
        <div className="post-image-container">
          <img
            src={displayImage}
            alt={displayContent ? `Photo for post by @${authorUsername}: ${displayContent.slice(0, 40)}` : `Media attached to post by @${authorUsername}`}
            className="post-media-image"
            loading="lazy"
          />
        </div>
      )}

      {/* Post Action Footer */}
      <div className="post-actions-footer">
        {/* Like Button */}
        <button
          type="button"
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          disabled={isLiking}
          title={likeTooltip}
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
          style={{ opacity: isLiking ? 0.65 : 1, cursor: isLiking ? 'not-allowed' : 'pointer' }}
        >
          <HeartIcon size={19} filled={isLiked} />
          <span>{likesCount}</span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          className={`post-action-btn ${showComments ? 'comment-active' : ''}`}
          onClick={() => setShowComments(!showComments)}
          aria-label="Toggle comments"
        >
          <CommentIcon size={19} />
          <span>{commentsCount}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          className="post-action-btn"
          onClick={() => onShare(postId)}
          aria-label="Share post"
        >
          <ShareIcon size={18} />
          <span>{sharesCount}</span>
        </button>
      </div>

      {/* Comment Section (Accordion Drawer) */}
      {showComments && (
        <div className="comment-drawer">
          {/* New Comment Input */}
          <form className="comment-input-row" onSubmit={handleCommentSubmit}>
            <Avatar src={user?.avatar || authorAvatar} size={30} />
            <div className="comment-input-wrap">
              <input
                type="text"
                placeholder="Write a comment..."
                aria-label="Write a comment"
                className="comment-field"
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  if (commentError) setCommentError('');
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-send-comment"
              aria-label="Submit comment reply"
              disabled={!commentText.trim() || isSubmittingComment}
              style={{ opacity: isSubmittingComment ? 0.7 : 1, cursor: isSubmittingComment ? 'not-allowed' : 'pointer' }}
            >
              {isSubmittingComment ? 'Posting...' : 'Reply'}
            </button>
          </form>

          {/* Comment Error Alert */}
          {commentError && (
            <div
              style={{
                color: '#f87171',
                fontSize: '0.78rem',
                margin: '4px 0 8px 40px',
                padding: '4px 10px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(239, 68, 68, 0.25)'
              }}
            >
              {commentError}
            </div>
          )}

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="comment-list">
              {post.comments.map((comment) => {
                const commentId = comment._id || comment.id;
                const commentUsername = comment.username || comment.author?.username || 'user';
                const commentAvatar = comment.avatar || comment.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                const commentTime = comment.createdAt ? formatRelativeTime(comment.createdAt) : (comment.timestamp || 'Just now');
                return (
                  <div key={commentId} className="comment-item">
                    <div className="comment-avatar">
                      <Avatar src={commentAvatar} size={28} />
                    </div>
                    <div className="comment-content">
                      <div className="comment-author-line">
                        <span className="comment-author-name">@{commentUsername}</span>
                        <span className="comment-time">{commentTime}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      )}
    </article>
  );
};
