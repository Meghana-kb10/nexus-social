import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { getSuggestedUsers } from '../../api/userApi.js';
import { useReducedMotion } from './useReducedMotion';
import '../../styles/slider3d.css';

const DEFAULT_SPOTLIGHTS = [
  {
    id: 'spotlight-1',
    _id: 'spotlight-1',
    name: 'Elena Rostova',
    username: 'elena_arch',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Legend 👑',
    bio: 'Senior Distributed Systems Engineer & Open Source Contributor.'
  },
  {
    id: 'spotlight-2',
    _id: 'spotlight-2',
    name: 'Marcus Vance',
    username: 'marcus_v',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badge: 'Platinum 💠',
    bio: 'WebGL & Three.js creative developer exploring spatial interactions.'
  },
  {
    id: 'spotlight-3',
    _id: 'spotlight-3',
    name: 'Sophia Chen',
    username: 'sophia_ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badge: 'Member',
    bio: 'AI Safety researcher and fullstack product builder.'
  },
  {
    id: 'spotlight-4',
    _id: 'spotlight-4',
    name: 'Devin Thorne',
    username: 'devin_t',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    badge: 'Gold ⭐',
    bio: 'UI Systems architect focusing on accessibility & micro-animations.'
  },
  {
    id: 'spotlight-5',
    _id: 'spotlight-5',
    name: 'Aria Thorne',
    username: 'aria_dev',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    badge: 'Pro ⚡',
    bio: 'Fullstack developer exploring real-time decentralized webs.'
  }
];

