import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

interface UseDashboardUpdatesProps {
  onDataChange: () => void;
  enabled?: boolean;
}

export function useDashboardUpdates({ onDataChange, enabled = true }: UseDashboardUpdatesProps) {
  const { user } = useAuth();
  const lastUpdateRef = useRef<Date>(new Date());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function with shorter delay
  const triggerUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const now = new Date();
      // Only trigger if it's been at least 1 second since last update (reduced from 2 seconds)
      if (now.getTime() - lastUpdateRef.current.getTime() > 1000) {
        lastUpdateRef.current = now;
        onDataChange();
      }
    }, 300); // Reduced from 500ms
  }, [onDataChange]);

  // Listen for storage events (cross-tab communication)
  useEffect(() => {
    if (!enabled || !user) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('dashboard-update-')) {
        console.log('Dashboard update triggered via storage event');
        triggerUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [enabled, user, triggerUpdate]);

  // Listen for focus events (when user returns to tab)
  useEffect(() => {
    if (!enabled || !user) return;

    const handleFocus = () => {
      const now = new Date();
      // If it's been more than 2 minutes since last update, refresh (reduced from 5 minutes)
      if (now.getTime() - lastUpdateRef.current.getTime() > 2 * 60 * 1000) {
        console.log('Dashboard update triggered via focus event');
        triggerUpdate();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, user, triggerUpdate]);

  // Listen for visibility change events
  useEffect(() => {
    if (!enabled || !user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = new Date();
        // If it's been more than 1 minute since last update, refresh
        if (now.getTime() - lastUpdateRef.current.getTime() > 1 * 60 * 1000) {
          console.log('Dashboard update triggered via visibility change');
          triggerUpdate();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, user, triggerUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Function to notify other tabs of data changes
  const notifyDataChange = useCallback(() => {
    if (typeof window !== 'undefined') {
      const key = `dashboard-update-${Date.now()}`;
      const data = {
        timestamp: Date.now(),
        type: 'data-change',
        source: 'app'
      };
      localStorage.setItem(key, JSON.stringify(data));
      
      // Clean up old keys (keep only last 5)
      const keys = Object.keys(localStorage).filter(k => k.startsWith('dashboard-update-'));
      if (keys.length > 5) {
        keys.sort().slice(0, keys.length - 5).forEach(k => localStorage.removeItem(k));
      }
      
      console.log('Dashboard update notified:', data);
    }
  }, []);

  return { notifyDataChange };
} 