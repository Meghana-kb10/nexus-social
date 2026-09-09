import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingHashtags } from '../../api/postApi.js';

export const TrendingWidget = () => {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadTrending = async () => {
      try {
        const res = await getTrendingHashtags();
        if (isMounted && res?.success && Array.isArray(res.hashtags)) {
          setHashtags(res.hashtags);
        }
      } catch (err) {
        console.warn('Could not load trending hashtags:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTagClick = (tag) => {
    navigate(`/explore?q=${encodeURIComponent(tag)}`);
  };

  return (
    <>
      <div className="sidebar-widget">
        <h3 className="widget-title">Trending Now</h3>
        <div className="widget-list">
          {loading ? (
            <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Analyzing trends...
            </div>
          ) : hashtags.length > 0 ? (
            hashtags.map((item) => (
              <div
                key={item.tag}
                className="trending-item"
                onClick={() => handleTagClick(item.tag)}
                style={{ cursor: 'pointer' }}
                title={`Explore posts tagged ${item.tag}`}
              >
                <span className="trending-category">Trending</span>
                <span className="trending-topic" style={{ color: 'var(--text-link)', fontWeight: 600 }}>
                  {item.tag}
                </span>
                <span className="trending-count">{item.postsCount}</span>
              </div>
            ))
          ) : (
            <div style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
              No trending hashtags yet.<br />Use <span style={{ color: 'var(--text-link)' }}>#tags</span> in your posts!
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-footer-links">
        <a href="#about">About</a>
        <a href="#terms">Terms</a>
        <a href="#privacy">Privacy</a>
        <a href="#cookies">Cookies</a>
        <span>© 2026 Nexus Social</span>
      </div>
    </>
  );
};
