'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);


  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsPWAInstalled(true);
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    // Store dismissal timestamp in localStorage
    const dismissalData = {
      timestamp: Date.now()
    };
    localStorage.setItem('pwa-install-dismissed', JSON.stringify(dismissalData));

    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show if PWA is already installed
  if (isPWAInstalled) return null;

  // Don't show if prompt is dismissed
  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-120 z-50 bg-background border border-border rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex gap-2 items-center">
            <Image className="w-10 h-10" src="/icons/icon-192x192.png" alt="Ming HQ" width={32} height={32} />
            <div>
              <h3 className="font-semibold text-foreground">Ming HQ</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Install our app for a better experience.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button onClick={handleInstallClick} size="sm">
            Install
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}