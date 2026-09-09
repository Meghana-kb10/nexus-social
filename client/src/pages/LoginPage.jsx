import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from '../components/common/Icons';
import { NexusOrb } from '../components/3d/NexusOrb';
import { FloatingBackground3D } from '../components/3d/FloatingBackground3D';

export const LoginPage = ({ onSwitchToSignup }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSigningIn, setIsDemoSigningIn] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both your email and password');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await login({
        email: formData.email.trim(),
        password: formData.password
      });
      // AuthContext updates user state, which automatically transitions to the Feed view
    } catch (err) {
      setError(err.userMessage || err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsDemoSigningIn(true);
      setError('');
      await login({ demo: true });
    } catch (err) {
      setError(err.userMessage || err.message || 'Demo sign-in is unavailable. Please try again later.');
    } finally {
      setIsDemoSigningIn(false);
    }
  };

  return (
    <div className="auth-page-container">
      <FloatingBackground3D />
      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <NexusOrb size={38} showRings={true} showParticles={false} interactive={false} />
            <span>Nexus<span style={{ color: 'var(--accent-blue-light)' }}>Social</span></span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="••••••••"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={isSubmitting || isDemoSigningIn}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-demo-section">
          <span>or</span>
        </div>
        <button
          type="button"
          className="btn-auth-demo"
          onClick={handleDemoLogin}
          disabled={isSubmitting || isDemoSigningIn}
        >
          {isDemoSigningIn ? 'Signing in to demo...' : 'Try Demo Account'}
        </button>

        {/* Footer Toggle */}
        <div className="auth-footer-toggle">
          Don't have an account?
          <button
            type="button"
            className="auth-link-btn"
            onClick={onSwitchToSignup}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
