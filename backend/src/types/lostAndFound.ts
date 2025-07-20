// Lost and Found Types for vhelpcc backend

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
}

export interface CreateLostAndFoundRequest {
  item_name: string;
  item_image_url?: string;
  category: 'lost' | 'found';
  place: string;
  description?: string;
  contact_phone?: string;
}

export interface UpdateLostAndFoundRequest {
  item_name?: string;
  item_image_url?: string;
  category?: 'lost' | 'found';
  place?: string;
  description?: string;
  contact_phone?: string;
  status?: 'active' | 'resolved' | 'cancelled';
}

export interface LostAndFoundResponse {
  success: boolean;
  message: string;
  item?: LostAndFoundItem;
}

export interface LostAndFoundListResponse {
  success: boolean;
  message: string;
  items: LostAndFoundItem[];
  total: number;
}

export interface LostAndFoundFilters {
  category?: 'lost' | 'found' | 'all';
  status?: 'active' | 'resolved' | 'cancelled' | 'all';
  search?: string;
  place?: string;
  limit?: number;
  offset?: number;
}

// Extended interface with user information for display
export interface LostAndFoundItemWithUser extends LostAndFoundItem {
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}
