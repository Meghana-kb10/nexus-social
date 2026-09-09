import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../api/postApi.js';
import { PostCard } from '../components/feed/PostCard';
import { NexusSpinner3D } from '../components/3d/NexusSpinner3D';

export const PostDetailPage = ({ onToggleLike, onAddComment, onShare }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPostById(id);
        if (isMounted && res?.success && res.post) {
          setPost(res.post);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        if (isMounted) setError(err.userMessage || 'Failed to retrieve post');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handlePostLike = async (postId) => {
    const res = await onToggleLike(postId);
    if (res && post) {
      setPost((prev) => ({
        ...prev,
        likes: res.likes || prev.likes,
        likeCount: res.likeCount,
        likesCount: res.likeCount,
        isLiked: res.liked
      }));
    }
    return res;
  };

  const handlePostComment = async (postId, text) => {
    const newComment = await onAddComment(postId, text);
    if (newComment && post) {
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
        commentCount: (prev.commentCount || 0) + 1,
        commentsCount: (prev.commentsCount || 0) + 1
      }));
    }
    return newComment;
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <NexusSpinner3D size={40} label="Loading post..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 20px',
          textAlign: 'center'
        }}
      >
        <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '6px' }}>Post Not Found</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          {error || 'This post may have been removed or the link is broken.'}
        </p>
        <button
          type="button"
          className="filter-tab-btn active"
          onClick={() => navigate('/')}
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          className="btn-follow"
          onClick={() => navigate(-1)}
          style={{ padding: '6px 14px', fontSize: '0.84rem' }}
        >
          ← Back
        </button>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Post Discussion</span>
      </div>

      <PostCard
        post={post}
        onToggleLike={handlePostLike}
        onAddComment={handlePostComment}
        onShare={onShare}
      />
    </div>
  );
};
