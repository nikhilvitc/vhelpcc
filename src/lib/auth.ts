// Authentication utilities for vhelpcc
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const hasUrl = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseUrl.includes('supabase.co');
  const hasKey = supabaseAnonKey && supabaseAnonKey !== 'placeholder-key' && supabaseAnonKey.length > 20;

  console.log('Supabase config check:', {
    url: supabaseUrl,
    hasUrl,
    hasKey: !!hasKey,
    keyLength: supabaseAnonKey?.length
  });

  return hasUrl && hasKey;
};

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin' | 'delivery' | 'phone_vendor' | 'laptop_vendor' | 'restaurant_admin';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Get current user from localStorage and Supabase session
export const getCurrentUser = async (): Promise<User | null> => {
  if (typeof window === 'undefined') return null;

  try {
    // First check localStorage for immediate access
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      const user = parsed.user || parsed;

      // If Supabase is not configured, just return the localStorage user
      if (!isSupabaseConfigured()) {
        return user;
      }

      // Verify with Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.id === user.id) {
        return user;
      }
    }

    // If Supabase is not configured, return null
    if (!isSupabaseConfigured()) {
      return null;
    }

    // If no localStorage data or session mismatch, check Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Get user profile from database
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        const user: User = {
          id: profileData.id,
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          address: profileData.address,
          role: profileData.role,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        };

        // Save to localStorage for future access
        saveUser(user);
        return user;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Synchronous version for immediate access (uses only localStorage)
export const getCurrentUserSync = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;

    const parsed = JSON.parse(userData);
    const user = parsed.user || parsed;
    return user;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Check if user is authenticated (synchronous)
export const isAuthenticated = (): boolean => {
  const user = getCurrentUserSync();
  return user !== null;
};

// Check if user is authenticated (async with Supabase verification)
export const isAuthenticatedAsync = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};

// Check if user has required role
export const hasRole = (requiredRole: string): boolean => {
  const user = getCurrentUserSync();
  return user?.role === requiredRole;
};

// Check if user is any type of admin
export const isAdmin = (): boolean => {
  const user = getCurrentUserSync();
  return user?.role === 'admin';
};

// Check if user is a phone vendor
export const isPhoneVendor = (): boolean => {
  const user = getCurrentUserSync();
  return user?.role === 'phone_vendor';
};

// Check if user is a laptop vendor
export const isLaptopVendor = (): boolean => {
  const user = getCurrentUserSync();
  return user?.role === 'laptop_vendor';
};

// Check if user is a restaurant admin
export const isRestaurantAdmin = (): boolean => {
  const user = getCurrentUserSync();
  return user?.role === 'restaurant_admin';
};

// Check if user is any type of vendor
export const isVendor = (): boolean => {
  const user = getCurrentUserSync();
  return user?.role === 'phone_vendor' || user?.role === 'laptop_vendor';
};

// Check if user has admin privileges (admin, vendor, or restaurant admin)
export const hasAdminPrivileges = (): boolean => {
  const user = getCurrentUserSync();
  return user?.role === 'admin' || user?.role === 'phone_vendor' || user?.role === 'laptop_vendor' || user?.role === 'restaurant_admin';
};

// Save user to localStorage
export const saveUser = (user: User): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('user', JSON.stringify(user));
    // Dispatch event for components listening to auth changes
    window.dispatchEvent(new CustomEvent('auth-change', { detail: user }));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Clear user from localStorage
export const clearUser = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent('auth-change', { detail: null }));
};

// Login function with Supabase
export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    console.log('Starting login process for:', email);

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      const errorMsg = 'Supabase is not properly configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Login failed' };
    }

    // Get user profile from our users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      console.error('Profile fetch error:', profileError);
      return { success: false, error: 'Failed to load user profile' };
    }

    // Create our user object
    const user: User = {
      id: profileData.id,
      email: profileData.email,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone,
      address: profileData.address,
      role: profileData.role,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at
    };

    // Save user to localStorage
    saveUser(user);

    // Trigger auth change event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
    }

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred during login' };
  }
};

