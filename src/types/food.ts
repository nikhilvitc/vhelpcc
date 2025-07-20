// Food delivery types and interfaces

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  is_active: boolean;
  opening_time: string;
  closing_time: string;
  delivery_fee: number;
  minimum_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
  preparation_time: number; // in minutes
  created_at: string;
  updated_at: string;
}

export interface FoodOrder {
  id: string;
  user_id: string;
  restaurant_id: string;
  delivery_person_id?: string;
  order_token: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  delivery_address: string;
  delivery_phone: string;
  special_instructions?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  order_items?: FoodOrderItem[];
  delivery_person?: User;
}

export interface FoodOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_requests?: string;
  created_at: string;
  menu_item?: MenuItem;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  special_requests?: string;
}

export interface Cart {
  restaurant_id: string;
  items: CartItem[];
  total_amount: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin' | 'delivery';
  created_at: string;
  updated_at: string;
}

export interface RestaurantTheme {
  primary: string;
  secondary: string;
  accent: string;
  primaryHover: string;
  secondaryHover: string;
  accentHover: string;
  primaryLight: string;
  secondaryLight: string;
  accentLight: string;
}

export interface RestaurantConfig {
  restaurant: Restaurant;
  theme: RestaurantTheme;
  icon: React.ComponentType<{ className?: string }>;
}

// Order status display configurations
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Order Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Your order has been received and is being processed'
  },
  confirmed: {
    label: 'Order Confirmed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Your order has been confirmed by the restaurant'
  },
  preparing: {
    label: 'Preparing',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Your order is being prepared'
  },
  ready: {
    label: 'Ready for Pickup',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Your order is ready and waiting for delivery'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Your order is on the way'
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Your order has been delivered'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Your order has been cancelled'
  }
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_CONFIG;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
