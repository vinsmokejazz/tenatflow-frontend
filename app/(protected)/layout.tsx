'use client';

import { useState } from 'react';
import React from 'react';
import Sidebar from '@/components/sidebar'; // Use the modern Sidebar
import TopNavbar from '@/components/top-navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <TopNavbar />
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

