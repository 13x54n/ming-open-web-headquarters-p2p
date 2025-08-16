"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollPosition() {
  const pathname = useRef<string>('');
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    // Save scroll position when pathname changes
    if (pathname.current && pathname.current !== window.location.pathname) {
      scrollPositions.current[pathname.current] = window.scrollY;
    }

    // Update current pathname
    pathname.current = window.location.pathname;

    // Restore scroll position for current page
    const savedPosition = scrollPositions.current[pathname.current];
    if (savedPosition !== undefined) {
      // Use requestAnimationFrame to ensure the page has rendered
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
      });
    } else {
      // If no saved position, scroll to top
      window.scrollTo(0, 0);
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      scrollPositions.current[pathname.current] = window.scrollY;
    };

    // Save scroll position before page unload
    const handleBeforeUnload = () => {
      scrollPositions.current[pathname.current] = window.scrollY;
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
