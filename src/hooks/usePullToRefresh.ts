import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface UsePullToRefreshOptions {
  onRefresh?: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  resistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 40,
  maxPullDistance = 100,
  resistance = 0.5
}: UsePullToRefreshOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let isPulling = false;
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        isPulling = true;
        startY = e.touches[0].clientY;
        currentY = startY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;
      
      currentY = e.touches[0].clientY;
      const pullY = currentY - startY;
      
      if (pullY > 0) {
        e.preventDefault();
        // Apply resistance for natural feel
        const resistedPull = pullY * resistance;
        setPullDistance(Math.min(resistedPull, maxPullDistance));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      const finalPull = pullDistance;
      if (finalPull > threshold) {
        setIsRefreshing(true);
        
        try {
          if (onRefresh) {
            await onRefresh();
          }
          
          toast({
            title: "Page refreshed",
            description: "Content has been updated",
          });
        } catch (error) {
          toast({
            title: "Refresh failed",
            description: "Please try again",
            variant: "destructive",
          });
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Animate back to 0 smoothly
        setPullDistance(0);
      }
      
      isPulling = false;
      startY = 0;
      currentY = 0;
    };

    const handleScroll = () => {
      if (window.scrollY > 0) {
        isPulling = false;
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pullDistance, onRefresh, threshold, maxPullDistance, resistance, toast]);

  return {
    isRefreshing,
    pullDistance,
    setPullDistance
  };
}
