'use client';

import { useAuth } from '@/contexts/AuthContext';
import P2PNavbar from '@/components/Navbar';

export default function NavbarWrapper() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return <P2PNavbar />;
} 