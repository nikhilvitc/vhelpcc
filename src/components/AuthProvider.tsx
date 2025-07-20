'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, isAuthenticated, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const refreshAuth = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      setIsLoading(true);

      // Check if user is authenticated
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        // Get current user data
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);

    // Initial auth check
    refreshAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      refreshAuth();
    };

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'auth_token') {
        refreshAuth();
      }
    };

    // Listen for custom auth events
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-changed', handleAuthChange);
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-changed', handleAuthChange);
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading: !isMounted || isLoading,
    isLoggedIn,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
