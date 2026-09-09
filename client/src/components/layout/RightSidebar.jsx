import React from 'react';
import { SuggestedUsers } from '../widgets/SuggestedUsers';
import { TrendingWidget } from '../widgets/TrendingWidget';

export const RightSidebar = () => {
  return (
    <aside className="right-sidebar-wrapper">
      <SuggestedUsers />
      <TrendingWidget />
    </aside>
  );
};
