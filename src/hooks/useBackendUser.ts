import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserData } from '@/lib/utils';

interface WalletInfo {
  walletId: string;
  walletAddress: string;
}

interface BackendUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isActive: boolean;
  totalOrders: number;
  hasWallet: boolean;
  defaultChain: string;
  wallets: {
    [chain: string]: WalletInfo;
  };
}

export function useBackendUser() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<BackendUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      if (!currentUser?.uid) {
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/users/uid/${currentUser.uid}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserData(data.data);
          } else {
            setError('Failed to load user data');
          }
        } else {
          setError('Failed to load user data');
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [currentUser?.uid]);

  const refreshUserData = async () => {
    if (currentUser?.uid) {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/users/uid/${currentUser.uid}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserData(data.data);
          }
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    userData,
    loading,
    error,
    refreshUserData,
  };
}
