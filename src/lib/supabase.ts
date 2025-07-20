import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          address: string
          role: 'customer' | 'admin' | 'delivery' | 'phone_vendor' | 'laptop_vendor' | 'restaurant_admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone: string
          address: string
          role?: 'customer' | 'admin' | 'delivery' | 'phone_vendor' | 'laptop_vendor' | 'restaurant_admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          address?: string
          role?: 'customer' | 'admin' | 'delivery' | 'phone_vendor' | 'laptop_vendor' | 'restaurant_admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_types: {
        Row: {
          id: string
          name: string
          description: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          image_url: string
          primary_color: string
          secondary_color: string
          accent_color: string
          delivery_fee: number
          minimum_order: number
          estimated_delivery_time: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          image_url?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          delivery_fee?: number
          minimum_order?: number
          estimated_delivery_time?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          image_url?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          delivery_fee?: number
          minimum_order?: number
          estimated_delivery_time?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string
          price: number
          category: string
          image_url: string | null
          is_available: boolean
          preparation_time: string | null
          allergens: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string
          price: number
          category: string
          image_url?: string | null
          is_available?: boolean
          preparation_time?: string | null
          allergens?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string
          price?: number
          category?: string
          image_url?: string | null
          is_available?: boolean
          preparation_time?: string | null
          allergens?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      food_orders: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          order_token: string
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          total_amount: number
          delivery_fee: number
          tax_amount: number
          delivery_address: string
          delivery_phone: string
          special_instructions: string | null
          estimated_delivery_time: string | null
          actual_delivery_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          order_token: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          total_amount: number
          delivery_fee: number
          tax_amount: number
          delivery_address: string
          delivery_phone: string
          special_instructions?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          order_token?: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          total_amount?: number
          delivery_fee?: number
          tax_amount?: number
          delivery_address?: string
          delivery_phone?: string
          special_instructions?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      food_order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          special_requests: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      restaurant_admins: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      repair_orders: {
        Row: {
          id: string
          user_id: string
          service_type_id: string
          service_type: 'phone' | 'laptop'
          first_name: string
          last_name: string
          phone_number: string
          alternate_contact: string | null
          device_model: string
          problem_description: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          estimated_cost: number | null
          actual_cost: number | null
          estimated_completion_date: string | null
          completion_date: string | null
          technician_notes: string | null
          customer_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_type_id: string
          service_type: 'phone' | 'laptop'
          first_name: string
          last_name: string
          phone_number: string
          alternate_contact?: string | null
          device_model: string
          problem_description: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          estimated_cost?: number | null
          actual_cost?: number | null
          estimated_completion_date?: string | null
          completion_date?: string | null
          technician_notes?: string | null
          customer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_type_id?: string
          service_type?: 'phone' | 'laptop'
          first_name?: string
          last_name?: string
          phone_number?: string
          alternate_contact?: string | null
          device_model?: string
          problem_description?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          estimated_cost?: number | null
          actual_cost?: number | null
          estimated_completion_date?: string | null
          completion_date?: string | null
          technician_notes?: string | null
          customer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Create typed client
export type SupabaseClient = typeof supabase
