'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface VendorAnalyticsProps {
  serviceType?: 'phone' | 'laptop';
}

interface AnalyticsData {
  orderTrends: {
    date: string;
    orders: number;
    revenue: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  priorityDistribution: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  monthlyStats: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    completionRate: number;
    avgCompletionTime: number;
  };
  topDevices: {
    device: string;
    count: number;
  }[];
  performanceMetrics: {
    onTimeDelivery: number;
    customerSatisfaction: number;
    repeatCustomers: number;
  };
}

const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({ serviceType }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [serviceType, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
      }

      // Fetch orders data
      let query = supabase
        .from('repair_orders')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (serviceType) {
        query = query.eq('service_type', serviceType);
      }

      const { data: orders, error } = await query;

      if (error) {
        throw error;
      }

      if (!orders) {
        setLoading(false);
        return;
      }

      // Process analytics data
      const processedAnalytics = processAnalyticsData(orders, timeRange);
      setAnalytics(processedAnalytics);

    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (orders: any[], range: string): AnalyticsData => {
    // Order trends
    const orderTrends = generateOrderTrends(orders, range);
    
    // Status distribution
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count as number,
      percentage: Math.round(((count as number) / orders.length) * 100)
    }));

    // Priority distribution
    const priorityCounts = orders.reduce((acc, order) => {
      acc[order.priority] = (acc[order.priority] || 0) + 1;
      return acc;
    }, {});

    const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count: count as number,
      percentage: Math.round(((count as number) / orders.length) * 100)
    }));

    // Monthly stats
    const totalRevenue = orders.reduce((sum, order) => sum + (order.actual_cost || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'completed');
    const completionRate = orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0;
    
    const avgCompletionTime = completedOrders.length > 0
      ? completedOrders.reduce((sum, order) => {
          if (order.completion_date) {
            const created = new Date(order.created_at);
            const completed = new Date(order.completion_date);
            const diffDays = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            return sum + diffDays;
          }
          return sum;
        }, 0) / completedOrders.length
      : 0;

    const monthlyStats = {
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      completionRate,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10
    };

    // Top devices
    const deviceCounts = orders.reduce((acc, order) => {
      acc[order.device_model] = (acc[order.device_model] || 0) + 1;
      return acc;
    }, {});

    const topDevices = Object.entries(deviceCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([device, count]) => ({ device, count: count as number }));

    // Performance metrics (mock data for demo)
    const performanceMetrics = {
      onTimeDelivery: Math.round(85 + Math.random() * 10), // 85-95%
      customerSatisfaction: Math.round(88 + Math.random() * 10), // 88-98%
      repeatCustomers: Math.round(25 + Math.random() * 15) // 25-40%
    };

    return {
      orderTrends,
      statusDistribution,
      priorityDistribution,
      monthlyStats,
      topDevices,
      performanceMetrics
    };
  };

  const generateOrderTrends = (orders: any[], range: string) => {
    const trends: { [key: string]: { orders: number; revenue: number } } = {};
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      let key: string;
      
      if (range === 'week') {
        key = date.toISOString().split('T')[0]; // Daily for week
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Monthly
      }
      
      if (!trends[key]) {
        trends[key] = { orders: 0, revenue: 0 };
      }
      
      trends[key].orders += 1;
      trends[key].revenue += order.actual_cost || 0;
    });

    return Object.entries(trends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        orders: data.orders,
        revenue: data.revenue
      }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {serviceType ? `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Analytics` : 'Analytics Dashboard'}
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.monthlyStats.totalOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${analytics.monthlyStats.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics.monthlyStats.completionRate}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg. Completion Time</h3>
          <p className="text-3xl font-bold text-orange-600">{analytics.monthlyStats.avgCompletionTime} days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {analytics.statusDistribution.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.status.replace('_', ' ')}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Devices */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Device Models</h3>
          <div className="space-y-3">
            {analytics.topDevices.map((item, index) => (
              <div key={item.device} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <span className="text-sm text-gray-900 ml-2">{item.device}</span>
                </div>
                <span className="text-sm font-medium text-blue-600">{item.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {analytics.performanceMetrics.onTimeDelivery}%
            </div>
            <div className="text-sm text-gray-600">On-Time Delivery</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {analytics.performanceMetrics.customerSatisfaction}%
            </div>
            <div className="text-sm text-gray-600">Customer Satisfaction</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {analytics.performanceMetrics.repeatCustomers}%
            </div>
            <div className="text-sm text-gray-600">Repeat Customers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
