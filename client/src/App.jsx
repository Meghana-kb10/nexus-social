import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { CreatePostCard } from './components/feed/CreatePostCard';
import { FeedFilterTabs } from './components/feed/FeedFilterTabs';
import { PostCard } from './components/feed/PostCard';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExplorePage } from './pages/ExplorePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { getFeed, toggleLike, addComment } from './api/postApi';
import { NexusSpinner3D } from './components/3d/NexusSpinner3D';

function HomeFeed({
  posts,
  pagination,
  isLoadingFeed,
  isLoadingMore,
  loadMoreError,
  feedError,
  activeFilter,
  onFilterChange,
  onLoadMore,
  onAddPost,
  onToggleLike,
  onAddComment,
  onShare,
  searchQuery,
  createPostInputRef,
  onRetry
}) {
  const displayedPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().trim();
    return posts.filter((p) => {
      const content = (p.content || p.text || '').toLowerCase();
      const name = (p.author?.name || '').toLowerCase();
      const username = (p.author?.username || '').toLowerCase();
      return content.includes(q) || name.includes(q) || username.includes(q);
    });
  }, [posts, searchQuery]);

  return (
    <>
      <CreatePostCard onAddPost={onAddPost} inputRef={createPostInputRef} />
      <FeedFilterTabs activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <section className="feed-stream" aria-label="Social Feed">
        {isLoadingFeed ? (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-muted)'
            }}
          >
            <NexusSpinner3D size={40} label="Loading posts..." />
          </div>
        ) : feedError ? (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '30px 20px',
              textAlign: 'center',
              color: '#f87171'
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>Unable to load posts</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {feedError}
            </p>
            <button
              type="button"
              className="filter-tab-btn active"
              style={{ display: 'inline-block', padding: '6px 18px' }}
              onClick={onRetry}
            >
              Retry
            </button>
          </div>
        ) : displayedPosts.length > 0 ? (
          <>
            {displayedPosts.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onToggleLike={onToggleLike}
                onAddComment={onAddComment}
                onShare={onShare}
              />
            ))}

            {!searchQuery.trim() && (
              <div className="feed-pagination-wrap">
                {pagination.hasMore ? (
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <button
                      type="button"
                      className="btn-load-more"
                      onClick={onLoadMore}
                      disabled={isLoadingMore}
                      aria-label="Load more posts"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="auth-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <span>Load More</span>
                      )}
                    </button>
                    {loadMoreError && (
                      <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '10px' }}>
                        {loadMoreError}{' '}
                        <button
                          type="button"
                          onClick={onLoadMore}
                          style={{
                            color: 'var(--text-link)',
                            textDecoration: 'underline',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            marginLeft: '6px'
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="feed-end-notice">
                    <span>You've reached the end.</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : searchQuery.trim() ? (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              No matching posts found
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              Try searching for something else or clearing the search query.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No posts yet
            </p>
            <p style={{ fontSize: '0.88rem' }}>
              Be the first to share something.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Feed State
  const [posts, setPosts] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [feedError, setFeedError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, hasMore: false });
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const createPostInputRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2400);
  };

  // Fetch feed (Page 1)
  const fetchFeed = useCallback(async (filterToFetch = activeFilter) => {
    setIsLoadingFeed(true);
    setFeedError(null);
    setLoadMoreError(null);
    try {
      const res = await getFeed({
        filter: filterToFetch,
        page: 1,
        limit: 10
      });

      if (res && res.posts) {
        setPosts(res.posts);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setFeedError(err.userMessage || 'Failed to load posts. Please try again.');
    } finally {
      setIsLoadingFeed(false);
    }
  }, [activeFilter]);

  // Load More Handler
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasMore) return;

    setIsLoadingMore(true);
    setLoadMoreError(null);
    const nextPage = (pagination.page || 1) + 1;

    try {
      const res = await getFeed({
        filter: activeFilter,
        page: nextPage,
        limit: 10
      });

      if (res && res.posts) {
        setPosts((prevPosts) => {
          const existingIds = new Set(prevPosts.map((p) => (p._id || p.id).toString()));
          const newUnique = res.posts.filter(
            (p) => !existingIds.has((p._id || p.id).toString())
          );
          return [...prevPosts, ...newUnique];
        });

        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load more posts:', err);
      setLoadMoreError(err.userMessage || 'Failed to load more posts. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load feed on mount and when filter changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFeed(activeFilter);
    }
  }, [activeFilter, isAuthenticated, fetchFeed]);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleOpenCreatePost = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      if (createPostInputRef.current) {
        createPostInputRef.current.focus();
        createPostInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleAddPost = (newPost) => {
    setPosts((prev) => {
      const id = (newPost._id || newPost.id)?.toString();
      if (id && prev.some((p) => (p._id || p.id)?.toString() === id)) {
        return prev;
      }
      return [newPost, ...prev];
    });
    setPagination((prev) => ({
      ...prev,
      total: (prev.total || 0) + 1
    }));
    showToast('Post published successfully!');
  };

  const handleToggleLike = async (postId) => {
    try {
      const res = await toggleLike(postId);
      if (res && res.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            const id = post._id || post.id;
            if (id === postId) {
              const currentUserId = user?.id || user?._id;
              let updatedLikes = post.likes || [];
              if (res.likes) {
                updatedLikes = res.likes;
              } else if (res.liked) {
                const exists = updatedLikes.some(
                  (l) => l.userId === currentUserId || l.userId?.toString() === currentUserId?.toString()
                );
                if (!exists) {
                  updatedLikes = [
                    ...updatedLikes,
                    {
                      userId: currentUserId,
                      username: user?.username || 'user',
                      createdAt: new Date().toISOString()
                    }
                  ];
                }
              } else {
                updatedLikes = updatedLikes.filter(
                  (l) => l.userId !== currentUserId && l.userId?.toString() !== currentUserId?.toString()
                );
              }

              return {
                ...post,
                likes: updatedLikes,
                likeCount: res.likeCount,
                likesCount: res.likeCount,
                isLiked: res.liked
              };
            }
            return post;
          })
        );
        return res;
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      showToast(err.userMessage || 'Failed to update like. Please try again.');
      throw err;
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      const res = await addComment(postId, text);
      if (res && res.success && res.comment) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            const id = post._id || post.id;
            if (id === postId) {
              const updatedComments = [...(post.comments || []), res.comment];
              return {
                ...post,
                comments: updatedComments,
                commentCount: res.commentCount,
                commentsCount: res.commentCount
              };
            }
            return post;
          })
        );
        showToast('Comment added!');
        return res.comment;
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      showToast(err.userMessage || 'Failed to add comment. Please try again.');
      throw err;
    }
  };

  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
    }
    showToast('Post link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <NexusSpinner3D size={52} label="Connecting to Nexus Social..." />
      </div>
    );
  }

  // Unauthenticated: Protected Routes redirect to Auth Pages
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/signup" element={<SignupPage onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="/login" element={<LoginPage onSwitchToSignup={() => navigate('/signup')} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated Social Application
  return (
    <AppLayout
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onOpenCreatePost={handleOpenCreatePost}
      toastMessage={toastMessage}
    >
      <Routes>
        <Route
          path="/"
          element={
            <HomeFeed
              posts={posts}
              setPosts={setPosts}
              pagination={pagination}
              isLoadingFeed={isLoadingFeed}
              isLoadingMore={isLoadingMore}
              loadMoreError={loadMoreError}
              feedError={feedError}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              onLoadMore={handleLoadMore}
              onAddPost={handleAddPost}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onShare={handleShare}
              searchQuery={searchQuery}
              createPostInputRef={createPostInputRef}
              onRetry={() => fetchFeed(activeFilter)}
            />
          }
        />
        <Route
          path="/explore"
          element={
            <ExplorePage
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onShare={handleShare}
            />
          }
        />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/profile"
          element={
            <ProfilePage
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onShare={handleShare}
            />
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProfilePage
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onShare={handleShare}
            />
          }
        />
        <Route
          path="/post/:id"
          element={
            <PostDetailPage
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onShare={handleShare}
            />
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
