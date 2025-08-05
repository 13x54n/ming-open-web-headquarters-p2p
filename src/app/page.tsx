'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthContainer from '@/components/auth/AuthContainer';
import DashboardPage from '@/app/dashboard/page';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser ? <DashboardPage /> : <AuthContainer />}
    </>
  );
}


