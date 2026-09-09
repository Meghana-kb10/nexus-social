import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signup as apiSignup, login as apiLogin, getMe as apiGetMe } from '../api/authApi.js';
import { toggleFollow as apiToggleFollow } from '../api/userApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check token and restore session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedToken !== 'null' && storedToken !== 'undefined' && storedToken.trim() !== '') {
          setToken(storedToken);

          // Populate initial user state if cached
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              // Ignore JSON parse error on stale storage
            }
          }

          // Verify token against backend and fetch fresh user profile
          const res = await apiGetMe();
          if (res?.success && res?.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          } else {
            // Token invalid on backend
            logout();
          }
        } else {
          // No token stored -> unauthenticated
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.warn('Session restoration failed:', error.userMessage || error.message);
        // Stale or expired token -> clean up
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Signup handler
  const signup = async (credentials) => {
    const res = await apiSignup(credentials);
    if (res?.success && res?.token && res?.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  // Login handler
  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    if (res?.success && res?.token && res?.user) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res?.message || 'Login failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Follow / Unfollow handler
  const toggleFollowUser = async (targetUserId) => {
    const res = await apiToggleFollow(targetUserId);
    if (res?.success) {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          following: res.following || []
        };
        try {
          localStorage.setItem('user', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return res;
    }
    throw new Error(res?.message || 'Failed to update follow status');
  };

  const isFollowingUser = useCallback((targetUserId) => {
    if (!user || !user.following || !targetUserId) return false;
    const targetIdStr = (targetUserId._id || targetUserId).toString();
    return user.following.some((fId) => (fId._id || fId).toString() === targetIdStr);
  }, [user]);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    signup,
    logout,
    toggleFollowUser,
    isFollowingUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
