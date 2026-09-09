import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogoIcon, HomeIcon, ExploreIcon, BellIcon, UserIcon } from '../common/Icons';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../api/userApi';
import { NexusOrb } from '../3d/NexusOrb';

export const LeftSidebar = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchNotifCount = async () => {
      try {
        const res = await getNotifications();
        if (isMounted && res?.success) {
          setUnreadCount(res.count || 0);
        }
      } catch (e) {
        // silent fallback
      }
    };

    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000); // 30s poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { to: '/', label: 'Home', icon: HomeIcon, end: true },
    { to: '/explore', label: 'Explore', icon: ExploreIcon },
    { to: '/notifications', label: 'Notifications', icon: BellIcon, badge: unreadCount > 0 ? unreadCount : null },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const displayName = user?.name || 'User';
  const displayUsername = user?.username || 'user';
  const displayAvatar = user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  return (
    <aside className="left-sidebar-wrapper">
      <div className="left-sidebar-card">
        {/* Brand Logo Box */}
        <div className="sidebar-brand-box" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <NexusOrb size={32} showRings={true} showParticles={false} interactive={false} />
          <div className="brand-title">
            Nexus<span className="brand-accent">.</span>
          </div>
        </div>

        {/* Navigation List */}
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.to} className="sidebar-nav-item">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                >
                  <div className="sidebar-nav-link-content">
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* User Mini Profile Card & Logout */}
        <div className="sidebar-user-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
            title="View my profile"
          >
            <Avatar src={displayAvatar} size={38} border />
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <span className="sidebar-user-name">{displayName}</span>
              <span className="sidebar-user-handle">@{displayUsername}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-follow"
            style={{
              width: '100%',
              borderColor: 'var(--border-subtle)',
              color: '#f87171',
              padding: '6px 12px',
              fontSize: '0.78rem'
            }}
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
};
