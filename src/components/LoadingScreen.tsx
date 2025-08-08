"use client";

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // Hide loading screen after a minimum time
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 300);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#000000] flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
            <img 
              src="/icons/icon.svg" 
              alt="Ming HQ Logo" 
              className="w-20 h-20 text-white"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="text-2xl font-bold text-white hidden">M</span>
          </div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-500/30 rounded-2xl animate-ping"></div>
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Ming HQ</h1>
          <p className="text-muted-foreground">Peer-to-peer escrow for people</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto space-y-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#27ae60] to-[#2ecc71] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-muted-foreground">
            Loading... {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
} 