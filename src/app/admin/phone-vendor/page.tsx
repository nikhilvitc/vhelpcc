'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isPhoneVendor, logout } from '@/lib/auth';
import DashboardStats from '@/components/admin/DashboardStats';
import OrderManagement from '@/components/admin/OrderManagement';

import ServiceControls from '@/components/admin/ServiceControls';
import VendorAnalytics from '@/components/admin/VendorAnalytics';
import { RepairOrder } from '@/lib/repair-api';
import useRealtimeOrders from '@/hooks/useRealtimeOrders';

const PhoneVendorDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');


  // Real-time orders for phone vendor
  const { getTodaysOrders, getOrdersByStatus } = useRealtimeOrders({
    serviceType: 'phone',
    vendorRole: 'phone_vendor'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        router.push('/login?redirect=/admin/phone-vendor');
        return;
      }

      if (currentUser.role !== 'phone_vendor' && currentUser.role !== 'admin') {
        router.push('/');
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login?redirect=/admin/phone-vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOrderUpdate = (orderId: string, newStatus: string, notes?: string) => {
    // This will be handled by the OrderManagement component
    // We can add additional logic here if needed
    console.log('Order updated:', { orderId, newStatus, notes });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'orders', name: 'Orders', icon: '📋' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'settings', name: 'Service Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">📱 Phone Vendor Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Phone Vendor
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Phone Repair Dashboard</h2>
              <p className="text-gray-600">
                Monitor your phone repair service performance and manage orders efficiently.
              </p>
            </div>
            
            <DashboardStats serviceType="phone" />
            
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-medium text-gray-900">View All Orders</div>
                  <div className="text-sm text-gray-500">Manage phone repair orders</div>
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="font-medium text-gray-900">Service Settings</div>
                  <div className="text-sm text-gray-500">Configure phone repair service</div>
                </button>
                
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-gray-900">Analytics</div>
                  <div className="text-sm text-gray-500">View detailed reports</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone Repair Orders</h2>
              <p className="text-gray-600">
                Manage all phone repair orders, update statuses, and track progress.
              </p>
            </div>
            
            <OrderManagement 
              serviceType="phone" 
              vendorRole="phone_vendor"
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone Repair Analytics</h2>
              <p className="text-gray-600">
                Detailed analytics and performance metrics for your phone repair service.
              </p>
            </div>

            <VendorAnalytics serviceType="phone" />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone Service Settings</h2>
              <p className="text-gray-600">
                Configure your phone repair service settings, pricing, and availability.
              </p>
            </div>

            <ServiceControls serviceType="phone" />
          </div>
        )}
      </main>


    </div>
  );
};

export default PhoneVendorDashboard;
