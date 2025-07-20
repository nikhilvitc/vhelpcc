import { Restaurant, MenuItem } from '@/types/food';
import { supabase } from './supabase';

// Cache for restaurants to avoid repeated database calls
let restaurantsCache: Restaurant[] | null = null;

// Fetch restaurants from Supabase database (all restaurants including inactive)
export async function fetchRestaurantsFromDB(): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }

    return data as Restaurant[];
  } catch (error) {
    console.error('Error in fetchRestaurantsFromDB:', error);
    return [];
  }
}

// Fetch only active restaurants
export async function fetchActiveRestaurantsFromDB(): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active restaurants:', error);
      return [];
    }

    return data as Restaurant[];
  } catch (error) {
    console.error('Error in fetchActiveRestaurantsFromDB:', error);
    return [];
  }
}

// Get restaurants with caching
export async function getRestaurants(): Promise<Restaurant[]> {
  if (restaurantsCache) {
    return restaurantsCache;
  }

  const restaurants = await fetchRestaurantsFromDB();
  restaurantsCache = restaurants;
  return restaurants;
}

// Find restaurant by slug from database (including inactive ones)
export async function findRestaurantBySlugFromDB(slug: string): Promise<Restaurant | null> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching restaurant by slug:', error);
      return null;
    }

    return data as Restaurant;
  } catch (error) {
    console.error('Error in findRestaurantBySlugFromDB:', error);
    return null;
  }
}

// Clear restaurants cache (useful for testing or when data changes)
export function clearRestaurantsCache(): void {
  restaurantsCache = null;
}

// Fetch menu items for a restaurant from database
export async function fetchMenuItemsFromDB(restaurantId: string): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }

    return data as MenuItem[];
  } catch (error) {
    console.error('Error in fetchMenuItemsFromDB:', error);
    return [];
  }
}
