// Lost and Found API functions for vhelpcc frontend

import { getCurrentUserSync } from './auth';
import { supabase } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface LostAndFoundItem {
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
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateLostAndFoundData {
  item_name: string;
  item_image_url?: string;
  category: 'lost' | 'found';
  place: string;
  description?: string;
  contact_phone?: string;
}

export interface LostAndFoundFilters {
  category?: 'lost' | 'found' | 'all';
  status?: 'active' | 'resolved' | 'cancelled' | 'all';
  search?: string;
  place?: string;
  limit?: number;
  offset?: number;
}

export const lostAndFoundApi = {
  // Submit lost and found item (using Supabase directly like repair system)
  submitLostAndFoundItem: async (formData: CreateLostAndFoundData): Promise<{ success: boolean; item: LostAndFoundItem }> => {
    try {
      console.log('Submitting lost and found item:', formData);

      // Get current user (same as repair system)
      const user = getCurrentUserSync();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        } as any;
      }

      console.log('User authenticated:', user.id);

      // Prepare the data for database insertion
      const dbData = {
        user_id: user.id,
        item_name: formData.item_name.trim(),
        item_image_url: formData.item_image_url || null,
        category: formData.category,
        place: formData.place.trim(),
        description: formData.description?.trim() || null,
        contact_phone: formData.contact_phone?.trim() || null,
        status: 'active' as const
      };

      console.log('Inserting data into Supabase:', dbData);

      // Insert into Supabase directly (same pattern as repair system)
      const { data: lostAndFoundItem, error } = await supabase
        .from('lost_and_found')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return {
          success: false,
          error: error.message || 'Failed to create lost and found item'
        } as any;
      }

      console.log('Lost and found item created successfully:', lostAndFoundItem);

      return {
        success: true,
        item: lostAndFoundItem as LostAndFoundItem
      };
    } catch (error) {
      console.error('Error in submitLostAndFoundItem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as any;
    }
  },

  // Get all lost and found items (using Supabase directly)
  getLostAndFoundItems: async (filters?: LostAndFoundFilters): Promise<{ success: boolean; items: LostAndFoundItem[]; total: number }> => {
    try {
      console.log('Fetching lost and found items with filters:', filters);

      let query = supabase
        .from('lost_and_found')
        .select(`
          *,
          users(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      } else {
        // Default to active items only
        query = query.eq('status', 'active');
      }

      if (filters?.search) {
        query = query.or(`item_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.place) {
        query = query.ilike('place', `%${filters.place}%`);
      }

      // Apply pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data: items, error, count } = await query;

      if (error) {
        console.error('Supabase error fetching items:', error);
        return {
          success: false,
          items: [],
          total: 0,
          error: error.message
        } as any;
      }

      console.log('Fetched items successfully:', items?.length || 0);

      // Transform the data to match the expected format
      const transformedItems = (items || []).map(item => ({
        ...item,
        user: item.users ? {
          first_name: item.users.first_name,
          last_name: item.users.last_name,
          email: item.users.email
        } : undefined
      }));

      return {
        success: true,
        items: transformedItems as LostAndFoundItem[],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching lost and found items:', error);
      return {
        success: false,
        items: [],
        total: 0,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as any;
    }
  },

  // Get user's lost and found items
  getUserLostAndFoundItems: async (): Promise<{ success: boolean; items: LostAndFoundItem[] }> => {
    const token = authStorage.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/lost-and-found/items/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user lost and found items');
    }

    return response.json();
  },

  // Update lost and found item
  updateLostAndFoundItem: async (id: string, updateData: Partial<CreateLostAndFoundData & { status: 'active' | 'resolved' | 'cancelled' }>): Promise<{ success: boolean; item: LostAndFoundItem }> => {
    const token = authStorage.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/lost-and-found/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update lost and found item');
    }

    return response.json();
  },

  // Delete lost and found item
  deleteLostAndFoundItem: async (id: string): Promise<{ success: boolean }> => {
    const token = authStorage.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/lost-and-found/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete lost and found item');
    }

    return response.json();
  },
};
