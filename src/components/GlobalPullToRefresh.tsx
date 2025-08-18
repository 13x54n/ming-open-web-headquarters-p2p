'use client';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefresh } from './PullToRefresh';

interface GlobalPullToRefreshProps {
  children: React.ReactNode;
}

export function GlobalPullToRefresh({ children }: GlobalPullToRefreshProps) {
  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      // Global refresh - try to refresh data first, then fallback to page reload
      try {
        // Try to refresh any active contexts or data
        if (typeof window !== 'undefined') {
          // Dispatch a custom event that other components can listen to
          window.dispatchEvent(new CustomEvent('app:refresh'));
          
          // Wait a bit for components to handle the refresh
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // If we're on a page that can benefit from a soft refresh, don't reload
          const currentPath = window.location.pathname;
          if (currentPath === '/wallet' || currentPath === '/transactions' || currentPath === '/dashboard') {
            // These pages can benefit from data refresh without full page reload
            return;
          }
        }
        
        // Fallback to page reload for other pages
        window.location.reload();
      } catch (error) {
        // If anything fails, just reload the page
        window.location.reload();
      }
    }
  });

  return (
    <>
      <PullToRefresh isRefreshing={isRefreshing} pullDistance={pullDistance} />
      {children}
    </>
  );
}
