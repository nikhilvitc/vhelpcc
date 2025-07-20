import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload, UserRole } from '../types';
import { createError } from './errorHandler';
import { supabase } from '../config/supabase';

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw createError('Access token required', 401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createError('JWT secret not configured', 500);
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token expired', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token', 401);
    } else {
      throw createError('Token verification failed', 401);
    }
  }
};

// Helper function to get user role from database
const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user.role as UserRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

// Middleware to check if user has admin role
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const userRole = await getUserRole(req.user.userId);

  if (userRole !== 'admin') {
    throw createError('Admin access required', 403);
  }

  next();
};

// Middleware to check if user is a phone vendor
export const requirePhoneVendor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const userRole = await getUserRole(req.user.userId);

  if (userRole !== 'phone_vendor') {
    throw createError('Phone vendor access required', 403);
  }

  next();
};

// Middleware to check if user is a laptop vendor
export const requireLaptopVendor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const userRole = await getUserRole(req.user.userId);

  if (userRole !== 'laptop_vendor') {
    throw createError('Laptop vendor access required', 403);
  }

  next();
};

// Middleware to check if user is any vendor
export const requireVendor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const userRole = await getUserRole(req.user.userId);

  if (userRole !== 'phone_vendor' && userRole !== 'laptop_vendor') {
    throw createError('Vendor access required', 403);
  }

  next();
};

// Middleware to check if user has admin privileges (admin or vendor)
export const requireAdminPrivileges = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const userRole = await getUserRole(req.user.userId);

  if (userRole !== 'admin' && userRole !== 'phone_vendor' && userRole !== 'laptop_vendor') {
    throw createError('Admin privileges required', 403);
  }

  next();
};
