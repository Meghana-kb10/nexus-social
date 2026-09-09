import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon, SearchIcon, MoonIcon, ChevronDownIcon } from '../common/Icons';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NexusOrb } from '../3d/NexusOrb';

export const TopHeader = ({ searchQuery = '', setSearchQuery }) => {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user?.name || 'User';
  const displayAvatar = user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  return (
    <header className="top-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NexusOrb size={28} showRings={true} showParticles={false} interactive={false} />
            <span>Nexus<span className="brand-text-accent">Social</span></span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="header-search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">
              <SearchIcon size={18} />
            </span>
            <input
              type="text"
              placeholder="Search posts, users, or tags..."
              className="search-input"
              aria-label="Search posts, users, or tags"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery && setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Controls: Theme & Profile */}
        <div className="header-right">
          <button
            type="button"
            className="icon-btn"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)'
            }}
          >
            {isDark ? <MoonIcon size={18} /> : <span>☀️</span>}
          </button>

          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
              className="user-header-pill"
              title="User Menu"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: 'pointer' }}
            >
              <Avatar src={displayAvatar} size={30} />
              <span className="user-header-name">{displayName}</span>
              <span className="chevron-icon">
                <ChevronDownIcon size={16} />
              </span>
            </div>

            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '42px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  boxShadow: 'var(--shadow-elevated)',
                  zIndex: 60,
                  minWidth: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{displayName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{user?.username}</div>
                </div>

                <button
                  type="button"
                  style={{
                    padding: '8px 10px',
                    fontSize: '0.84rem',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                >
                  <span>👤</span>
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  style={{
                    padding: '8px 10px',
                    fontSize: '0.84rem',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    toggleTheme();
                  }}
                >
                  <span>{isDark ? '☀️' : '🌙'}</span>
                  <span>Theme: {isDark ? 'Dark (Click for Light)' : 'Light (Click for Dark)'}</span>
                </button>

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                <button
                  type="button"
                  style={{
                    padding: '8px 10px',
                    fontSize: '0.84rem',
                    textAlign: 'left',
                    color: '#f87171',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                >
                  <span>🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
