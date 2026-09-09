import React from 'react';

export const FeedFilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Posts' },
    { id: 'latest', label: 'Latest' },
    { id: 'popular', label: 'Popular' },
    { id: 'following', label: 'Following' },
  ];

  return (
    <div className="feed-filter-tabs">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            className={`filter-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};
