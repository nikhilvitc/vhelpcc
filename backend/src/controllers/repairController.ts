import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

// Types for repair orders
interface CreateRepairOrderRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternateContact?: string;
  deviceModel: string;
  problemDescription: string;
  serviceType: 'phone' | 'laptop';
}

interface RepairOrder {
  id: string;
  user_id: string;
  service_type: 'phone' | 'laptop';
  first_name: string;
  last_name: string;
  phone_number: string;
  alternate_contact?: string;
  device_model: string;
  problem_description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Create a new repair order
export const createRepairOrder = async (
  req: AuthenticatedRequest<{}, {}, CreateRepairOrderRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      alternateContact,
      deviceModel,
      problemDescription,
      serviceType,
    } = req.body;

    const userId = req.user?.userId;
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !deviceModel || !problemDescription || !serviceType) {
      throw createError('All required fields must be provided', 400);
    }

    // Validate service type
    if (!['phone', 'laptop'].includes(serviceType)) {
      throw createError('Invalid service type', 400);
    }

    // Get service type ID from service_types table
    const { data: serviceTypeData, error: serviceTypeError } = await supabase
      .from('service_types')
      .select('id')
      .eq('name', serviceType)
      .eq('is_active', true)
      .single();

    if (serviceTypeError || !serviceTypeData) {
      throw createError('Service type not found or inactive', 400);
    }

    // Create the repair order
    const { data: newOrder, error } = await supabase
      .from('repair_orders')
      .insert({
        user_id: userId,
        service_type_id: serviceTypeData.id,
        service_type: serviceType,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        alternate_contact: alternateContact || null,
        device_model: deviceModel,
        problem_description: problemDescription,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !newOrder) {
      console.error('Error creating repair order:', error);
      throw createError('Failed to create repair order', 500);
    }

    res.status(201).json({
      success: true,
      message: 'Repair order created successfully',
      order: {
        id: newOrder.id,
        serviceType: newOrder.service_type,
        deviceModel: newOrder.device_model,
        problemDescription: newOrder.problem_description,
        status: newOrder.status,
        createdAt: newOrder.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's repair orders
export const getUserRepairOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // Fetch user's repair orders
    const { data: orders, error } = await supabase
      .from('repair_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching repair orders:', error);
      throw createError('Failed to fetch repair orders', 500);
    }

    // Format the orders for the frontend
    const formattedOrders = orders?.map((order: RepairOrder) => ({
      id: order.id,
      serviceType: order.service_type,
      deviceModel: order.device_model,
      problemDescription: order.problem_description,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      firstName: order.first_name,
      lastName: order.last_name,
      phoneNumber: order.phone_number,
      alternateContact: order.alternate_contact,
    })) || [];

    res.status(200).json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific repair order
export const getRepairOrder = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // Fetch the specific repair order
    const { data: order, error } = await supabase
      .from('repair_orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !order) {
      throw createError('Repair order not found', 404);
    }

    // Format the order for the frontend
    const formattedOrder = {
      id: order.id,
      serviceType: order.service_type,
      deviceModel: order.device_model,
      problemDescription: order.problem_description,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      firstName: order.first_name,
      lastName: order.last_name,
      phoneNumber: order.phone_number,
      alternateContact: order.alternate_contact,
    };

    res.status(200).json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Update repair order status (admin only - for future use)
export const updateRepairOrderStatus = async (
  req: AuthenticatedRequest<{ id: string }, {}, { status: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      throw createError('Invalid status', 400);
    }

    // Update the repair order status
    const { data: updatedOrder, error } = await supabase
      .from('repair_orders')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedOrder) {
      throw createError('Failed to update repair order', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Repair order status updated successfully',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
