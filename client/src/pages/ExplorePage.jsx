import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFeed, getTrendingHashtags } from '../api/postApi.js';
import { PostCard } from '../components/feed/PostCard';
import { NexusOrb } from '../components/3d/NexusOrb';
import { NexusSpinner3D } from '../components/3d/NexusSpinner3D';
import { SpotlightSlider3D } from '../components/3d/SpotlightSlider3D';

export const ExplorePage = ({ onToggleLike, onAddComment, onShare }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState(initialQuery || 'all');
  const [trendingTags, setTrendingTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load trending hashtags
  useEffect(() => {
    let isMounted = true;
    const fetchTags = async () => {
      try {
        const res = await getTrendingHashtags();
        if (isMounted && res?.success) {
          setTrendingTags(res.hashtags || []);
        }
      } catch (err) {
        console.warn('Could not load trending tags', err);
      }
    };
    fetchTags();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync URL search params with state
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearch(q);
    setActiveTag(q || 'all');
  }, [searchParams]);

  // Fetch explore feed
  const loadExplorePosts = useCallback(async (queryParam) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFeed({
        search: queryParam || undefined,
        filter: 'popular',
        limit: 20
      });
      if (res?.success) {
        setPosts(res.posts || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load explore feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExplorePosts(search);
  }, [search, loadExplorePosts]);

  const handleTagSelect = (tag) => {
    if (tag === 'all') {
      setActiveTag('all');
      setSearch('');
      setSearchParams({});
    } else {
      setActiveTag(tag);
      setSearch(tag);
      setSearchParams({ q: tag });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Explore Header Hero with 3D Nexus Orb */}
      <div
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, rgba(30, 58, 138, 0.2) 0%, var(--bg-surface) 75%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Large Procedural 3D Orb */}
        <div
          style={{
            marginBottom: '12px',
            filter: 'drop-shadow(0 0 28px rgba(59, 130, 246, 0.22))'
          }}
          aria-hidden="true"
        >
          <NexusOrb size={135} showRings={true} showParticles={true} interactive={true} />
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Explore Nexus
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', maxWidth: '440px' }}>
          Discover popular conversations, trending topics, and new creators across the network.
        </p>

        {/* Tag Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            className={`filter-tab-btn ${activeTag === 'all' ? 'active' : ''}`}
            onClick={() => handleTagSelect('all')}
          >
            🔥 All Popular
          </button>
          {trendingTags.map((item) => (
            <button
              key={item.tag}
              type="button"
              className={`filter-tab-btn ${activeTag === item.tag ? 'active' : ''}`}
              onClick={() => handleTagSelect(item.tag)}
            >
              {item.tag} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {/* 3D Spotlight Creators Deck */}
      <SpotlightSlider3D />

      {/* Posts Stream */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <NexusSpinner3D size={42} label="Discovering posts..." />
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
      ) : posts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onToggleLike={onToggleLike}
              onAddComment={onAddComment}
              onShare={onShare}
            />
          ))}
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
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No posts found for {search ? `"${search}"` : 'explore'}
          </p>
          <p style={{ fontSize: '0.84rem' }}>
            Try exploring a different tag or check back later!
          </p>
        </div>
      )}
    </div>
  );
};
