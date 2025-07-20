import {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData
} from '@/lib/validations';

// API Response types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

// Authentication API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register new user
  signup: async (userData: SignupFormData): Promise<AuthResponse> => {
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...signupData } = userData;
    return apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  },

  // Request password reset
  forgotPassword: async (data: ForgotPasswordFormData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reset password with token
  resetPassword: async (token: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  // Verify auth token
  verifyToken: async (): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/verify');
  },

  // Logout user
  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Local storage utilities
export const authStorage = {
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
    authStorage.triggerAuthChange();
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  removeToken: () => {
    localStorage.removeItem('auth_token');
  },

  setUser: (user: any) => {
    localStorage.setItem('user_data', JSON.stringify(user));
    authStorage.triggerAuthChange();
  },

  getUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  removeUser: () => {
    localStorage.removeItem('user_data');
  },

  clear: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    authStorage.triggerAuthChange();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_data');
    return !!(token && user);
  },

  // Trigger auth status change event
  triggerAuthChange: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authStatusChanged'));
    }
  },
};

// Authentication helper functions
export const authHelpers = {
  // Check if user is logged in and redirect if not
  requireAuth: (redirectPath?: string): boolean => {
    const isAuth = authStorage.isAuthenticated();
    if (!isAuth && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const loginUrl = redirectPath
        ? `/login?redirect=${encodeURIComponent(redirectPath)}`
        : `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
      return false;
    }
    return isAuth;
  },

  // Get redirect URL from query params
  getRedirectUrl: (): string => {
    if (typeof window === 'undefined') return '/';
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') || '/';
  },

  // Validate token format (basic check)
  isValidTokenFormat: (token: string): boolean => {
    if (!token) return false;
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  },

  // Check if token is expired (basic check without verification)
  isTokenExpired: (token: string): boolean => {
    if (!authHelpers.isValidTokenFormat(token)) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  // Auto-logout if token is expired
  checkTokenExpiry: (): boolean => {
    const token = authStorage.getToken();
    if (!token) return false;

    if (authHelpers.isTokenExpired(token)) {
      authStorage.clear();
      return false;
    }
    return true;
  },

  // Validate token with backend
  validateTokenWithBackend: async (): Promise<boolean> => {
    try {
      const response = await authApi.verifyToken();
      return response.success;
    } catch (error) {
      console.error('Token validation failed:', error);
      authStorage.clear();
      return false;
    }
  },
};

// Form persistence utilities
export const formPersistence = {
  // Store form data in session storage
  storeFormData: (formData: any, serviceType: string, redirectUrl: string) => {
    const dataToStore = {
      ...formData,
      serviceType,
      redirectUrl,
      timestamp: Date.now(),
    };
    sessionStorage.setItem('pendingRepairForm', JSON.stringify(dataToStore));
  },

  // Get stored form data
  getStoredFormData: () => {
    try {
      const storedData = sessionStorage.getItem('pendingRepairForm');
      if (!storedData) return null;

      const formData = JSON.parse(storedData);

      // Check if data is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - formData.timestamp > maxAge) {
        sessionStorage.removeItem('pendingRepairForm');
        return null;
      }

      return formData;
    } catch (error) {
      console.error('Error parsing stored form data:', error);
      sessionStorage.removeItem('pendingRepairForm');
      return null;
    }
  },

  // Clear stored form data
  clearStoredFormData: () => {
    sessionStorage.removeItem('pendingRepairForm');
  },

  // Submit repair order
  submitRepairOrder: async (formData: any): Promise<any> => {
    const token = authStorage.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE_URL}/repair/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit repair request');
    }

    return response.json();
  },
};
