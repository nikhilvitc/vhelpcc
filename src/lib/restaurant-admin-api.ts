import { supabase } from './supabase';
import { getCurrentUserSync } from './auth';
import { FoodOrder, MenuItem, Restaurant } from '@/types/food';

export interface RestaurantAdminData {
  restaurant: Restaurant;
  totalOrders: number;
  pendingOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

export interface RestaurantStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  avgOrderValue: number;
  popularItems: Array<{
    name: string;
    category: string;
    orderCount: number;
    revenue: number;
  }>;
}

export interface RestaurantSettings {
  opening_time: string;
  closing_time: string;
  delivery_fee: number;
  minimum_order: number;
  is_active: boolean;
  description?: string;
  image_url?: string;
}

export interface OrderFilters {
  status?: FoodOrder['status'] | 'all';
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  customerId?: string;
}

export interface BulkOrderUpdate {
  orderIds: string[];
  status: FoodOrder['status'];
  estimatedDeliveryTime?: string;
}

export interface CustomerInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageOrderValue: number;
}

export interface DeliveryPerson {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email: string;
  activeDeliveries: number;
  totalDeliveries: number;
  isAvailable: boolean;
}

export interface AdvancedAnalytics {
  hourlyOrderDistribution: Array<{ hour: number; orders: number; revenue: number }>;
  dailyTrends: Array<{ date: string; orders: number; revenue: number }>;
  categoryPerformance: Array<{ category: string; orders: number; revenue: number; items: number }>;
  customerSegments: {
    newCustomers: number;
    returningCustomers: number;
    vipCustomers: number;
  };
  averagePreparationTime: number;
  averageDeliveryTime: number;
  orderCancellationRate: number;
  peakHours: Array<{ hour: number; orderCount: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get the restaurant(s) that the current user can manage
export async function getRestaurantForAdmin(): Promise<ApiResponse<Restaurant>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // Get the restaurant this admin manages
    const { data, error } = await supabase
      .from('restaurant_admins')
      .select(`
        restaurants (*)
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching restaurant for admin:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch restaurant'
      };
    }

    if (!data?.restaurants) {
      return {
        success: false,
        error: 'No restaurant found for this admin'
      };
    }

    return {
      success: true,
      data: data.restaurants as Restaurant
    };

  } catch (error: any) {
    console.error('Error in getRestaurantForAdmin:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get orders for the restaurant that the current admin manages
export async function getRestaurantOrders(): Promise<ApiResponse<FoodOrder[]>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Get orders for this restaurant
    const { data, error } = await supabase
      .from('food_orders')
      .select(`
        *,
        customer:users!food_orders_user_id_fkey (
          first_name,
          last_name,
          phone,
          email
        ),
        delivery_person:users!food_orders_delivery_person_id_fkey (
          first_name,
          last_name,
          phone
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
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurant orders:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch orders'
      };
    }

    return {
      success: true,
      data: data as FoodOrder[]
    };

  } catch (error: any) {
    console.error('Error in getRestaurantOrders:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Update order status (restaurant admin only)
export async function updateRestaurantOrderStatus(
  orderId: string, 
  status: FoodOrder['status'], 
  estimatedDeliveryTime?: string
): Promise<ApiResponse<FoodOrder>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First verify this order belongs to the admin's restaurant
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Verify the order belongs to this restaurant
    const { data: orderCheck, error: orderCheckError } = await supabase
      .from('food_orders')
      .select('restaurant_id')
      .eq('id', orderId)
      .single();

    if (orderCheckError || !orderCheck) {
      return {
        success: false,
        error: 'Order not found'
      };
    }

    if (orderCheck.restaurant_id !== restaurant.id) {
      return {
        success: false,
        error: 'You can only update orders for your restaurant'
      };
    }

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
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update order status'
      };
    }

