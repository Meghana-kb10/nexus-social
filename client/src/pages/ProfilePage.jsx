import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../api/userApi.js';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { PostCard } from '../components/feed/PostCard';
import { NexusOrb } from '../components/3d/NexusOrb';
import { NexusSpinner3D } from '../components/3d/NexusSpinner3D';

import { DEFAULT_SPOTLIGHTS, INITIAL_POSTS } from '../data/dummyData.js';

export const ProfilePage = ({ onToggleLike, onAddComment, onShare }) => {
  const { userId: paramUserId } = useParams();
  const { user: currentUser, isFollowingUser, toggleFollowUser } = useAuth();
  const navigate = useNavigate();

  const targetUserId = paramUserId || currentUser?.id || currentUser?._id;
  const isOwnProfile = Boolean(
    currentUser && targetUserId && (currentUser.id || currentUser._id).toString() === targetUserId.toString()
  );

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!targetUserId) return;
      setLoading(true);
      setError(null);

      const targetIdStr = targetUserId.toString();
      // Handle mock or spotlight creators
      if (targetIdStr.startsWith('spotlight-') || targetIdStr.startsWith('u_')) {
        const creator = DEFAULT_SPOTLIGHTS.find((s) => s.id === targetIdStr || s._id === targetIdStr) || {
          name: 'Featured Creator',
          username: targetIdStr,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          badge: 'Creator 🌟',
          bio: 'Nexus network featured creator and community member.'
        };

        const creatorPosts = INITIAL_POSTS.filter((p) => p.author?.username === creator.username);

        if (isMounted) {
          setProfileData({
            success: true,
            user: {
              _id: targetIdStr,
              name: creator.name,
              username: creator.username,
              avatar: creator.avatar,
              badge: creator.badge,
              bio: creator.bio,
              createdAt: new Date().toISOString()
            },
            stats: {
              postsCount: creatorPosts.length || 2,
              followersCount: 1420,
              followingCount: 96
            },
            posts: creatorPosts.length > 0 ? creatorPosts : [
              {
                id: `post_${targetIdStr}_1`,
                _id: `post_${targetIdStr}_1`,
                author: {
                  _id: targetIdStr,
                  id: targetIdStr,
                  name: creator.name,
                  username: creator.username,
                  avatar: creator.avatar,
                  badge: creator.badge
                },
                content: `Excited to connect with everyone on NexusSocial! Building real-time apps and fullstack systems with modern web tech. 🚀`,
                createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
                likes: [],
                comments: []
              }
            ]
          });
          setLoading(false);
        }
        return;
      }

      try {
        const res = await getUserProfile(targetUserId);
        if (isMounted && res?.success) {
          setProfileData(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.userMessage || 'Failed to load profile.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [targetUserId]);

  const handleFollowClick = async () => {
    if (isUpdatingFollow || !targetUserId) return;
    setIsUpdatingFollow(true);
    try {
      await toggleFollowUser(targetUserId);
      const targetIdStr = targetUserId.toString();
      if (targetIdStr.startsWith('spotlight-') || targetIdStr.startsWith('u_')) {
        setProfileData((prev) => {
          if (!prev) return prev;
          const wasFollowing = isFollowingUser(targetUserId);
          return {
            ...prev,
            stats: {
              ...prev.stats,
              followersCount: wasFollowing
                ? Math.max(0, (prev.stats?.followersCount || 1) - 1)
                : (prev.stats?.followersCount || 0) + 1
            }
          };
        });
      } else {
        const res = await getUserProfile(targetUserId);
        if (res?.success) setProfileData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <NexusSpinner3D size={42} label="Loading profile..." />
      </div>
    );
  }

  if (error || !profileData?.user) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 20px',
          textAlign: 'center'
        }}
      >
        <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '8px' }}>User Not Found</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>{error || 'This profile does not exist.'}</p>
        <button
          type="button"
          className="filter-tab-btn active"
          onClick={() => navigate('/')}
        >
          Return Home
        </button>
      </div>
    );
  }

  const { user, stats, posts } = profileData;
  const isFollowing = isFollowingUser(targetUserId);

  const formattedJoined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Profile Header Card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Floating 3D Nexus Orb in Header */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-10px',
            opacity: 0.9,
            pointerEvents: 'none',
            zIndex: 1,
            filter: 'drop-shadow(0 0 24px rgba(59, 130, 246, 0.2))'
          }}
          aria-hidden="true"
        >
          <NexusOrb size={130} showRings={true} showParticles={true} interactive={false} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Avatar src={user.avatar} size={70} border />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user.name}</h1>
                {user.badge && <Badge label={user.badge} />}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                @{user.username} • Joined {formattedJoined}
              </div>
              {user.email && isOwnProfile && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                  📧 {user.email}
                </div>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <button
              type="button"
              className={`btn-follow ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowClick}
              disabled={isUpdatingFollow}
              style={{ padding: '8px 22px', fontSize: '0.88rem' }}
            >
              {isUpdatingFollow ? '...' : isFollowing ? 'Following' : '+ Follow'}
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '12px',
            marginTop: '22px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.totalPosts ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Posts
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-link)' }}>
              {stats?.totalLikesReceived ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Likes Received
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
              {stats?.totalCommentsReceived ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Comments
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.followingCount ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Following
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.followersCount ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Followers
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', padding: '0 4px' }}>
          {isOwnProfile ? 'Your Posts' : `${user.name}'s Posts`} ({posts?.length || 0})
        </h2>

        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onToggleLike={onToggleLike}
              onAddComment={onAddComment}
              onShare={onShare}
            />
          ))
        ) : (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              No posts yet
            </p>
            <p style={{ fontSize: '0.82rem' }}>
              {isOwnProfile ? 'Share your thoughts on the Home feed to see them here!' : 'This user has not published any posts.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
