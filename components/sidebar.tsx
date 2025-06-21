'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { LayoutDashboard, Users, Briefcase, FileText, BarChart2, UserCog, File, Sparkles, Menu, X, Target, CreditCard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavLink {
  href: string;
  label: string;
  role?: 'admin' | 'staff';
  icon: React.ComponentType<{ className?: string }>;
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/leads', label: 'Leads', icon: Target },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/follow-ups', label: 'Follow Ups', icon: FileText },
  { href: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { href: '/documents', label: 'Documents', icon: File },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/staff', label: 'Staff Management', icon: UserCog, role: 'admin' },
  // Add more links here with their required roles
];

const Sidebar: React.FC = () => {
  const { user, loading, hasRole } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return <aside className="w-64 bg-card border-r border-border text-foreground p-6 flex flex-col">Loading sidebar...</aside>;
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
    <>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-card border border-border shadow hover:bg-muted transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-card border-r border-border text-foreground p-6 flex flex-col min-h-screen
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:block
        `}
        aria-label="Sidebar navigation"
      >
        {/* Mobile close button */}
        <button
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="text-2xl font-bold mb-8 tracking-tight flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span>TenantFlow</span>
        </div>
        <nav className="flex flex-col gap-1">
          {filteredLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-sm
                  ${isActive ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted hover:text-foreground text-muted-foreground'}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;