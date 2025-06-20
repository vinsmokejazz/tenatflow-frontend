'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;

  const navigation = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contacts', label: 'Contacts', roles: ['admin', 'staff'] },
    { href: '/deals', label: 'Deals', roles: ['admin', 'staff'] },
    { href: '/reports', label: 'Reports', roles: ['admin'] },
    { href: '/follow-ups', label: 'Follow Ups', roles: ['admin', 'staff'] },
    { href: '/ai-insights', label: 'AI Insights', roles: ['admin', 'staff'] },
    { href: '/documents', label: 'Documents', roles: ['admin', 'staff'] },
    { href: '/dashboard/admin/staff', label: 'Manage Staff', roles: ['admin'] },
    // Add other navigation items here
  ];

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) {
      // Item is accessible to all authenticated users
      return !!user;
    }
    // Item is accessible if user is authenticated and has one of the specified roles
    return user && item.roles.includes(userRole);
  });

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Sidebar</h2>
      <nav>
        <ul>
          {filteredNavigation.map(item => (
            <li key={item.href} className="mb-2">
              <Link href={item.href} className="hover:text-gray-300">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      </ul>
    </div>
  );
};

export default Sidebar;