// Signup function with Supabase
export const signup = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    console.log('Starting signup process with data:', userData);

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      const errorMsg = 'Supabase is not properly configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log('Supabase is configured, proceeding with signup...');

    // Sign up with Supabase Auth
    console.log('Calling Supabase auth.signUp...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          address: userData.address,
          role: 'customer'
        }
      }
    });

    console.log('Supabase auth response:', { authData, authError });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      console.error('No user returned from Supabase');
      return { success: false, error: 'Failed to create user account' };
    }

    console.log('User created in Supabase Auth:', authData.user.id);

    // Wait a moment for the trigger to create the profile
    console.log('Waiting for trigger to create user profile...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if profile was created by trigger
    let { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    console.log('Existing profile from trigger:', existingProfile, 'Error:', fetchError);

    // If no profile exists, create it manually
    if (!existingProfile) {
      console.log('No profile found, creating manually...');

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            address: userData.address,
            role: 'customer'
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);

        // If it's an RLS error, provide specific guidance
        if (profileError.message.includes('row-level security')) {
          return {
            success: false,
            error: 'Database security policy error. Please run the fix-rls-policies.sql script in your Supabase SQL Editor to fix this issue.'
          };
        }

        return { success: false, error: `Failed to create user profile: ${profileError.message}` };
      }

      existingProfile = profileData;
      console.log('Profile created manually:', existingProfile);
    } else {
      // Update the profile with the additional data if it was created by trigger
      console.log('Updating profile with complete data...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          address: userData.address
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
      } else {
        existingProfile = updatedProfile;
        console.log('Profile updated:', existingProfile);
      }
    }

    // Create our user object from the profile data
    const newUser: User = {
      id: existingProfile.id,
      email: existingProfile.email,
      first_name: existingProfile.first_name,
      last_name: existingProfile.last_name,
      phone: existingProfile.phone,
      address: existingProfile.address,
      role: existingProfile.role,
      created_at: existingProfile.created_at,
      updated_at: existingProfile.updated_at
    };

    console.log('Final user object:', newUser);

    // Save user to localStorage for immediate access
    saveUser(newUser);

    // Trigger auth change event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: newUser }));
    }

    console.log('Signup completed successfully');
    return { success: true, user: newUser };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'An unexpected error occurred during signup' };
  }
};

// Logout function with Supabase
export const logout = async (): Promise<void> => {
  try {
    // Sign out from Supabase if configured
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }

    // Clear local storage
    clearUser();

    // Clear cart when logging out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vhelpcc_food_cart');
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: null }));
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local data even if Supabase logout fails
    clearUser();
  }
};

// Update user profile
export const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const updatedUser: User = {
      ...currentUser,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    saveUser(updatedUser);
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: 'Profile update failed' };
  }
};

// Check if user profile is complete
export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  
  return !!(
    user.first_name &&
    user.last_name &&
    user.email &&
    user.phone &&
    user.address
  );
};

// Get missing profile fields
export const getMissingProfileFields = (user: User | null): string[] => {
  if (!user) return ['first_name', 'last_name', 'email', 'phone', 'address'];
  
  const missing: string[] = [];
  
  if (!user.first_name) missing.push('first_name');
  if (!user.last_name) missing.push('last_name');
  if (!user.email) missing.push('email');
  if (!user.phone) missing.push('phone');
  if (!user.address) missing.push('address');
  
  return missing;
};

// Auth event listener hook
export const useAuthListener = (callback: (user: User | null) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleAuthChange = (event: CustomEvent) => {
    callback(event.detail);
  };
  
  window.addEventListener('auth-change', handleAuthChange as EventListener);
  
  return () => {
    window.removeEventListener('auth-change', handleAuthChange as EventListener);
  };
};

// Redirect to login with return URL
export const redirectToLogin = (returnUrl?: string): void => {
  if (typeof window !== 'undefined' && returnUrl) {
    sessionStorage.setItem('returnUrl', returnUrl);
  }

  const url = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login';
  window.location.href = url;
};

