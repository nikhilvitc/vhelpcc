'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';
import { getCurrentUserSync, isAuthenticated, useAuthListener } from '@/lib/auth';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial auth check
    const currentUser = getCurrentUserSync();
    setUser(currentUser);
    setIsLoading(false);

    // Listen for auth changes
    const unsubscribe = useAuthListener((userData) => {
      setUser(userData);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    isAuthenticated: isAuthenticated(),
    isLoading
  };
}
