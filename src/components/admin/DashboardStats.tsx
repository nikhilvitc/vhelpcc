'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStatsProps {
  serviceType?: 'phone' | 'laptop';
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  totalRevenue: number;
  avgCompletionTime: number;
  completionRate: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ serviceType }) => {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todayOrders: 0,
    weekOrders: 0,
    monthOrders: 0,
    totalRevenue: 0,
    avgCompletionTime: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [serviceType]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Base query
      let query = supabase.from('repair_orders').select('*');
      
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

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

      const todayOrders = orders.filter(o => 
        new Date(o.created_at) >= today
      ).length;

      const weekOrders = orders.filter(o => 
        new Date(o.created_at) >= weekAgo
      ).length;

      const monthOrders = orders.filter(o => 
        new Date(o.created_at) >= monthAgo
      ).length;

      // Calculate revenue
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.actual_cost || 0);
      }, 0);

      // Calculate completion rate
      const completionRate = totalOrders > 0 
        ? Math.round((completedOrders / totalOrders) * 100)
        : 0;

      // Calculate average completion time (in days)
      const completedOrdersWithDates = orders.filter(o => 
        o.status === 'completed' && o.completion_date
      );

      const avgCompletionTime = completedOrdersWithDates.length > 0
        ? completedOrdersWithDates.reduce((sum, order) => {
            const created = new Date(order.created_at);
            const completed = new Date(order.completion_date!);
            const diffDays = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            return sum + diffDays;
          }, 0) / completedOrdersWithDates.length
        : 0;

      setStats({
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        totalRevenue,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        completionRate
      });

    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '📋',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'In Progress',
      value: stats.inProgressOrders,
      icon: '🔧',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: '✅',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Today\'s Orders',
      value: stats.todayOrders,
      icon: '📅',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'This Week',
      value: stats.weekOrders,
      icon: '📊',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: '💰',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: '📈',
      color: 'bg-teal-500',
      textColor: 'text-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.pendingOrders}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalOrders > 0 ? (stats.inProgressOrders / stats.totalOrders) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.inProgressOrders}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.completedOrders}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Avg. Completion Time</span>
                <span className="text-sm font-medium">{stats.avgCompletionTime} days</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today</span>
              <span className="text-sm font-medium">{stats.todayOrders} orders</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-sm font-medium">{stats.weekOrders} orders</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-medium">{stats.monthOrders} orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
