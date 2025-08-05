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
import { sendUserToBackend } from '@/lib/utils';

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
      
      // Send user data to backend after successful sign-in
      if (result.user) {
        await sendUserToBackend(result.user.uid, result.user.email);
      }
      
      console.log('User signed in with Google');
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async function logout() {
    await signOut(auth);
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
        console.warn('Failed to reset welcome state:', error);
        setIsNewUser(true);
      }
    }
  }

  function markWelcomeAsSeen() {
    if (currentUser) {
      try {
        localStorage.setItem(`welcome-seen-${currentUser.uid}`, 'true');
        setIsNewUser(false);
        console.log('Welcome marked as seen for user:', currentUser.uid);
      } catch (error) {
        console.warn('Failed to mark welcome as seen:', error);
        setIsNewUser(false);
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Send user data to backend for existing users (sync on page load/refresh)
        await sendUserToBackend(user.uid, user.email);
        
        // Check if this user has seen the welcome before using localStorage
        try {
          const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user.uid}`);
          
          if (!hasSeenWelcome) {
            // This is a new user or returning user who hasn't seen welcome
            setIsNewUser(true);
            console.log('New user or first-time visitor detected');
          } else {
            setIsNewUser(false);
            console.log('Returning user detected');
          }
        } catch (error) {
          // If localStorage fails (e.g., private browsing), treat as new user
          console.warn('localStorage access failed, treating as new user:', error);
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