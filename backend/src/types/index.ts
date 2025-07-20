import { Request } from 'express';

// User types
export type UserRole = 'customer' | 'admin' | 'delivery' | 'phone_vendor' | 'laptop_vendor' | 'restaurant_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | undefined;
  address?: string | undefined;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  address?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Response types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

// Extended Request with user
export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any> extends Request<P, ResBody, ReqBody> {
  user?: JWTPayload;
}

// Password reset token
export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

// Repair Order types
export interface RepairOrder {
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
}

export interface CreateRepairOrderRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternateContact?: string;
  deviceModel: string;
  problemDescription: string;
  serviceType: 'phone' | 'laptop';
}

export interface RepairOrderResponse {
  success: boolean;
  message?: string;
  order?: {
    id: string;
    serviceType: string;
    deviceModel: string;
    problemDescription: string;
    status: string;
    createdAt: string;
  };
  orders?: Array<{
    id: string;
    serviceType: string;
    deviceModel: string;
    problemDescription: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    alternateContact?: string;
  }>;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface RepairOrderHistory {
  id: string;
  repair_order_id: string;
  old_status?: string;
  new_status: string;
  notes?: string;
  changed_by?: string;
  created_at: string;
}

// Environment variables
export interface EnvConfig {
  PORT: string;
  NODE_ENV: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  FRONTEND_URL?: string;
}
