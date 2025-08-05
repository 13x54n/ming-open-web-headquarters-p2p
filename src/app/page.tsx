'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthContainer from '@/components/auth/AuthContainer';
import DashboardPage from '@/app/dashboard/page';
import NewUserWelcome from '@/components/NewUserWelcome';

export default function Home() {
  const { currentUser, isNewUser } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (currentUser && isNewUser) {
      // Add a small delay to ensure localStorage is ready
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
    }
  }, [currentUser, isNewUser]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  return (
    <>
      {currentUser ? (
        <>
          <DashboardPage />
          {showWelcome && (
            <NewUserWelcome
              onComplete={handleWelcomeComplete}
              userName={currentUser.displayName || currentUser.email || undefined}
              userId={currentUser.uid}
            />
          )}
        </>
      ) : (
        <AuthContainer />
      )}
    </>
  );
}


