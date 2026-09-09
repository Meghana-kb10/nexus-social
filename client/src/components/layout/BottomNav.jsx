import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, ExploreIcon, PlusIcon, BellIcon, UserIcon } from '../common/Icons';

export const BottomNav = ({ onOpenCreatePost }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const handleCreateClick = () => {
    if (path !== '/') {
      navigate('/');
      setTimeout(() => {
        if (onOpenCreatePost) onOpenCreatePost();
      }, 100);
    } else {
      if (onOpenCreatePost) onOpenCreatePost();
    }
  };

  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={`bottom-nav-item ${path === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
        aria-label="Home"
      >
        <HomeIcon size={22} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${path === '/explore' ? 'active' : ''}`}
        onClick={() => navigate('/explore')}
        aria-label="Explore"
      >
        <ExploreIcon size={22} />
        <span>Explore</span>
      </button>

      {/* Center Action Button for Create Post */}
      <button
        type="button"
        className="bottom-nav-create-btn"
        onClick={handleCreateClick}
        title="Create Post"
        aria-label="Create Post"
      >
        <PlusIcon size={24} />
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${path === '/notifications' ? 'active' : ''}`}
        onClick={() => navigate('/notifications')}
        aria-label="Notifications"
      >
        <BellIcon size={22} />
        <span>Alerts</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${path === '/profile' ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
        aria-label="Profile"
      >
        <UserIcon size={22} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
