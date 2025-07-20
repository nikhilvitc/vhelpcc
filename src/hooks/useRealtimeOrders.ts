'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RepairOrder } from '@/lib/repair-api';

interface UseRealtimeOrdersProps {
  serviceType?: 'phone' | 'laptop';
  vendorRole?: 'phone_vendor' | 'laptop_vendor';
}

interface OrderNotification {
  id: string;
  type: 'new_order' | 'status_change' | 'priority_change';
  order: RepairOrder;
  message: string;
  timestamp: Date;
}

export const useRealtimeOrders = ({ serviceType, vendorRole }: UseRealtimeOrdersProps = {}) => {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('repair_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (serviceType) {
        query = query.eq('service_type', serviceType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  // Add notification
  const addNotification = useCallback((notification: OrderNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Update order in state
  const updateOrderInState = useCallback((updatedOrder: RepairOrder, isNew = false) => {
    setOrders(prev => {
      if (isNew) {
        // Add new order to the beginning
        return [updatedOrder, ...prev];
      } else {
        // Update existing order
        return prev.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        );
      }
    });
  }, []);

  // Handle real-time updates
  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for repair_orders table
    const channel = supabase
      .channel('repair_orders_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'repair_orders',
          filter: serviceType ? `service_type=eq.${serviceType}` : undefined
        },
        (payload) => {
          const newOrder = payload.new as RepairOrder;
          
          // Only show notifications for orders matching the vendor's service type
          if (!serviceType || newOrder.service_type === serviceType) {
            updateOrderInState(newOrder, true);
            
            addNotification({
              id: `new_${newOrder.id}_${Date.now()}`,
              type: 'new_order',
              order: newOrder,
              message: `New ${newOrder.service_type} repair order received`,
              timestamp: new Date()
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'repair_orders',
          filter: serviceType ? `service_type=eq.${serviceType}` : undefined
        },
        (payload) => {
          const updatedOrder = payload.new as RepairOrder;
          const oldOrder = payload.old as RepairOrder;
          
          // Only show notifications for orders matching the vendor's service type
          if (!serviceType || updatedOrder.service_type === serviceType) {
            updateOrderInState(updatedOrder, false);
            
            // Check what changed and create appropriate notification
            if (oldOrder.status !== updatedOrder.status) {
              addNotification({
                id: `status_${updatedOrder.id}_${Date.now()}`,
                type: 'status_change',
                order: updatedOrder,
                message: `Order status changed from ${oldOrder.status} to ${updatedOrder.status}`,
                timestamp: new Date()
              });
            } else if (oldOrder.priority !== updatedOrder.priority) {
              addNotification({
                id: `priority_${updatedOrder.id}_${Date.now()}`,
                type: 'priority_change',
                order: updatedOrder,
                message: `Order priority changed from ${oldOrder.priority} to ${updatedOrder.priority}`,
                timestamp: new Date()
              });
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceType, fetchOrders, updateOrderInState, addNotification]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread notification count
  const unreadCount = notifications.length;

  // Get orders by status
  const getOrdersByStatus = useCallback((status: string) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get today's orders
  const getTodaysOrders = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  }, [orders]);

  // Refresh orders manually
  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    notifications,
    loading,
    error,
    unreadCount,
    markNotificationAsRead,
    clearAllNotifications,
    getOrdersByStatus,
    getTodaysOrders,
    refreshOrders,
    updateOrderInState
  };
};

export default useRealtimeOrders;
