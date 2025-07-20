'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isPhoneVendor, isLaptopVendor, isAdmin, isRestaurantAdmin, hasAdminPrivileges } from '@/lib/auth';

const VendorNavigation: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  // Only show for admin users, not for vendors (they get auto-redirected)
  if (!user || user.role !== 'admin') {
    return null;
  }

  const navigationItems = [];

  // Add admin dashboard if user is admin
  if (user.role === 'admin') {
    navigationItems.push({
      href: '/admin/dashboard',
      label: 'Admin Dashboard',
      icon: '👑',
      description: 'Manage all services and users',
      color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
    });

    // Admin can also access vendor dashboards
    navigationItems.push({
      href: '/admin/phone-vendor',
      label: 'Phone Vendor Dashboard',
      icon: '📱',
      description: 'Manage phone repair orders',
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
    });

    navigationItems.push({
      href: '/admin/laptop-vendor',
      label: 'Laptop Vendor Dashboard',
      icon: '💻',
      description: 'Manage laptop repair orders',
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
    });

    navigationItems.push({
      href: '/admin/restaurant',
      label: 'Restaurant Admin Dashboard',
      icon: '🍽️',
      description: 'Manage restaurant orders and menu',
      color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
    });
  }

  if (navigationItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`block p-4 border rounded-lg transition-colors ${item.color}`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{item.icon}</div>
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm opacity-75">{item.description}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VendorNavigation;
