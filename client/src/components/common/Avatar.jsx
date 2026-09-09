import React from 'react';

export const Avatar = ({ src, alt = 'User avatar', size = 36, border = false, className = '' }) => {
  return (
    <div
      className={`avatar-wrapper ${border ? 'border-active' : ''} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img
        src={src || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
        alt={alt}
        className="avatar-img"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
        }}
      />
    </div>
  );
};
