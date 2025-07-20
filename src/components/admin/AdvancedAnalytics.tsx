'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/types/food';
import { 
  getAdvancedAnalytics,
  AdvancedAnalytics as AdvancedAnalyticsType 
} from '@/lib/restaurant-admin-api';
import { 
  ChartBarIcon,
  ClockIcon,
  TruckIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AdvancedAnalyticsProps {
  restaurant: Restaurant | null;
}

export default function AdvancedAnalytics({ restaurant }: AdvancedAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AdvancedAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'customers' | 'performance'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await getAdvancedAnalytics();
      if (response.success) {
        setAnalytics(response.data || null);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getHourLabel = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2" />
            Advanced Analytics
          </h2>
          
          {/* Tab Navigation */}
          <div className="mt-4">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'trends', label: 'Trends' },
                { id: 'customers', label: 'Customers' },
                { id: 'performance', label: 'Performance' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Avg Prep Time</p>
                      <p className="text-2xl font-semibold text-blue-900">
                        {formatTime(analytics.averagePreparationTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TruckIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Avg Delivery Time</p>
                      <p className="text-2xl font-semibold text-green-900">
                        {formatTime(analytics.averageDeliveryTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <UsersIcon className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">VIP Customers</p>
                      <p className="text-2xl font-semibold text-purple-900">
                        {analytics.customerSegments.vipCustomers}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Cancellation Rate</p>
                      <p className="text-2xl font-semibold text-red-900">
                        {analytics.orderCancellationRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Peak Hours */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {analytics.peakHours.map((peak, index) => (
                    <div key={peak.hour} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {getHourLabel(peak.hour)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {peak.orderCount} orders
                      </div>
                      <div className="text-xs text-gray-500">
                        #{index + 1} busiest
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              {/* Daily Trends */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Trends (Last 30 Days)</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Orders by Day</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {analytics.dailyTrends.slice(-10).map((day) => (
                          <div key={day.date} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {new Date(day.date).toLocaleDateString()}
                            </span>
                            <span className="font-medium">{day.orders} orders</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Revenue by Day</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {analytics.dailyTrends.slice(-10).map((day) => (
                          <div key={day.date} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {new Date(day.date).toLocaleDateString()}
                            </span>
                            <span className="font-medium">${day.revenue.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly Distribution */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Order Distribution</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {analytics.hourlyOrderDistribution.map((hour) => (
                      <div key={hour.hour} className="text-center">
                        <div className="text-xs text-gray-600 mb-1">
                          {getHourLabel(hour.hour)}
                        </div>
                        <div className="bg-blue-200 rounded h-16 flex items-end justify-center">
                          <div 
                            className="bg-blue-600 rounded-b w-full"
                            style={{ 
                              height: `${Math.max(10, (hour.orders / Math.max(...analytics.hourlyOrderDistribution.map(h => h.orders))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium mt-1">{hour.orders}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              {/* Customer Segments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.customerSegments.newCustomers}
                  </div>
                  <div className="text-sm text-green-700 font-medium">New Customers</div>
                  <div className="text-xs text-green-600 mt-1">First-time orders</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.customerSegments.returningCustomers}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Returning Customers</div>
                  <div className="text-xs text-blue-600 mt-1">2-9 orders</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics.customerSegments.vipCustomers}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">VIP Customers</div>
                  <div className="text-xs text-purple-600 mt-1">10+ orders</div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Category Performance */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    {analytics.categoryPerformance.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{category.category}</div>
                          <div className="text-sm text-gray-600">
                            {category.orders} orders • {category.items} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ${category.revenue.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Operational Efficiency</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Preparation Time</span>
                      <span className="font-medium">{formatTime(analytics.averagePreparationTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Delivery Time</span>
                      <span className="font-medium">{formatTime(analytics.averageDeliveryTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Cancellation Rate</span>
                      <span className="font-medium">{analytics.orderCancellationRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Customer Insights</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Customer Segments</span>
                      <span className="font-medium">
                        {analytics.customerSegments.newCustomers + 
                         analytics.customerSegments.returningCustomers + 
                         analytics.customerSegments.vipCustomers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIP Customer Ratio</span>
                      <span className="font-medium">
                        {(
                          (analytics.customerSegments.vipCustomers / 
                           (analytics.customerSegments.newCustomers + 
                            analytics.customerSegments.returningCustomers + 
                            analytics.customerSegments.vipCustomers)) * 100
                        ).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
