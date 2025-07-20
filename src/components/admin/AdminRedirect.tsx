'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            // Admins can choose which dashboard to access
            router.push('/admin/dashboard');
            break;
          case 'phone_vendor':
            router.push('/admin/phone-vendor');
            break;
          case 'laptop_vendor':
            router.push('/admin/laptop-vendor');
            break;
          case 'restaurant_admin':
            router.push('/admin/restaurant');
            break;
          default:
            // Regular users go to home
            router.push('/');
            break;
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        router.push('/login');
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}
