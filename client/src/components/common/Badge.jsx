import React from 'react';

export const Badge = ({ label, tier = null, className = '' }) => {
  if (!label) return null;

  const lower = label.toLowerCase();
  let badgeClass = 'badge-tier';

  if (lower.includes('legend')) {
    badgeClass += ' badge-legend';
  } else if (lower.includes('platinum')) {
    badgeClass += ' badge-platinum';
  } else if (lower.includes('gold')) {
    badgeClass += ' badge-gold';
  } else if (lower.includes('pro')) {
    badgeClass += ' badge-pro';
  } else if (lower.includes('creator')) {
    badgeClass += ' badge-creator';
  } else {
    badgeClass += ' badge-legend';
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      {tier && <span style={{ opacity: 0.85 }}>{tier}</span>}
      {lower.includes('legend') && '👑'}
      {lower.includes('platinum') && '💠'}
      {lower.includes('gold') && '⭐'}
      <span>{label}</span>
    </span>
  );
};
