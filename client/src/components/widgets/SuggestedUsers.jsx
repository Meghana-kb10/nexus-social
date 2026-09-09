import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSuggestedUsers } from '../../api/userApi.js';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

export const SuggestedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inFlightId, setInFlightId] = useState(null);
  const { toggleFollowUser, isFollowingUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadSuggestions = async () => {
      try {
        const res = await getSuggestedUsers();
        if (isMounted && res?.success && Array.isArray(res.users)) {
          setUsers(res.users);
        }
      } catch (err) {
        console.warn('Could not load suggestions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFollowToggle = async (userId, e) => {
    e.stopPropagation();
    if (inFlightId) return;
    setInFlightId(userId);
    try {
      await toggleFollowUser(userId);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setInFlightId(null);
    }
  };

  if (loading) {
    return (
      <div className="sidebar-widget">
        <h3 className="widget-title">Suggested For You</h3>
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Finding members...
        </div>
      </div>
    );
  }

  if (!users.length) {
    return null;
  }

  return (
    <div className="sidebar-widget">
      <h3 className="widget-title">Suggested For You</h3>
      <div className="widget-list">
        {users.map((user) => {
          const userId = user._id || user.id;
          const isFollowing = isFollowingUser(userId);
          const isPending = inFlightId === userId;

          return (
            <div
              key={userId}
              className="suggested-user-item"
              onClick={() => navigate(`/profile/${userId}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="suggested-user-left">
                <Avatar src={user.avatar} size={36} />
                <div className="suggested-user-meta">
                  <span className="suggested-user-name">{user.name}</span>
                  <span className="suggested-user-role">@{user.username}</span>
                </div>
              </div>

              <button
                type="button"
                className={`btn-follow ${isFollowing ? 'following' : ''}`}
                onClick={(e) => handleFollowToggle(userId, e)}
                disabled={isPending}
                aria-label={isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`}
              >
                {isPending ? '...' : isFollowing ? 'Following' : '+ Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
