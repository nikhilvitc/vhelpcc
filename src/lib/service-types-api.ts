import { supabase } from './supabase';

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetServiceTypesResponse {
  success: boolean;
  data?: ServiceType[];
  error?: string;
}

// Fetch all service types from database
export async function getServiceTypes(): Promise<GetServiceTypesResponse> {
  try {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching service types:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch service types'
      };
    }

    return {
      success: true,
      data: data as ServiceType[]
    };

  } catch (error: any) {
    console.error('Error in getServiceTypes:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Get active service types only
export async function getActiveServiceTypes(): Promise<GetServiceTypesResponse> {
  try {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active service types:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch active service types'
      };
    }

    return {
      success: true,
      data: data as ServiceType[]
    };

  } catch (error: any) {
    console.error('Error in getActiveServiceTypes:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Check if a specific service type is active
export async function isServiceTypeActive(serviceTypeName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('service_types')
      .select('is_active')
      .eq('name', serviceTypeName)
      .single();

    if (error) {
      console.error('Error checking service type status:', error);
      return false;
    }

    return data?.is_active || false;

  } catch (error) {
    console.error('Error in isServiceTypeActive:', error);
    return false;
  }
}
