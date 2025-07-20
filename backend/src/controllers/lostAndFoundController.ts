import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import {
  CreateLostAndFoundRequest,
  UpdateLostAndFoundRequest,
  LostAndFoundItem,
  LostAndFoundFilters,
  LostAndFoundItemWithUser
} from '../types/lostAndFound';

// Create a new lost and found item
export const createLostAndFoundItem = async (
  req: AuthenticatedRequest<{}, {}, CreateLostAndFoundRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Lost and found item creation request received');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const {
      item_name,
      item_image_url,
      category,
      place,
      description,
      contact_phone,
    } = req.body;

    const userId = req.user?.userId;
    console.log('User ID:', userId);

    if (!userId) {
      console.error('User not authenticated');
      throw createError('User not authenticated', 401);
    }

    // Validate required fields
    if (!item_name || !category || !place) {
      console.error('Missing required fields:', { item_name, category, place });
      throw createError('Item name, category, and place are required', 400);
    }

    // Validate category
    if (!['lost', 'found'].includes(category)) {
      console.error('Invalid category:', category);
      throw createError('Category must be either "lost" or "found"', 400);
    }

    console.log('Attempting to insert into database...');

    // Insert the lost and found item
    const { data: lostAndFoundItem, error } = await supabase
      .from('lost_and_found')
      .insert({
        user_id: userId,
        item_name: item_name.trim(),
        item_image_url,
        category,
        place: place.trim(),
        description: description?.trim(),
        contact_phone: contact_phone?.trim(),
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating lost and found item:', error);
      throw createError(`Database error: ${error.message}`, 500);
    }

    console.log('Lost and found item created successfully:', lostAndFoundItem);

    res.status(201).json({
      success: true,
      message: 'Lost and found item created successfully',
      item: lostAndFoundItem,
    });
  } catch (error) {
    console.error('Error in createLostAndFoundItem:', error);
    next(error);
  }
};

// Get all lost and found items with optional filters
export const getLostAndFoundItems = async (
  req: Request<{}, {}, {}, LostAndFoundFilters>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category = 'all',
      status = 'active',
      search,
      place,
      limit = 50,
      offset = 0
    } = req.query;

    let query = supabase
      .from('lost_and_found')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (category !== 'all') {
      query = query.eq('category', category);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (place) {
      query = query.ilike('place', `%${place}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: items, error, count } = await query;

    if (error) {
      console.error('Error fetching lost and found items:', error);
      throw createError('Failed to fetch lost and found items', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Lost and found items retrieved successfully',
      items: items || [],
      total: count || 0,
    });
  } catch (error) {
    next(error);
  }
};

// Get lost and found items by user
export const getUserLostAndFoundItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const { data: items, error } = await supabase
      .from('lost_and_found')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user lost and found items:', error);
      throw createError('Failed to fetch user lost and found items', 500);
    }

    res.status(200).json({
      success: true,
      message: 'User lost and found items retrieved successfully',
      items: items || [],
    });
  } catch (error) {
    next(error);
  }
};

// Update lost and found item status
export const updateLostAndFoundItem = async (
  req: AuthenticatedRequest<{ id: string }, {}, UpdateLostAndFoundRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    if (!id) {
      throw createError('Item ID is required', 400);
    }

    // Check if the item exists and belongs to the user
    const { data: existingItem, error: fetchError } = await supabase
      .from('lost_and_found')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingItem) {
      throw createError('Lost and found item not found or access denied', 404);
    }

    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from('lost_and_found')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating lost and found item:', updateError);
      throw createError('Failed to update lost and found item', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Lost and found item updated successfully',
      item: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// Delete lost and found item
export const deleteLostAndFoundItem = async (
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

    if (!id) {
      throw createError('Item ID is required', 400);
    }

    // Delete the item (only if it belongs to the user)
    const { error } = await supabase
      .from('lost_and_found')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting lost and found item:', error);
      throw createError('Failed to delete lost and found item', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Lost and found item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
