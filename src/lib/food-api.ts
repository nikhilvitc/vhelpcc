import { supabase } from './supabase';
import { getCurrentUserSync } from './auth';
import { FoodOrder, FoodOrderItem, Cart, CartItem } from '@/types/food';

export interface CreateFoodOrderData {
  restaurant_id: string;
  order_token: string;
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  delivery_address: string;
  delivery_phone: string;
  special_instructions?: string;
  estimated_delivery_time?: string;
  cart_items: CartItem[];
}

export interface CreateFoodOrderResponse {
  success: boolean;
  data?: FoodOrder;
  error?: string;
}

export interface GetFoodOrdersResponse {
  success: boolean;
  data?: FoodOrder[];
  error?: string;
}

// Create a new food order
export async function createFoodOrder(orderData: CreateFoodOrderData): Promise<CreateFoodOrderResponse> {
  try {
    // Get current user
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Prepare the order data for database
    const dbOrderData = {
      user_id: user.id,
      restaurant_id: orderData.restaurant_id,
      order_token: orderData.order_token,
      status: 'pending' as const,
      total_amount: orderData.total_amount,
      delivery_fee: orderData.delivery_fee,
      tax_amount: orderData.tax_amount,
      delivery_address: orderData.delivery_address,
      delivery_phone: orderData.delivery_phone,
      special_instructions: orderData.special_instructions || null,
      estimated_delivery_time: orderData.estimated_delivery_time || null
    };

    // Insert the food order
    const { data: order, error: orderError } = await supabase
      .from('food_orders')
      .insert([dbOrderData])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating food order:', orderError);
      return {
        success: false,
        error: orderError.message || 'Failed to create food order'
      };
    }

    // Prepare order items data
    const orderItems = orderData.cart_items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item.id,
      quantity: item.quantity,
      unit_price: item.menu_item.price,
      total_price: item.menu_item.price * item.quantity,
      special_requests: item.special_requests || null
    }));

    // Insert order items
    const { error: itemsError } = await supabase
      .from('food_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to clean up the order if items failed
      await supabase.from('food_orders').delete().eq('id', order.id);
      return {
        success: false,
        error: itemsError.message || 'Failed to create order items'
      };
    }

    return {
      success: true,
      data: order as FoodOrder
    };

  } catch (error: any) {
    console.error('Error in createFoodOrder:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get food orders for the current user
export async function getUserFoodOrders(): Promise<GetFoodOrdersResponse> {
  try {
    // Get current user
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Fetch food orders for the user with restaurant and order items
    const { data, error } = await supabase
      .from('food_orders')
      .select(`
        *,
        restaurants (
          name,
          slug,
          primary_color,
          secondary_color,
          accent_color
        ),
        food_order_items (
          *,
          menu_items (
            name,
            description,
            price,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching food orders:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch food orders'
      };
    }

    return {
      success: true,
      data: data as FoodOrder[]
    };

  } catch (error: any) {
    console.error('Error in getUserFoodOrders:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get a specific food order by token
export async function getFoodOrderByToken(orderToken: string): Promise<CreateFoodOrderResponse> {
  try {
    // Get current user
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Fetch the specific food order
    const { data, error } = await supabase
      .from('food_orders')
      .select(`
        *,
        restaurants (
          name,
          slug,
          description,
          primary_color,
          secondary_color,
          accent_color
        ),
        food_order_items (
          *,
          menu_items (
            name,
            description,
            price,
            image_url,
            category
          )
        )
      `)
      .eq('order_token', orderToken)
      .eq('user_id', user.id) // Ensure user can only access their own orders
      .single();

    if (error) {
      console.error('Error fetching food order:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch food order'
      };
    }

    return {
      success: true,
      data: data as FoodOrder
    };

  } catch (error: any) {
    console.error('Error in getFoodOrderByToken:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Update food order status (for admin/restaurant use)
export async function updateFoodOrderStatus(
  orderId: string, 
  status: FoodOrder['status'], 
  estimatedDeliveryTime?: string
): Promise<CreateFoodOrderResponse> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (estimatedDeliveryTime) {
      updateData.estimated_delivery_time = estimatedDeliveryTime;
    }

    if (status === 'delivered') {
      updateData.actual_delivery_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('food_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating food order:', error);
      return {
        success: false,
        error: error.message || 'Failed to update food order'
      };
    }

    return {
      success: true,
      data: data as FoodOrder
    };

  } catch (error: any) {
    console.error('Error in updateFoodOrderStatus:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}
