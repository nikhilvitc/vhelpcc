'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Smartphone, Laptop, FileText, Shield, ShieldCheck, ShieldX, LogIn, UserPlus } from 'lucide-react';
import { isAuthenticated, getCurrentUserSync } from '@/lib/auth';
import Link from 'next/link';

// Form validation schema
const repairFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternateContact: z.string().optional(),
  deviceModel: z.string().min(1, 'Device model is required'),
  problemDescription: z.string().min(10, 'Please provide a detailed description of the problem'),
});

type RepairFormData = z.infer<typeof repairFormSchema>;

interface RepairFormProps {
  serviceType: 'phone' | 'laptop';
  onSubmit: (data: RepairFormData) => Promise<void>;
  isLoading?: boolean;
  isAutoSubmitting?: boolean;
  defaultValues?: Partial<RepairFormData>;
}

export default function RepairForm({
  serviceType,
  onSubmit,
  isLoading = false,
  isAutoSubmitting = false,
  defaultValues
}: RepairFormProps) {
  const [apiError, setApiError] = useState('');
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [showRestoredMessage, setShowRestoredMessage] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RepairFormData>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: defaultValues || {},
  });

  // Check if form data was restored and show message
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      // Reset the form with the restored data
      reset(defaultValues);
      setShowRestoredMessage(true);
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowRestoredMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [defaultValues, reset]);

  // Check authentication status on mount and periodically
  useEffect(() => {
    const checkAuthStatus = () => {
      const user = getCurrentUserSync();
      const authenticated = isAuthenticated();

      setAuthStatus(authenticated && user ? 'authenticated' : 'unauthenticated');
    };

    // Set current URL for return navigation
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.pathname);
    }

    checkAuthStatus();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('auth-changed', handleAuthChange);

    // Check auth status every 30 seconds
    const interval = setInterval(checkAuthStatus, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const handleFormSubmit = async (data: RepairFormData) => {
    setApiError('');
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const serviceTitle = serviceType === 'phone' ? 'Smartphone Repair' : 'Laptop Repair';
  const deviceIcon = serviceType === 'phone' ? Smartphone : Laptop;
  const DeviceIcon = deviceIcon;

  // Show login prompt if user is not authenticated
  if (authStatus === 'unauthenticated') {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
            <DeviceIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Get professional {serviceTitle} services</p>
        </div> */}

        {/* Login Required Message */}
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-orange-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            To book a {serviceTitle.toLowerCase()} appointment, please log in to your account or create a new one.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/login?returnUrl=${encodeURIComponent(currentUrl)}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Log In
            </Link>

            <Link
              href={`/signup?returnUrl=${encodeURIComponent(currentUrl)}`}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </Link>
          </div>

          {/* <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Why do I need to log in?</h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Track your repair status and history</li>
              <li>• Receive updates via email and SMS</li>
              <li>• Manage multiple repair requests</li>
              <li>• Access exclusive customer benefits</li>
            </ul>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
          <DeviceIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
        <p className="text-sm text-gray-600">Fill this form to generate a query for {serviceTitle}</p>

        {isAutoSubmitting && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              🔄 Submitting your saved form data...
            </p>
          </div>
        )}

        {/* Authentication Status Indicator */}
        {/* <div className="mt-4 p-3 rounded-lg border">
          {authStatus === 'checking' && (
            <div className="flex items-center text-gray-600">
              <Shield className="w-4 h-4 mr-2 animate-pulse" />
              <span className="text-sm">Checking authentication status...</span>
            </div>
          )}
          {authStatus === 'authenticated' && (
            <div className="flex items-center text-green-700 bg-green-50 border-green-200">
              <ShieldCheck className="w-4 h-4 mr-2" />
              <span className="text-sm">✅ You are logged in. Form can be submitted directly.</span>
            </div>
          )}
        </div> */}
      </div>

      {/* Form Data Restored Message */}
      {showRestoredMessage && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            <span className="text-sm">✨ Your form data has been restored! You can continue where you left off.</span>
          </div>
        </div>
      )}

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
  {/* First Row - First Name and Last Name */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* First Name */}
    <div>
      <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">
        First Name *
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <input
          {...register('firstName')}
          type="text"
          id="firstName"
          className={`
            block w-full pl-8 pr-2 py-2 border rounded-md shadow-sm text-sm
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            ${errors.firstName ? 'border-red-300' : 'border-gray-300'}
          `}
          placeholder="Enter your first name"
        />
      </div>
      {errors.firstName && (
        <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
      )}
    </div>

    {/* Last Name */}
    <div>
      <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
        Last Name *
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <input
          {...register('lastName')}
          type="text"
          id="lastName"
          className={`
            block w-full pl-8 pr-2 py-2 border rounded-md shadow-sm text-sm
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            ${errors.lastName ? 'border-red-300' : 'border-gray-300'}
          `}
          placeholder="Enter your last name"
        />
      </div>
      {errors.lastName && (
        <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
      )}
    </div>
  </div>

  {/* Second Row - Phone Number and Alternate Contact */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Phone Number */}
    <div>
      <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 mb-1">
        Phone Number *
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Phone className="h-4 w-4 text-gray-400" />
        </div>
        <input
          {...register('phoneNumber')}
          type="tel"
          id="phoneNumber"
          className={`
            block w-full pl-8 pr-2 py-2 border rounded-md shadow-sm text-sm
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'}
          `}
          placeholder="Enter your contact number"
        />
      </div>
      {errors.phoneNumber && (
        <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>
      )}
    </div>

    {/* Alternate Contact Number */}
    <div>
      <label htmlFor="alternateContact" className="block text-xs font-medium text-gray-700 mb-1">
        Alternate contact number
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Phone className="h-4 w-4 text-gray-400" />
        </div>
        <input
          {...register('alternateContact')}
          type="tel"
          id="alternateContact"
          className="block w-full pl-8 pr-2 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter alternate contact number"
        />
      </div>
    </div>
  </div>

  {/* Third Row - Device Model (Full Width) */}
  <div>
    <label htmlFor="deviceModel" className="block text-xs font-medium text-gray-700 mb-1">
      Device Model
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <DeviceIcon className="h-4 w-4 text-gray-400" />
      </div>
      <input
        {...register('deviceModel')}
        type="text"
        id="deviceModel"
        className={`
          block w-full pl-8 pr-2 py-2 border rounded-md shadow-sm text-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          ${errors.deviceModel ? 'border-red-300' : 'border-gray-300'}
        `}
        placeholder={serviceType === 'phone' ? 'eg. Oppo Reno 10' : 'eg. MacBook Pro 13"'}
      />
    </div>
    {errors.deviceModel && (
      <p className="mt-1 text-xs text-red-600">{errors.deviceModel.message}</p>
    )}
  </div>

  {/* Fourth Row - Problem Description (Full Width) */}
  <div>
    <label htmlFor="problemDescription" className="block text-xs font-medium text-gray-700 mb-1">
      Describe the Problem
    </label>
    <div className="relative">
      <div className="absolute top-2 left-2 pointer-events-none">
        <FileText className="h-4 w-4 text-gray-400" />
      </div>
      <textarea
        {...register('problemDescription')}
        id="problemDescription"
        rows={3}
        className={`
          block w-full pl-8 pr-2 py-2 border rounded-md shadow-sm text-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          resize-none
          ${errors.problemDescription ? 'border-red-300' : 'border-gray-300'}
        `}
        placeholder="eg. display problem/need tempered glass"
      />
    </div>
    {errors.problemDescription && (
      <p className="mt-1 text-xs text-red-600">{errors.problemDescription.message}</p>
    )}
  </div>

  {/* reCAPTCHA placeholder */}
  <div className="flex items-center space-x-2">
    <input type="checkbox" id="recaptcha" className="h-3 w-3 text-blue-600 border-gray-300 rounded" />
    <label htmlFor="recaptcha" className="text-xs text-gray-600">
      I'm not a robot
    </label>
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    disabled={isLoading || isAutoSubmitting || authStatus === 'checking'}
    className={`
      w-full py-2 px-3 rounded-md font-medium text-white transition-colors duration-200 text-sm
      ${(isLoading || isAutoSubmitting || authStatus === 'checking')
        ? 'bg-gray-400 cursor-not-allowed'
        : authStatus === 'authenticated'
        ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1'
        : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-offset-1'
      }
    `}
  >
    {isAutoSubmitting
      ? 'Auto-submitting...'
      : isLoading
      ? 'Submitting...'
      : authStatus === 'checking'
      ? 'Checking authentication...'
      : authStatus === 'authenticated'
      ? 'Submit Repair Request'
      : 'Submit (Login Required)'
    }
  </button>
</form>
    </div>
  );
}
