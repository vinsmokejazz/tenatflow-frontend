'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

interface NavLink {
  href: string;
  label: string;
  role?: 'admin' | 'staff';
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/deals', label: 'Deals' },
  { href: '/reports', label: 'Reports' },
  { href: '/follow-ups', label: 'Follow Ups' },
  { href: '/ai-insights', label: 'AI Insights' },
  { href: '/documents', label: 'Documents' },
  { href: '/dashboard/admin/staff', label: 'Manage Staff', role: 'admin' },
  // Add more links here with their required roles
];

const Sidebar: React.FC = () => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">Loading sidebar...</aside>;
  }

  if (!user) {
    // Should be protected by middleware, but handle defensively
    return null;
  }

  const filteredLinks = navLinks.filter(link => {
    if (link.role) {
      return hasRole(link.role);
    }
    return true; // Link is accessible to any authenticated user
  });

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <div className="text-2xl font-bold mb-6">TenantFlow</div>
      <nav className="flex flex-col space-y-2">
        {filteredLinks.map(link => (
          <Link key={link.href} href={link.href} className="hover:bg-gray-700 p-2 rounded">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;