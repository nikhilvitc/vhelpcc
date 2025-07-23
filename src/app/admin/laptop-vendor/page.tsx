'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import DashboardStats from '@/components/admin/DashboardStats';
import OrderManagement from '@/components/admin/OrderManagement';

import ServiceControls from '@/components/admin/ServiceControls';
import VendorAnalytics from '@/components/admin/VendorAnalytics';
import useRealtimeOrders from '@/hooks/useRealtimeOrders';

const LaptopVendorDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');


  // Real-time orders for laptop vendor
  const { getTodaysOrders, getOrdersByStatus } = useRealtimeOrders({
    serviceType: 'laptop',
    vendorRole: 'laptop_vendor'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        router.push('/login?redirect=/admin/laptop-vendor');
        return;
      }

      if (currentUser.role !== 'laptop_vendor' && currentUser.role !== 'admin') {
        router.push('/');
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login?redirect=/admin/laptop-vendor');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">💻 Laptop Vendor Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Laptop Vendor
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
                    ? 'border-purple-500 text-purple-600'
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Laptop Repair Dashboard</h2>
              <p className="text-gray-600">
                Monitor your laptop repair service performance and manage orders efficiently.
              </p>
            </div>
            
            <DashboardStats serviceType="laptop" />
            
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
                  <div className="text-sm text-gray-500">Manage laptop repair orders</div>
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="font-medium text-gray-900">Service Settings</div>
                  <div className="text-sm text-gray-500">Configure laptop repair service</div>
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

            {/* Laptop-specific features */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Laptop Service Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="font-medium text-gray-900">Hardware Repairs</div>
                  <div className="text-sm text-gray-500">Screen, keyboard, motherboard</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">💾</div>
                  <div className="font-medium text-gray-900">Data Recovery</div>
                  <div className="text-sm text-gray-500">HDD/SSD data retrieval</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">🛡️</div>
                  <div className="font-medium text-gray-900">Virus Removal</div>
                  <div className="text-sm text-gray-500">Malware & virus cleaning</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">⬆️</div>
                  <div className="font-medium text-gray-900">Upgrades</div>
                  <div className="text-sm text-gray-500">RAM, SSD, GPU upgrades</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Laptop Repair Orders</h2>
              <p className="text-gray-600">
                Manage all laptop repair orders, update statuses, and track progress.
              </p>
            </div>
            
            <OrderManagement 
              serviceType="laptop" 
              vendorRole="laptop_vendor"
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Laptop Repair Analytics</h2>
              <p className="text-gray-600">
                Detailed analytics and performance metrics for your laptop repair service.
              </p>
            </div>

            <VendorAnalytics serviceType="laptop" />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Laptop Service Settings</h2>
              <p className="text-gray-600">
                Configure your laptop repair service settings, pricing, and availability.
              </p>
            </div>

            <ServiceControls serviceType="laptop" />
            
            {/* Laptop-specific settings */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Laptop Service Specializations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Supported Brands</h4>
                  <div className="space-y-2">
                    {['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Apple MacBook', 'MSI', 'Razer'].map(brand => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Service Types</h4>
                  <div className="space-y-2">
                    {[
                      'Screen Replacement',
                      'Keyboard Repair',
                      'Battery Replacement',
                      'Motherboard Repair',
                      'Data Recovery',
                      'Virus Removal',
                      'Hardware Upgrades',
                      'Software Installation'
                    ].map(service => (
                      <label key={service} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>


    </div>
  );
};

export default LaptopVendorDashboard;
