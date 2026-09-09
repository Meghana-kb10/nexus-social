import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../api/userApi.js';
import { Avatar } from '../components/common/Avatar';
import { HeartIcon, CommentIcon } from '../components/common/Icons';
import { NexusSpinner3D } from '../components/3d/NexusSpinner3D';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';

  const diffSec = Math.floor((new Date() - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      try {
        const res = await getNotifications();
        if (isMounted && res?.success) {
          setNotifications(res.notifications || []);
        }
      } catch (err) {
        if (isMounted) setError(err.userMessage || 'Could not load alerts');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Notifications
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time activity on your posts from the community.
          </p>
        </div>
        <span
          style={{
            background: 'var(--accent-blue-soft)',
            color: 'var(--text-link)',
            border: '1px solid var(--accent-blue-border)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          {notifications.length} alerts
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <NexusSpinner3D size={40} label="Loading alerts..." />
        </div>
      ) : error ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 20px',
            textAlign: 'center',
            color: '#f87171'
          }}
        >
          <p>{error}</p>
        </div>
      ) : notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => {
            const isLike = n.type === 'like';
            return (
              <div
                key={n.id}
                onClick={() => navigate(`/post/${n.postId}`)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                  boxShadow: 'var(--shadow-card)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue-border)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                {/* Type Icon Indicator */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isLike ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                    color: isLike ? '#ef4444' : 'var(--text-link)'
                  }}
                >
                  {isLike ? <HeartIcon size={18} fill="#ef4444" /> : <CommentIcon size={18} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>@{n.user?.username || 'user'}</strong>{' '}
                    {isLike ? 'liked your post' : `commented: "${n.text}"`}
                  </div>
                  {n.postSnippet && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      Post: "{n.postSnippet}"
                    </div>
                  )}
                </div>

                {/* Time */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {formatRelativeTime(n.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '50px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No notifications yet
          </p>
          <p style={{ fontSize: '0.84rem' }}>
            When someone likes or comments on your posts, you'll find their activity here!
          </p>
        </div>
      )}
    </div>
  );
};
