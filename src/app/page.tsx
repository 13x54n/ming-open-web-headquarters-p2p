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
      setShowWelcome(true);
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


