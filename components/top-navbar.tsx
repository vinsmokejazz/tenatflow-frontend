'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';

const TopNavbar: React.FC = () => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      height: '60px',
      backgroundColor: '#e0e0e0', // Placeholder background
      color: '#333', // Placeholder text color
    }}>
      {/* App Title Placeholder */}
      <div>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>TenantFlow</span>
      </div>

      {/* Right Section: User Profile and Dark Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* User Profile Dropdown Placeholder */}
        <div>
          {/* Use a button to display user email and act as a dropdown trigger */}
          <button style={{
            padding: '8px 12px',
            backgroundColor: '#ccc', // Placeholder button color
            borderRadius: '4px',
            cursor: 'pointer',
            border: 'none',
          }}>
            {/* Display user email if available, otherwise a default */}
            User Email
          </button>
        </div>

        {/* Dark Mode Toggle Placeholder */}
        Dark Mode Toggle
      </div>
    </header>
  );
};

export default TopNavbar;