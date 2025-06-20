// app/(protected)/layout.tsx

// app/(protected)/layout.tsx

import { useState } from 'react';
import React from 'react';
import Sidebar from '@/components/sidebar'; // Import Sidebar
import TopNavbar from '@/components/top-navbar'; // Import TopNavbar

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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#f0f0f0' }}>
         <Sidebar /> {/* Use the Sidebar component */}
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar */}
        <header style={{ height: '60px', backgroundColor: '#e0e0e0' }}>
          <TopNavbar />
        </header>

        {/* Page Content */}
        <main style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

