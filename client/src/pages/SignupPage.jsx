import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from '../components/common/Icons';
import { NexusOrb } from '../components/3d/NexusOrb';
import { FloatingBackground3D } from '../components/3d/FloatingBackground3D';

export const SignupPage = ({ onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.username.trim() || formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await signup({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      // AuthContext updates user state, which automatically transitions to the Feed view
    } catch (err) {
      setError(err.userMessage || err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join the developer and creator community</p>
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
            <label className="auth-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              placeholder="Alex Rivera"
              className="auth-input"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              type="text"
              name="username"
              placeholder="alexdev"
              className="auth-input"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
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
            <label className="auth-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="auth-footer-toggle">
          Already have an account?
          <button
            type="button"
            className="auth-link-btn"
            onClick={onSwitchToLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
