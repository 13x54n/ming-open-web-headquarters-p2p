import { ArrowDown, Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  isRefreshing: boolean;
  pullDistance: number;
}

export function PullToRefresh({ isRefreshing, pullDistance }: PullToRefreshProps) {
  if (pullDistance <= 0) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-150 ease-out"
      style={{ 
        height: `${pullDistance}px`,
        transform: `translateY(${pullDistance}px)`
      }}
    >
      <div className="flex items-center gap-3 text-primary">
        {isRefreshing ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium">Refreshing...</span>
          </>
        ) : (
          <>
            <ArrowDown 
              className="w-6 h-6 transition-transform duration-200"
              style={{ 
                transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)` 
              }}
            />
            <span className="text-sm font-medium">
              {pullDistance > 40 ? 'Release to refresh' : 'Pull down to refresh'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