// Redirect to signup with return URL and service context
export const redirectToSignup = (returnUrl?: string, serviceContext?: string): void => {
  if (typeof window !== 'undefined') {
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    }
    if (serviceContext) {
      sessionStorage.setItem('serviceContext', serviceContext);
    }

    // Store current form data if it exists
    const currentFormData = getFormDataFromPage();
    if (currentFormData) {
      sessionStorage.setItem('pendingFormData', JSON.stringify(currentFormData));
    }
  }

  const url = returnUrl ? `/signup?returnUrl=${encodeURIComponent(returnUrl)}` : '/signup';
  window.location.href = url;
};

// Get form data from current page (for preserving form state)
const getFormDataFromPage = (): any => {
  if (typeof window === 'undefined') return null;

  try {
    // Try to get form data from common form selectors
    const forms = document.querySelectorAll('form');
    const formData: any = {};

    forms.forEach((form, index) => {
      const inputs = form.querySelectorAll('input, textarea, select');
      const currentFormData: any = {};

      inputs.forEach((input: any) => {
        if (input.name && input.value) {
          currentFormData[input.name] = input.value;
        }
      });

      if (Object.keys(currentFormData).length > 0) {
        formData[`form_${index}`] = currentFormData;
      }
    });

    return Object.keys(formData).length > 0 ? formData : null;
  } catch (error) {
    console.error('Error getting form data:', error);
    return null;
  }
};

// Restore form data to current page
export const restoreFormData = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const formDataStr = sessionStorage.getItem('pendingFormData');
    if (!formDataStr) return;

    const formData = JSON.parse(formDataStr);
    sessionStorage.removeItem('pendingFormData');

    // Restore form data
    Object.keys(formData).forEach(formKey => {
      const currentFormData = formData[formKey];
      Object.keys(currentFormData).forEach(fieldName => {
        const input = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
        if (input) {
          input.value = currentFormData[fieldName];
          // Trigger change event for React forms
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        }
      });
    });
  } catch (error) {
    console.error('Error restoring form data:', error);
    sessionStorage.removeItem('pendingFormData');
  }
};

// Handle authentication required actions with service context
export const requireAuth = (action: () => void, returnUrl?: string, serviceContext?: string): void => {
  if (isAuthenticated()) {
    action();
  } else {
    // Store the action in session storage to execute after login
    if (typeof window !== 'undefined') {
      if (returnUrl) {
        sessionStorage.setItem('pendingAction', 'true');
        sessionStorage.setItem('returnUrl', returnUrl);
      }
      if (serviceContext) {
        sessionStorage.setItem('serviceContext', serviceContext);
      }
    }
    redirectToSignup(returnUrl, serviceContext);
  }
};

// Execute pending action after login with enhanced context handling
export const executePendingAction = (): void => {
  if (typeof window === 'undefined') return;

  const hasPendingAction = sessionStorage.getItem('pendingAction');
  const returnUrl = sessionStorage.getItem('returnUrl');
  const serviceContext = sessionStorage.getItem('serviceContext');

  if (hasPendingAction && returnUrl) {
    sessionStorage.removeItem('pendingAction');
    sessionStorage.removeItem('returnUrl');
    sessionStorage.removeItem('serviceContext');

    // Navigate to the return URL
    window.location.href = returnUrl;
  } else if (returnUrl) {
    // Even without pending action, return to the original URL
    sessionStorage.removeItem('returnUrl');
    sessionStorage.removeItem('serviceContext');
    window.location.href = returnUrl;
  } else if (serviceContext) {
    // Navigate based on service context
    sessionStorage.removeItem('serviceContext');

    if (serviceContext === 'repair') {
      window.location.href = '/repair';
    } else if (serviceContext === 'food') {
      window.location.href = '/food';
    } else {
      window.location.href = '/';
    }
  }

  // Restore form data after a short delay to allow page to load
  setTimeout(() => {
    restoreFormData();
  }, 500);
};

// Format user display name
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'Guest';
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
