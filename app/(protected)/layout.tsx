'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Sidebar from '@/components/sidebar'; // Use the modern Sidebar
import TopNavbar from '@/components/top-navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, backendUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to signin
  useEffect(() => {
    if (!authLoading && !user && !backendUser) {
      router.replace('/signin');
    }
  }, [user, backendUser, authLoading, router]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if user is not authenticated
  if (!user && !backendUser) {
    return null;
  }

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