export const SpotlightSlider3D = () => {
  const [items, setItems] = useState(DEFAULT_SPOTLIGHTS);
  const [activeIndex, setActiveIndex] = useState(1);
  const [isFollowingMap, setIsFollowingMap] = useState({});
  const [inFlightId, setInFlightId] = useState(null);
  const { toggleFollowUser, isFollowingUser } = useAuth();
  const { prefersReducedMotion } = useReducedMotion();
  const navigate = useNavigate();

  const stageRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, currentDelta: 0 });

  // Load real suggestions from backend
  useEffect(() => {
    let isMounted = true;
    const fetchCreators = async () => {
      try {
        const res = await getSuggestedUsers();
        if (isMounted && res?.success && Array.isArray(res.users) && res.users.length > 0) {
          // Merge real users with defaults if fewer than 5
          const merged = [...res.users];
          if (merged.length < 5) {
            DEFAULT_SPOTLIGHTS.forEach((d) => {
              if (!merged.find((m) => m._id === d._id || m.username === d.username)) {
                merged.push(d);
              }
            });
          }
          setItems(merged.slice(0, 6));
        }
      } catch (err) {
        // Silent fallback to defaults
      }
    };
    fetchCreators();
    return () => {
      isMounted = false;
    };
  }, []);

  const total = items.length;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!stageRef.current || !stageRef.current.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch / Drag Gestures
  const handleTouchStart = (e) => {
    dragRef.current = {
      isDragging: true,
      startX: e.touches ? e.touches[0].clientX : e.clientX,
      currentDelta: 0
    };
  };

  const handleTouchMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    dragRef.current.currentDelta = currentX - dragRef.current.startX;
  };

  const handleTouchEnd = () => {
    if (!dragRef.current.isDragging) return;
    const { currentDelta } = dragRef.current;
    if (currentDelta > 45) {
      handlePrev();
    } else if (currentDelta < -45) {
      handleNext();
    }
    dragRef.current.isDragging = false;
  };

  const handleFollowToggle = async (userId, e) => {
    e.stopPropagation();
    if (inFlightId) return;
    setInFlightId(userId);
    try {
      if (toggleFollowUser) {
        await toggleFollowUser(userId);
      }
      setIsFollowingMap((prev) => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setInFlightId(null);
    }
  };

  // Compute 3D Coverflow positioning
  const getCardStyle = (index) => {
    const diff = index - activeIndex;
    const absDiff = Math.abs(diff);

    // If reduced motion is preferred: flat 2D layout
    if (prefersReducedMotion) {
      const isVisible = absDiff <= 1;
      return {
        transform: `translateX(${diff * 280}px) scale(${diff === 0 ? 1 : 0.9})`,
        opacity: diff === 0 ? 1 : isVisible ? 0.6 : 0,
        zIndex: 10 - absDiff,
        pointerEvents: diff === 0 ? 'auto' : 'none',
        visibility: isVisible ? 'visible' : 'hidden'
      };
    }

    // Full 3D Coverflow Perspective
    if (diff === 0) {
      return {
        transform: 'translate3d(0, 0, 0) rotateY(0deg) scale(1)',
        zIndex: 10,
        opacity: 1,
        pointerEvents: 'auto',
        visibility: 'visible'
      };
    }

    if (absDiff === 1) {
      const dir = diff > 0 ? 1 : -1;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const xOffset = dir * (isMobile ? 135 : 185);
      const rotY = dir * -26;
      return {
        transform: `translate3d(${xOffset}px, 0, -85px) rotateY(${rotY}deg) scale(0.86)`,
        zIndex: 5,
        opacity: 0.65,
        filter: 'blur(0.3px)',
        pointerEvents: 'auto',
        visibility: 'visible'
      };
    }

    if (absDiff === 2) {
      const dir = diff > 0 ? 1 : -1;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const xOffset = dir * (isMobile ? 220 : 310);
      const rotY = dir * -38;
      return {
        transform: `translate3d(${xOffset}px, 0, -170px) rotateY(${rotY}deg) scale(0.74)`,
        zIndex: 2,
        opacity: 0.25,
        filter: 'blur(1px)',
        pointerEvents: 'none',
        visibility: 'visible'
      };
    }

    // Out of view
    return {
      transform: `translate3d(${diff > 0 ? 400 : -400}px, 0, -260px) scale(0.6)`,
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none',
      visibility: 'hidden'
    };
  };

  return (
    <div className="slider-3d-wrapper" aria-roledescription="carousel" aria-label="Featured Community Creators">
      {/* Header Bar */}
      <div className="slider-3d-header">
        <div className="slider-3d-title-group">
          <span className="slider-3d-title">Spotlight Creators</span>
          <span className="slider-3d-badge">3D Deck</span>
        </div>
        <div className="slider-3d-controls">
          <button
            type="button"
            className="slider-3d-nav-btn"
            onClick={handlePrev}
            aria-label="Previous creator card"
          >
            ‹
          </button>
          <button
            type="button"
            className="slider-3d-nav-btn"
            onClick={handleNext}
            aria-label="Next creator card"
          >
            ›
          </button>
        </div>
      </div>

      {/* 3D Interactive Stage */}
      <div
        ref={stageRef}
        className="slider-3d-stage"
        tabIndex={0}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="slider-3d-track">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const itemId = item._id || item.id;
            const isFollowing = isFollowingUser ? isFollowingUser(itemId) : isFollowingMap[itemId];

            return (
              <div
                key={itemId}
                className={`slider-3d-card ${isActive ? 'active' : ''}`}
                style={getCardStyle(index)}
                onClick={() => {
                  if (!isActive) setActiveIndex(index);
                }}
                role="group"
                aria-label={`Slide ${index + 1} of ${total}: ${item.name}`}
              >
                {/* Avatar with dynamic glow */}
                <div className="slider-card-avatar-wrap">
                  <div className="slider-card-avatar-glow" />
                  <Avatar
                    src={item.avatar}
                    size={52}
                    border={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item._id && !item._id.startsWith('spotlight-')) {
                        navigate(`/profile/${item._id}`);
                      }
                    }}
                  />
                </div>

                {/* Name & Badge */}
                <div
                  className="slider-card-name"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item._id && !item._id.startsWith('spotlight-')) {
                      navigate(`/profile/${item._id}`);
                    }
                  }}
                >
                  <span>{item.name}</span>
                  {item.badge && <Badge label={item.badge} />}
                </div>

                {/* Username */}
                <div className="slider-card-handle">@{item.username}</div>

                {/* Bio */}
                <div className="slider-card-bio">{item.bio || 'Active contributor in the Nexus developer network.'}</div>

                {/* Actions */}
                <div className="slider-card-action-row">
                  <button
                    type="button"
                    className={`slider-card-follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={(e) => handleFollowToggle(itemId, e)}
                    disabled={inFlightId === itemId}
                  >
                    {inFlightId === itemId ? '...' : isFollowing ? 'Following' : '+ Follow'}
                  </button>
                  <button
                    type="button"
                    className="slider-card-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item._id && !item._id.startsWith('spotlight-')) {
                        navigate(`/profile/${item._id}`);
                      } else {
                        setActiveIndex(index);
                      }
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Indicators */}
      <div className="slider-3d-dots">
        {items.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            className={`slider-3d-dot ${dotIdx === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(dotIdx)}
            aria-label={`Jump to creator slide ${dotIdx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
