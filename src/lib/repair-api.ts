import { supabase } from './supabase';
import { getCurrentUserSync } from './auth';

export interface RepairOrderData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternateContact?: string;
  deviceModel: string;
  problemDescription: string;
  serviceType: 'phone' | 'laptop';
}

export interface RepairOrder {
  id: string;
  user_id: string;
  service_type_id: string;
  service_type: 'phone' | 'laptop';
  first_name: string;
  last_name: string;
  phone_number: string;
  alternate_contact?: string;
  device_model: string;
  problem_description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimated_cost?: number;
  actual_cost?: number;
  estimated_completion_date?: string;
  completion_date?: string;
  technician_notes?: string;
  customer_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRepairOrderResponse {
  success: boolean;
  data?: RepairOrder;
  error?: string;
}

export interface GetRepairOrdersResponse {
  success: boolean;
  data?: RepairOrder[];
  error?: string;
}

// Get service type ID by name
async function getServiceTypeId(serviceType: 'phone' | 'laptop'): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('service_types')
      .select('id')
      .eq('name', serviceType)
      .single();

    if (error) {
      console.error('Error fetching service type:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in getServiceTypeId:', error);
    return null;
  }
}

// Create a new repair order
export async function createRepairOrder(orderData: RepairOrderData): Promise<CreateRepairOrderResponse> {
  try {
    // Get current user
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Get service type ID
    const serviceTypeId = await getServiceTypeId(orderData.serviceType);
    if (!serviceTypeId) {
      return {
        success: false,
        error: 'Invalid service type'
      };
    }

    // Prepare the order data for database
    const dbOrderData = {
      user_id: user.id,
      service_type_id: serviceTypeId,
      service_type: orderData.serviceType,
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      phone_number: orderData.phoneNumber,
      alternate_contact: orderData.alternateContact || null,
      device_model: orderData.deviceModel,
      problem_description: orderData.problemDescription,
      status: 'pending' as const,
      priority: 'normal' as const
    };

    // Insert the repair order
    const { data, error } = await supabase
      .from('repair_orders')
      .insert([dbOrderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating repair order:', error);
      return {
        success: false,
        error: error.message || 'Failed to create repair order'
      };
    }

    return {
      success: true,
      data: data as RepairOrder
    };

  } catch (error: any) {
    console.error('Error in createRepairOrder:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get repair orders for the current user
export async function getUserRepairOrders(): Promise<GetRepairOrdersResponse> {
  try {
    // Get current user
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Fetch repair orders for the user
    const { data, error } = await supabase
      .from('repair_orders')
      .select(`
        *,
        service_types (
          name,
          description
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching repair orders:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch repair orders'
      };
    }

    return {
      success: true,
      data: data as RepairOrder[]
    };

  } catch (error: any) {
    console.error('Error in getUserRepairOrders:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get a specific repair order by ID
export async function getRepairOrderById(orderId: string): Promise<CreateRepairOrderResponse> {
  try {
    // Get current user
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Fetch the specific repair order
    const { data, error } = await supabase
      .from('repair_orders')
      .select(`
        *,
        service_types (
          name,
          description
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id) // Ensure user can only access their own orders
      .single();

    if (error) {
      console.error('Error fetching repair order:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch repair order'
      };
    }

    return {
      success: true,
      data: data as RepairOrder
    };

  } catch (error: any) {
    console.error('Error in getRepairOrderById:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Update repair order status (for admin/technician use)
export async function updateRepairOrderStatus(
  orderId: string, 
  status: RepairOrder['status'], 
  technicianNotes?: string
): Promise<CreateRepairOrderResponse> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (technicianNotes) {
      updateData.technician_notes = technicianNotes;
    }

    if (status === 'completed') {
      updateData.completion_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('repair_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating repair order:', error);
      return {
        success: false,
        error: error.message || 'Failed to update repair order'
      };
    }

    return {
      success: true,
      data: data as RepairOrder
    };

  } catch (error: any) {
    console.error('Error in updateRepairOrderStatus:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}
