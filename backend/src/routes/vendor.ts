import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken, requirePhoneVendor, requireLaptopVendor, requireVendor } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Get vendor-specific orders
router.get('/orders/:serviceType', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { serviceType } = req.params;
    const { status, priority, limit = 50, offset = 0 } = req.query;

    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // Get user role from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      throw createError('User not found', 404);
    }

    if (serviceType !== 'phone' && serviceType !== 'laptop') {
      throw createError('Invalid service type', 400);
    }

    // Validate service type and user role (allow admin access to all)
    if (serviceType === 'phone' && user.role !== 'phone_vendor' && user.role !== 'admin') {
      throw createError('Phone vendor access required', 403);
    }

    if (serviceType === 'laptop' && user.role !== 'laptop_vendor' && user.role !== 'admin') {
      throw createError('Laptop vendor access required', 403);
    }

    // Build query
    let query = supabase
      .from('repair_orders')
      .select('*')
      .eq('service_type', serviceType)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data: orders, error } = await query;

    if (error) {
      throw createError('Failed to fetch orders', 500);
    }

    res.status(200).json({
      success: true,
      data: orders || [],
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: orders?.length || 0
      }
    });

  } catch (error) {
    next(error);
  }
});

// Update order status (vendor-specific)
router.put('/orders/:orderId/status', authenticateToken, requireVendor, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { 
      status, 
      priority, 
      technician_notes, 
      estimated_cost, 
      actual_cost, 
      estimated_completion_date 
    } = req.body;

    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // Get user role from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      throw createError('User not found', 404);
    }

    // First, get the order to check service type and permissions
    const { data: order, error: fetchError } = await supabase
      .from('repair_orders')
      .select('service_type, status, priority')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw createError('Order not found', 404);
    }

    // Check if vendor has permission for this service type (allow admin access to all)
    if (order.service_type === 'phone' && user.role !== 'phone_vendor' && user.role !== 'admin') {
      throw createError('Phone vendor access required', 403);
    }

    if (order.service_type === 'laptop' && user.role !== 'laptop_vendor' && user.role !== 'admin') {
      throw createError('Laptop vendor access required', 403);
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (technician_notes) updateData.technician_notes = technician_notes;
    if (estimated_cost !== undefined) updateData.estimated_cost = estimated_cost;
    if (actual_cost !== undefined) updateData.actual_cost = actual_cost;
    if (estimated_completion_date) updateData.estimated_completion_date = estimated_completion_date;

    // Set completion date if status is completed
    if (status === 'completed') {
      updateData.completion_date = new Date().toISOString();
    }

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('repair_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw createError('Failed to update order', 500);
    }

    // Create history entry
    if (status || priority) {
      await supabase
        .from('repair_order_history')
        .insert({
          repair_order_id: orderId,
          user_id: updatedOrder.user_id,
          old_status: order.status,
          new_status: status || order.status,
          old_priority: order.priority,
          new_priority: priority || order.priority,
          notes: technician_notes,
          changed_by: req.user.userId
        });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    next(error);
  }
});

// Get vendor statistics
router.get('/stats/:serviceType', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { serviceType } = req.params;
    const { timeRange = 'all' } = req.query;

    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // Get user role from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      throw createError('User not found', 404);
    }

    // Validate service type and user role (allow admin access to all)
    if (serviceType === 'phone' && user.role !== 'phone_vendor' && user.role !== 'admin') {
      throw createError('Phone vendor access required', 403);
    }

    if (serviceType === 'laptop' && user.role !== 'laptop_vendor' && user.role !== 'admin') {
      throw createError('Laptop vendor access required', 403);
    }

    if (serviceType !== 'phone' && serviceType !== 'laptop') {
      throw createError('Invalid service type', 400);
    }

    // Get orders for the service type
    let query = supabase
      .from('repair_orders')
      .select('*')
      .eq('service_type', serviceType);

    // Apply time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: orders, error } = await query;

    if (error) {
      throw createError('Failed to fetch statistics', 500);
    }

    // Calculate statistics
    const stats = {
      totalOrders: orders?.length || 0,
      pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
      inProgressOrders: orders?.filter(o => o.status === 'in_progress').length || 0,
      completedOrders: orders?.filter(o => o.status === 'completed').length || 0,
      cancelledOrders: orders?.filter(o => o.status === 'cancelled').length || 0,
      totalRevenue: orders?.reduce((sum, order) => sum + (order.actual_cost || 0), 0) || 0,
      avgCompletionTime: 0,
      completionRate: 0
    };

    // Calculate completion rate
    if (stats.totalOrders > 0) {
      stats.completionRate = Math.round((stats.completedOrders / stats.totalOrders) * 100);
    }

    // Calculate average completion time
    const completedOrders = orders?.filter(o => o.status === 'completed' && o.completion_date) || [];
    if (completedOrders.length > 0) {
      const totalDays = completedOrders.reduce((sum, order) => {
        const created = new Date(order.created_at);
        const completed = new Date(order.completion_date);
        const diffDays = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      stats.avgCompletionTime = Math.round((totalDays / completedOrders.length) * 10) / 10;
    }

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
});

// Get order history for a specific order
router.get('/orders/:orderId/history', authenticateToken, requireVendor, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;

    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // First verify the order exists and vendor has access
    const { data: order, error: orderError } = await supabase
      .from('repair_orders')
      .select('service_type')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw createError('Order not found', 404);
    }

    // Get user role from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      throw createError('User not found', 404);
    }

    // Check vendor permissions (allow admin access to all)
    if (order.service_type === 'phone' && user.role !== 'phone_vendor' && user.role !== 'admin') {
      throw createError('Phone vendor access required', 403);
    }

    if (order.service_type === 'laptop' && user.role !== 'laptop_vendor' && user.role !== 'admin') {
      throw createError('Laptop vendor access required', 403);
    }

    // Get order history
    const { data: history, error: historyError } = await supabase
      .from('repair_order_history')
      .select('*')
      .eq('repair_order_id', orderId)
      .order('created_at', { ascending: false });

    if (historyError) {
      throw createError('Failed to fetch order history', 500);
    }

    res.status(200).json({
      success: true,
      data: history || []
    });

  } catch (error) {
    next(error);
  }
});

export default router;
