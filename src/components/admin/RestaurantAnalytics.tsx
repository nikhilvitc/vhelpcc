'use client';

import React from 'react';
import { Restaurant } from '@/types/food';
import { RestaurantStats } from '@/lib/restaurant-admin-api';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface RestaurantAnalyticsProps {
  stats: RestaurantStats | null;
  restaurant: Restaurant | null;
}

export default function RestaurantAnalytics({ stats, restaurant }: RestaurantAnalyticsProps) {
  if (!stats) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const orderStatusData = [
    { label: 'Pending', value: stats.pendingOrders, color: 'bg-yellow-500' },
    { label: 'Confirmed', value: stats.confirmedOrders, color: 'bg-blue-500' },
    { label: 'Preparing', value: stats.preparingOrders, color: 'bg-orange-500' },
    { label: 'Ready', value: stats.readyOrders, color: 'bg-purple-500' },
    { label: 'Out for Delivery', value: stats.outForDeliveryOrders, color: 'bg-indigo-500' },
    { label: 'Delivered', value: stats.deliveredOrders, color: 'bg-green-500' },
    { label: 'Cancelled', value: stats.cancelledOrders, color: 'bg-red-500' }
  ];

  const revenueData = [
    { label: 'Today', value: stats.todayRevenue, icon: CurrencyDollarIcon },
    { label: 'This Week', value: stats.weekRevenue, icon: ArrowTrendingUpIcon },
    { label: 'This Month', value: stats.monthRevenue, icon: ChartBarIcon }
  ];

  const orderData = [
    { label: 'Today', value: stats.todayOrders },
    { label: 'This Week', value: stats.weekOrders },
    { label: 'This Month', value: stats.monthOrders }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.monthRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <StarIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalOrders > 0 ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {revenueData.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">${item.value.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status Distribution</h3>
        <div className="space-y-4">
          {orderStatusData.map((status, index) => {
            const percentage = stats.totalOrders > 0 ? (status.value / stats.totalOrders) * 100 : 0;
            return (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">{status.label}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm font-medium text-gray-900">{status.value}</span>
                  <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Volume Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Volume</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orderData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Popular Menu Items</h3>
        {stats.popularItems.length > 0 ? (
          <div className="space-y-4">
            {stats.popularItems.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{item.orderCount} orders</p>
                  <p className="text-sm text-gray-600">${item.revenue.toFixed(2)} revenue</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No order data available yet.</p>
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      {restaurant && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Restaurant Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Operating Hours</h4>
              <p className="text-gray-600">
                {restaurant.opening_time} - {restaurant.closing_time}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delivery Settings</h4>
              <p className="text-gray-600">
                Fee: ${restaurant.delivery_fee.toFixed(2)} | 
                Min Order: ${restaurant.minimum_order.toFixed(2)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                restaurant.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {restaurant.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Theme Colors</h4>
              <div className="flex space-x-2">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: restaurant.primary_color }}
                  title="Primary Color"
                ></div>
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: restaurant.secondary_color }}
                  title="Secondary Color"
                ></div>
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: restaurant.accent_color }}
                  title="Accent Color"
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
