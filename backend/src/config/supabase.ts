import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      repair_orders: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          service_type: 'phone' | 'laptop';
          first_name: string;
          last_name: string;
          phone_number: string;
          alternate_contact?: string;
          device_model: string;
          problem_description: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_type?: 'phone' | 'laptop';
          first_name?: string;
          last_name?: string;
          phone_number?: string;
          alternate_contact?: string;
          device_model?: string;
          problem_description?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      service_types: {
        Row: {
          id: string;
          name: string;
          description?: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      password_reset_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          expires_at?: string;
          used?: boolean;
          created_at?: string;
        };
      };
      lost_and_found: {
        Row: {
          id: string;
          user_id: string;
          item_name: string;
          item_image_url?: string;
          category: 'lost' | 'found';
          place: string;
          description?: string;
          contact_phone?: string;
          status: 'active' | 'resolved' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_name: string;
          item_image_url?: string;
          category: 'lost' | 'found';
          place: string;
          description?: string;
          contact_phone?: string;
          status?: 'active' | 'resolved' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_name?: string;
          item_image_url?: string;
          category?: 'lost' | 'found';
          place?: string;
          description?: string;
          contact_phone?: string;
          status?: 'active' | 'resolved' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
