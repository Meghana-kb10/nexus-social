import React, { useState } from 'react';
import { TopHeader } from './TopHeader';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { BottomNav } from './BottomNav';
import { FloatingBackground3D } from '../3d/FloatingBackground3D';

export const AppLayout = ({ children, searchQuery, setSearchQuery, onOpenCreatePost, toastMessage }) => {
  return (
    <div className="app-container">
      {/* Ambient 3D procedural background elements */}
      <FloatingBackground3D />

      {/* Top Header */}
      <TopHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main 3-Column Desktop Grid */}
      <main className="main-layout">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Center Content Column (Feed) */}
        <div className="center-feed">
          {children}
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav onOpenCreatePost={onOpenCreatePost} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="feed-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