    return {
      success: true,
      data: data as FoodOrder
    };

  } catch (error: any) {
    console.error('Error in updateRestaurantOrderStatus:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get menu items for the restaurant that the current admin manages
export async function getRestaurantMenuItems(): Promise<ApiResponse<MenuItem[]>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Get menu items for this restaurant
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch menu items'
      };
    }

    return {
      success: true,
      data: data as MenuItem[]
    };

  } catch (error: any) {
    console.error('Error in getRestaurantMenuItems:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Create a new menu item for the restaurant
export async function createRestaurantMenuItem(menuItem: Omit<MenuItem, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<MenuItem>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        ...menuItem,
        restaurant_id: restaurant.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating menu item:', error);
      return {
        success: false,
        error: error.message || 'Failed to create menu item'
      };
    }

    return {
      success: true,
      data: data as MenuItem
    };

  } catch (error: any) {
    console.error('Error in createRestaurantMenuItem:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Update a menu item for the restaurant
export async function updateRestaurantMenuItem(
  menuItemId: string,
  updates: Partial<Omit<MenuItem, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<MenuItem>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Verify the menu item belongs to this restaurant
    const { data: menuItemCheck, error: menuItemCheckError } = await supabase
      .from('menu_items')
      .select('restaurant_id')
      .eq('id', menuItemId)
      .single();

    if (menuItemCheckError || !menuItemCheck) {
      return {
        success: false,
        error: 'Menu item not found'
      };
    }

    if (menuItemCheck.restaurant_id !== restaurant.id) {
      return {
        success: false,
        error: 'You can only update menu items for your restaurant'
      };
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', menuItemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating menu item:', error);
      return {
        success: false,
        error: error.message || 'Failed to update menu item'
      };
    }

    return {
      success: true,
      data: data as MenuItem
    };

  } catch (error: any) {
    console.error('Error in updateRestaurantMenuItem:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Delete a menu item for the restaurant
export async function deleteRestaurantMenuItem(menuItemId: string): Promise<ApiResponse<boolean>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Verify the menu item belongs to this restaurant
    const { data: menuItemCheck, error: menuItemCheckError } = await supabase
      .from('menu_items')
      .select('restaurant_id')
      .eq('id', menuItemId)
      .single();

    if (menuItemCheckError || !menuItemCheck) {
      return {
        success: false,
        error: 'Menu item not found'
      };
    }

    if (menuItemCheck.restaurant_id !== restaurant.id) {
      return {
        success: false,
        error: 'You can only delete menu items for your restaurant'
      };
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menuItemId);

    if (error) {
      console.error('Error deleting menu item:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete menu item'
      };
    }

    return {
      success: true,
      data: true
    };

  } catch (error: any) {
    console.error('Error in deleteRestaurantMenuItem:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get restaurant analytics and statistics
export async function getRestaurantStats(): Promise<ApiResponse<RestaurantStats>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Get current date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all orders for this restaurant
    const { data: orders, error: ordersError } = await supabase
      .from('food_orders')
      .select(`
        *,
        food_order_items (
          *,
          menu_items (
            name,
            category
          )
        )
      `)
      .eq('restaurant_id', restaurant.id);

    if (ordersError) {
      console.error('Error fetching orders for stats:', ordersError);
      return {
        success: false,
        error: ordersError.message || 'Failed to fetch orders'
      };
    }

    // Calculate statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
    const preparingOrders = orders.filter(o => o.status === 'preparing').length;
    const readyOrders = orders.filter(o => o.status === 'ready').length;
    const outForDeliveryOrders = orders.filter(o => o.status === 'out_for_delivery').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    const todayOrders = orders.filter(o => new Date(o.created_at) >= today).length;
    const weekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo).length;
    const monthOrders = orders.filter(o => new Date(o.created_at) >= monthAgo).length;

    const todayRevenue = orders
      .filter(o => new Date(o.created_at) >= today && o.status === 'delivered')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const weekRevenue = orders
      .filter(o => new Date(o.created_at) >= weekAgo && o.status === 'delivered')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const monthRevenue = orders
      .filter(o => new Date(o.created_at) >= monthAgo && o.status === 'delivered')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const avgOrderValue = deliveredOrders > 0
      ? orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total_amount, 0) / deliveredOrders
      : 0;

    // Calculate popular items
    const itemCounts: { [key: string]: { name: string; category: string; count: number; revenue: number } } = {};

    orders.forEach(order => {
      if (order.food_order_items) {
        order.food_order_items.forEach((item: any) => {
          const key = item.menu_item_id;
          if (!itemCounts[key]) {
            itemCounts[key] = {
              name: item.menu_items?.name || 'Unknown',
              category: item.menu_items?.category || 'Unknown',
              count: 0,
              revenue: 0
            };
          }
          itemCounts[key].count += item.quantity;
          itemCounts[key].revenue += item.total_price;
        });
      }
    });

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        category: item.category,
        orderCount: item.count,
        revenue: item.revenue
      }));

    const stats: RestaurantStats = {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      readyOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      avgOrderValue,
      popularItems
    };

    return {
      success: true,
      data: stats
    };

  } catch (error: any) {
    console.error('Error in getRestaurantStats:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// =====================================================
// RESTAURANT SETTINGS MANAGEMENT
// =====================================================

// Update restaurant settings (opening hours, delivery fee, etc.)
export async function updateRestaurantSettings(settings: Partial<RestaurantSettings>): Promise<ApiResponse<Restaurant>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Update restaurant settings
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurant.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant settings:', error);
      return {
        success: false,
        error: error.message || 'Failed to update restaurant settings'
      };
    }

    return {
      success: true,
      data: data as Restaurant
    };

  } catch (error: any) {
    console.error('Error in updateRestaurantSettings:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Toggle restaurant open/closed status
export async function toggleRestaurantStatus(): Promise<ApiResponse<Restaurant>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Toggle the is_active status
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        is_active: !restaurant.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurant.id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling restaurant status:', error);
      return {
        success: false,
        error: error.message || 'Failed to toggle restaurant status'
      };
    }

    return {
      success: true,
      data: data as Restaurant
    };

  } catch (error: any) {
    console.error('Error in toggleRestaurantStatus:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// =====================================================
// ADVANCED ORDER MANAGEMENT
// =====================================================

// Get filtered orders with advanced search and filtering
export async function getFilteredRestaurantOrders(filters: OrderFilters = {}): Promise<ApiResponse<FoodOrder[]>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Build query
    let query = supabase
      .from('food_orders')
      .select(`
        *,
        customer:users!food_orders_user_id_fkey (
          first_name,
          last_name,
          phone,
          email
        ),
        delivery_person:users!food_orders_delivery_person_id_fkey (
          first_name,
          last_name,
          phone
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
      .eq('restaurant_id', restaurant.id);

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    if (filters.customerId) {
      query = query.eq('user_id', filters.customerId);
    }

    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching filtered orders:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch orders'
      };
    }

    let filteredData = data as FoodOrder[];

    // Apply search term filter (client-side for complex search)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(order =>
        order.order_token.toLowerCase().includes(searchTerm) ||
        order.delivery_address.toLowerCase().includes(searchTerm) ||
        order.delivery_phone.includes(searchTerm) ||
        (order as any).customer?.first_name?.toLowerCase().includes(searchTerm) ||
        (order as any).customer?.last_name?.toLowerCase().includes(searchTerm) ||
        (order as any).customer?.email?.toLowerCase().includes(searchTerm)
      );
    }

    return {
      success: true,
      data: filteredData
    };

  } catch (error: any) {
    console.error('Error in getFilteredRestaurantOrders:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Bulk update order status
export async function bulkUpdateOrderStatus(bulkUpdate: BulkOrderUpdate): Promise<ApiResponse<boolean>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Verify all orders belong to this restaurant
    const { data: orderCheck, error: checkError } = await supabase
      .from('food_orders')
      .select('id, restaurant_id')
      .in('id', bulkUpdate.orderIds)
      .eq('restaurant_id', restaurant.id);

    if (checkError) {
      console.error('Error checking order ownership:', checkError);
      return {
        success: false,
        error: checkError.message || 'Failed to verify order ownership'
      };
    }

    if (!orderCheck || orderCheck.length !== bulkUpdate.orderIds.length) {
      return {
        success: false,
        error: 'Some orders do not belong to your restaurant'
      };
    }

    // Update orders
    const updateData: any = {
      status: bulkUpdate.status,
      updated_at: new Date().toISOString()
    };

    if (bulkUpdate.estimatedDeliveryTime) {
      updateData.estimated_delivery_time = bulkUpdate.estimatedDeliveryTime;
    }

    if (bulkUpdate.status === 'delivered') {
      updateData.actual_delivery_time = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('food_orders')
      .update(updateData)
      .in('id', bulkUpdate.orderIds);

    if (updateError) {
      console.error('Error bulk updating orders:', updateError);
      return {
        success: false,
        error: updateError.message || 'Failed to update orders'
      };
    }

    return {
      success: true,
      data: true
    };

  } catch (error: any) {
    console.error('Error in bulkUpdateOrderStatus:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// =====================================================
// CUSTOMER MANAGEMENT
// =====================================================

// Get customer information and order history
export async function getRestaurantCustomers(): Promise<ApiResponse<CustomerInfo[]>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Get all customers who have ordered from this restaurant
    const { data: orders, error } = await supabase
      .from('food_orders')
      .select(`
        user_id,
        total_amount,
        created_at,
        status,
        customer:users!food_orders_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          address
        )
      `)
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer data:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch customer data'
      };
    }

    // Process customer data
    const customerMap = new Map<string, CustomerInfo>();

    orders?.forEach((order: any) => {
      const userId = order.user_id;
      const user = order.customer;

      if (!customerMap.has(userId)) {
        customerMap.set(userId, {
          id: userId,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.created_at,
          averageOrderValue: 0
        });
      }

      const customer = customerMap.get(userId)!;
      customer.totalOrders++;
      customer.totalSpent += order.total_amount;

      // Update last order date if this order is more recent
      if (new Date(order.created_at) > new Date(customer.lastOrderDate || '1970-01-01')) {
        customer.lastOrderDate = order.created_at;
      }
    });

    // Calculate average order values
    customerMap.forEach(customer => {
      customer.averageOrderValue = customer.totalOrders > 0
        ? customer.totalSpent / customer.totalOrders
        : 0;
    });

    // Convert to array and sort by total spent
    const customers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      success: true,
      data: customers
    };

  } catch (error: any) {
    console.error('Error in getRestaurantCustomers:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get detailed customer order history
export async function getCustomerOrderHistory(customerId: string): Promise<ApiResponse<FoodOrder[]>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Get customer's order history for this restaurant
    const { data, error } = await supabase
      .from('food_orders')
      .select(`
        *,
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
      .eq('restaurant_id', restaurant.id)
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer order history:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch order history'
      };
    }

    return {
      success: true,
      data: data as FoodOrder[]
    };

  } catch (error: any) {
    console.error('Error in getCustomerOrderHistory:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// =====================================================
// DELIVERY MANAGEMENT
// =====================================================

// Get available delivery persons
export async function getAvailableDeliveryPersons(): Promise<ApiResponse<DeliveryPerson[]>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // Get all delivery persons
    const { data: deliveryUsers, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone, email')
      .eq('role', 'delivery');

    if (usersError) {
      console.error('Error fetching delivery persons:', usersError);
      return {
        success: false,
        error: usersError.message || 'Failed to fetch delivery persons'
      };
    }

    // Get active deliveries count for each delivery person
    const { data: activeDeliveries, error: deliveriesError } = await supabase
      .from('food_orders')
      .select('delivery_person_id')
      .in('status', ['out_for_delivery']);

    if (deliveriesError) {
      console.error('Error fetching active deliveries:', deliveriesError);
      return {
        success: false,
        error: deliveriesError.message || 'Failed to fetch active deliveries'
      };
    }

    // Get total deliveries count for each delivery person
    const { data: totalDeliveries, error: totalError } = await supabase
      .from('food_orders')
      .select('delivery_person_id')
      .eq('status', 'delivered');

    if (totalError) {
      console.error('Error fetching total deliveries:', totalError);
      return {
        success: false,
        error: totalError.message || 'Failed to fetch total deliveries'
      };
    }

    // Process delivery person data
    const activeDeliveryCount = new Map<string, number>();
    const totalDeliveryCount = new Map<string, number>();

    activeDeliveries?.forEach(delivery => {
      if (delivery.delivery_person_id) {
        const count = activeDeliveryCount.get(delivery.delivery_person_id) || 0;
        activeDeliveryCount.set(delivery.delivery_person_id, count + 1);
      }
    });

    totalDeliveries?.forEach(delivery => {
      if (delivery.delivery_person_id) {
        const count = totalDeliveryCount.get(delivery.delivery_person_id) || 0;
        totalDeliveryCount.set(delivery.delivery_person_id, count + 1);
      }
    });

    const deliveryPersons: DeliveryPerson[] = deliveryUsers?.map(person => ({
      id: person.id,
      first_name: person.first_name,
      last_name: person.last_name,
      phone: person.phone,
      email: person.email,
      activeDeliveries: activeDeliveryCount.get(person.id) || 0,
      totalDeliveries: totalDeliveryCount.get(person.id) || 0,
      isAvailable: (activeDeliveryCount.get(person.id) || 0) < 3 // Assume max 3 concurrent deliveries
    })) || [];

    return {
      success: true,
      data: deliveryPersons
    };

  } catch (error: any) {
    console.error('Error in getAvailableDeliveryPersons:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Assign delivery person to order
export async function assignDeliveryPerson(orderId: string, deliveryPersonId: string): Promise<ApiResponse<FoodOrder>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First verify this order belongs to the admin's restaurant
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Verify order belongs to this restaurant
    const { data: orderCheck, error: checkError } = await supabase
      .from('food_orders')
      .select('id, restaurant_id, status')
      .eq('id', orderId)
      .eq('restaurant_id', restaurant.id)
      .single();

    if (checkError || !orderCheck) {
      return {
        success: false,
        error: 'Order not found or does not belong to your restaurant'
      };
    }

    // Update order with delivery person and status
    const { data, error } = await supabase
      .from('food_orders')
      .update({
        delivery_person_id: deliveryPersonId,
        status: 'out_for_delivery',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning delivery person:', error);
      return {
        success: false,
        error: error.message || 'Failed to assign delivery person'
      };
    }

    return {
      success: true,
      data: data as FoodOrder
    };

  } catch (error: any) {
    console.error('Error in assignDeliveryPerson:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// =====================================================
// ADVANCED ANALYTICS
// =====================================================

// Get advanced analytics data
export async function getAdvancedAnalytics(): Promise<ApiResponse<AdvancedAnalytics>> {
  try {
    const user = getCurrentUserSync();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    if (user.role !== 'restaurant_admin') {
      return {
        success: false,
        error: 'User is not a restaurant admin'
      };
    }

    // First get the restaurant this admin manages
    const restaurantResponse = await getRestaurantForAdmin();
    if (!restaurantResponse.success || !restaurantResponse.data) {
      return {
        success: false,
        error: restaurantResponse.error || 'Failed to get restaurant'
      };
    }

    const restaurant = restaurantResponse.data;

    // Get all orders for this restaurant with detailed data
    const { data: orders, error: ordersError } = await supabase
      .from('food_orders')
      .select(`
        *,
        food_order_items (
          *,
          menu_items (
            name,
            category
          )
        )
      `)
      .eq('restaurant_id', restaurant.id);

    if (ordersError) {
      console.error('Error fetching orders for analytics:', ordersError);
      return {
        success: false,
        error: ordersError.message || 'Failed to fetch orders'
      };
    }

    // Get unique customers for customer segmentation
    const { data: customers, error: customersError } = await supabase
      .from('food_orders')
      .select('user_id, created_at')
      .eq('restaurant_id', restaurant.id);

    if (customersError) {
      console.error('Error fetching customers for analytics:', customersError);
      return {
        success: false,
        error: customersError.message || 'Failed to fetch customers'
      };
    }

    // Process analytics data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Hourly order distribution
    const hourlyDistribution = new Array(24).fill(0).map((_, hour) => ({
      hour,
      orders: 0,
      revenue: 0
    }));

    // Daily trends (last 30 days)
    const dailyTrends = new Map<string, { orders: number; revenue: number }>();

    // Category performance
    const categoryPerformance = new Map<string, { orders: number; revenue: number; items: Set<string> }>();

    // Peak hours tracking
    const hourlyOrderCount = new Array(24).fill(0);

    // Process orders
    let totalPreparationTime = 0;
    let totalDeliveryTime = 0;
    let preparationTimeCount = 0;
    let deliveryTimeCount = 0;
    let cancelledOrders = 0;

    orders?.forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      const hour = orderDate.getHours();
      const dateStr = orderDate.toISOString().split('T')[0];

      // Hourly distribution
      hourlyDistribution[hour].orders++;
      hourlyDistribution[hour].revenue += order.total_amount;

      // Daily trends
      if (!dailyTrends.has(dateStr)) {
        dailyTrends.set(dateStr, { orders: 0, revenue: 0 });
      }
      const dayData = dailyTrends.get(dateStr)!;
      dayData.orders++;
      dayData.revenue += order.total_amount;

      // Peak hours
      hourlyOrderCount[hour]++;

      // Order status tracking
      if (order.status === 'cancelled') {
        cancelledOrders++;
      }

      // Preparation and delivery time calculation
      if (order.estimated_delivery_time && order.created_at) {
        const createdTime = new Date(order.created_at);
        const estimatedTime = new Date(order.estimated_delivery_time);
        const prepTime = (estimatedTime.getTime() - createdTime.getTime()) / (1000 * 60); // minutes
        if (prepTime > 0 && prepTime < 300) { // reasonable prep time (< 5 hours)
          totalPreparationTime += prepTime;
          preparationTimeCount++;
        }
      }

      if (order.actual_delivery_time && order.created_at) {
        const createdTime = new Date(order.created_at);
        const deliveredTime = new Date(order.actual_delivery_time);
        const deliveryTime = (deliveredTime.getTime() - createdTime.getTime()) / (1000 * 60); // minutes
        if (deliveryTime > 0 && deliveryTime < 600) { // reasonable delivery time (< 10 hours)
          totalDeliveryTime += deliveryTime;
          deliveryTimeCount++;
        }
      }

      // Category performance
      if (order.food_order_items) {
        order.food_order_items.forEach((item: any) => {
          const category = item.menu_items?.category || 'Unknown';
          if (!categoryPerformance.has(category)) {
            categoryPerformance.set(category, { orders: 0, revenue: 0, items: new Set() });
          }
          const catData = categoryPerformance.get(category)!;
          catData.orders += item.quantity;
          catData.revenue += item.total_price;
          catData.items.add(item.menu_item_id);
        });
      }
    });

    // Customer segmentation
    const customerFirstOrders = new Map<string, Date>();
    const customerOrderCounts = new Map<string, number>();

    customers?.forEach((order: any) => {
      const userId = order.user_id;
      const orderDate = new Date(order.created_at);

      if (!customerFirstOrders.has(userId) || orderDate < customerFirstOrders.get(userId)!) {
        customerFirstOrders.set(userId, orderDate);
      }

      customerOrderCounts.set(userId, (customerOrderCounts.get(userId) || 0) + 1);
    });

    let newCustomers = 0;
    let returningCustomers = 0;
    let vipCustomers = 0;

    customerOrderCounts.forEach((orderCount, userId) => {
      const firstOrder = customerFirstOrders.get(userId);
      const isNewCustomer = firstOrder && firstOrder > thirtyDaysAgo;

      if (orderCount >= 10) {
        vipCustomers++;
      } else if (orderCount > 1) {
        returningCustomers++;
      } else if (isNewCustomer) {
        newCustomers++;
      }
    });

    // Convert maps to arrays
    const dailyTrendsArray = Array.from(dailyTrends.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    const categoryPerformanceArray = Array.from(categoryPerformance.entries())
      .map(([category, data]) => ({
        category,
        orders: data.orders,
        revenue: data.revenue,
        items: data.items.size
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const peakHours = hourlyOrderCount
      .map((count, hour) => ({ hour, orderCount: count }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    const analytics: AdvancedAnalytics = {
      hourlyOrderDistribution: hourlyDistribution,
      dailyTrends: dailyTrendsArray,
      categoryPerformance: categoryPerformanceArray,
      customerSegments: {
        newCustomers,
        returningCustomers,
        vipCustomers
      },
      averagePreparationTime: preparationTimeCount > 0 ? totalPreparationTime / preparationTimeCount : 0,
      averageDeliveryTime: deliveryTimeCount > 0 ? totalDeliveryTime / deliveryTimeCount : 0,
      orderCancellationRate: orders?.length ? (cancelledOrders / orders.length) * 100 : 0,
      peakHours
    };

    return {
      success: true,
      data: analytics
    };

  } catch (error: any) {
    console.error('Error in getAdvancedAnalytics:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}
