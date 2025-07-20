'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isRestaurantAdmin, logout } from '@/lib/auth';
import { 
  getRestaurantForAdmin, 
  getRestaurantOrders, 
  getRestaurantMenuItems,
  getRestaurantStats,
  RestaurantStats
} from '@/lib/restaurant-admin-api';
import { Restaurant, FoodOrder, MenuItem } from '@/types/food';
import RestaurantOrderManagement from './RestaurantOrderManagement';
import RestaurantMenuManagement from './RestaurantMenuManagement';
import RestaurantAnalytics from './RestaurantAnalytics';
import RestaurantSettings from './RestaurantSettings';
import AdvancedOrderManagement from './AdvancedOrderManagement';
import CustomerManagement from './CustomerManagement';
import AdvancedAnalytics from './AdvancedAnalytics';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  CogIcon,
  UsersIcon,
  DocumentChartBarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface TabType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

export default function RestaurantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }

      if (!isRestaurantAdmin()) {
        router.push('/');
        return;
      }

      setUser(currentUser);
      await loadRestaurantData();
    };

    checkAuth();
  }, [router]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load restaurant info
      const restaurantResponse = await getRestaurantForAdmin();
      if (!restaurantResponse.success) {
        setError(restaurantResponse.error || 'Failed to load restaurant');
        return;
      }
      setRestaurant(restaurantResponse.data!);

      // Load orders, menu items, and stats in parallel
      const [ordersResponse, menuResponse, statsResponse] = await Promise.all([
        getRestaurantOrders(),
        getRestaurantMenuItems(),
        getRestaurantStats()
      ]);

      if (ordersResponse.success) {
        setOrders(ordersResponse.data || []);
      }

      if (menuResponse.success) {
        setMenuItems(menuResponse.data || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data || null);
      }

    } catch (err: any) {
      console.error('Error loading restaurant data:', err);
      setError(err.message || 'Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const refreshOrders = async () => {
    const ordersResponse = await getRestaurantOrders();
    if (ordersResponse.success) {
      setOrders(ordersResponse.data || []);
    }
    
    // Also refresh stats when orders change
    const statsResponse = await getRestaurantStats();
    if (statsResponse.success) {
      setStats(statsResponse.data || null);
    }
  };

  const refreshMenuItems = async () => {
    const menuResponse = await getRestaurantMenuItems();
    if (menuResponse.success) {
      setMenuItems(menuResponse.data || []);
    }
  };

  const tabs: TabType[] = [
    {
      id: 'orders',
      name: 'Orders',
      icon: ClipboardDocumentListIcon,
      component: () => (
        <RestaurantOrderManagement
          orders={orders}
          onOrderUpdate={refreshOrders}
          restaurant={restaurant}
        />
      )
    },
    {
      id: 'advanced-orders',
      name: 'Advanced Orders',
      icon: FunnelIcon,
      component: () => (
        <AdvancedOrderManagement
          restaurant={restaurant}
          onOrderUpdate={refreshOrders}
        />
      )
    },
    {
      id: 'menu',
      name: 'Menu',
      icon: Squares2X2Icon,
      component: () => (
        <RestaurantMenuManagement
          menuItems={menuItems}
          onMenuUpdate={refreshMenuItems}
          restaurant={restaurant}
        />
      )
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: UsersIcon,
      component: () => (
        <CustomerManagement
          restaurant={restaurant}
        />
      )
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: ChartBarIcon,
      component: () => (
        <RestaurantAnalytics
          stats={stats}
          restaurant={restaurant}
        />
      )
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      icon: DocumentChartBarIcon,
      component: () => (
        <AdvancedAnalytics
          restaurant={restaurant}
        />
      )
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: CogIcon,
      component: () => (
        <RestaurantSettings
          restaurant={restaurant}
          onUpdate={loadRestaurantData}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRestaurantData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Restaurant Found</h1>
          <p className="text-gray-600">You are not assigned to manage any restaurant.</p>
        </div>
      </div>
    );
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: restaurant.primary_color }}
              >
                <BuildingStorefrontIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name} Admin</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.first_name} {user?.last_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Restaurant Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  restaurant.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">$</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">Avg</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-semibold text-gray-900">${stats.avgOrderValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
