'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { sendUserToBackend, logoutFromBackend } from '@/lib/utils';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isNewUser: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  resetWelcomeState: () => void;
  markWelcomeAsSeen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      // User data will be sent to backend in onAuthStateChanged callback
      // This prevents duplicate calls
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      // Call backend logout endpoint if user is logged in
      if (currentUser?.uid) {
        await logoutFromBackend(currentUser.uid);
      }
      
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {

      // Still sign out from Firebase even if backend fails
      await signOut(auth);
    }
  }

  async function updateUserProfile(displayName: string) {
    if (currentUser) {
      await updateProfile(currentUser, { displayName });
    } else {
      throw new Error('No user logged in');
    }
  }

  function resetWelcomeState() {
    if (currentUser) {
      try {
        localStorage.removeItem(`welcome-seen-${currentUser.uid}`);
        setIsNewUser(true);
      } catch (error) {
        setIsNewUser(true);
      }
    }
  }

  function markWelcomeAsSeen() {
    if (currentUser) {
      try {
        localStorage.setItem(`welcome-seen-${currentUser.uid}`, 'true');
        setIsNewUser(false);
      } catch (error) {
        setIsNewUser(false);
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Send user data to backend for existing users (sync on page load/refresh)
        await sendUserToBackend(user.uid, user.email, user.displayName, user.photoURL);
        
        // Check if this user has seen the welcome before using localStorage
        try {
          const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user.uid}`);
          
          if (!hasSeenWelcome) {
            // This is a new user or returning user who hasn't seen welcome
            setIsNewUser(true);
          } else {
            setIsNewUser(false);
          }
        } catch (error) {
          // If localStorage fails (e.g., private browsing), treat as new user
          setIsNewUser(true);
        }
      } else {
        setIsNewUser(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    isNewUser,
    signInWithGoogle,
    logout,
    updateUserProfile,
    resetWelcomeState,
    markWelcomeAsSeen,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 