import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';
import {
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthenticatedRequest,
  User,
  UserRow,
} from '../types';

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createError('JWT secret not configured', 500);
  }

  return jwt.sign(
    { userId, email },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

// Helper function to convert UserRow to User
const formatUser = (userRow: UserRow): User => ({
  id: userRow.id,
  email: userRow.email,
  firstName: userRow.first_name,
  lastName: userRow.last_name,
  phone: userRow.phone || undefined,
  address: userRow.address || undefined,
  role: userRow.role,
  createdAt: userRow.created_at,
  updatedAt: userRow.updated_at,
});

// Login controller - Updated to use Supabase Auth
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Use Supabase Auth to sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      throw createError('Invalid email or password', 401);
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      throw createError('User profile not found', 404);
    }

    // Generate JWT token for API authentication
    const token = generateToken(userProfile.id, userProfile.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: formatUser(userProfile),
      token,
      session: authData.session
    });
  } catch (error) {
    next(error);
  }
};

// Signup controller - Updated to use Supabase Auth
export const signup = async (
  req: Request<{}, {}, SignupRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Use Supabase Auth to create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || '',
          address: address || '',
          role: 'customer'
        }
      }
    });

    if (authError || !authData.user) {
      if (authError?.message.includes('already registered')) {
        throw createError('User with this email already exists', 409);
      }
      throw createError(authError?.message || 'Failed to create user', 500);
    }

    // The user profile will be automatically created by the database trigger
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get the created user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      throw createError('User profile creation failed', 500);
    }

    // Generate JWT token for API authentication
    const token = generateToken(userProfile.id, userProfile.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: formatUser(userProfile),
      token,
      session: authData.session
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password controller
export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name')
      .eq('email', email)
      .single();

    // Always return success to prevent email enumeration
    if (error || !user) {
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      throw createError('Failed to generate reset token', 500);
    }

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken, user.first_name);
      console.log(`Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't throw error here to prevent email enumeration
      // The user will still get a success message
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  } catch (error) {
    next(error);
  }
};

// Reset password controller
export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Find valid reset token
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !resetToken) {
      throw createError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', resetToken.user_id);

    if (updateError) {
      throw createError('Failed to update password', 500);
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Verify token controller
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not found in request', 401);
    }

    // Get user details
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      throw createError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};
