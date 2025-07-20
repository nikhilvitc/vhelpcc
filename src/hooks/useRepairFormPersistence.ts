'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, requireAuth, getCurrentUserSync } from '@/lib/auth';
import { createRepairOrder, RepairOrderData } from '@/lib/repair-api';

interface RepairFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternateContact?: string;
  deviceModel: string;
  problemDescription: string;
}

interface UseRepairFormPersistenceProps {
  serviceType: 'phone' | 'laptop';
  redirectUrl: string;
}

export function useRepairFormPersistence({ serviceType, redirectUrl }: UseRepairFormPersistenceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const router = useRouter();

  // Check for pending form data on component mount
  useEffect(() => {
    const checkForPendingFormData = () => {
      // Check if user is now logged in
      const user = getCurrentUserSync();
      const authenticated = isAuthenticated();

      if (authenticated && user) {
        // Check for pending form data in session storage
        const pendingData = sessionStorage.getItem('pendingFormData');
        if (pendingData) {
          try {
            const parsedData = JSON.parse(pendingData);
            if (parsedData.form_0 && parsedData.serviceType === serviceType) {
              // Don't remove the data here - let the form use it as defaultValues
              // The data will be cleared after successful submission
            }
          } catch (error) {
            console.error('Error processing pending form data:', error);
            // Clear corrupted data
            sessionStorage.removeItem('pendingFormData');
          }
        }
      }
    };

    checkForPendingFormData();
  }, [serviceType]);

  const handleFormSubmit = async (data: RepairFormData) => {
    setIsLoading(true);

    try {
      // Check authentication using the new system
      if (!isAuthenticated()) {

        // Store form data in session storage for restoration after signup
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingFormData', JSON.stringify({
            form_0: data,
            serviceType: serviceType,
            redirectUrl: redirectUrl,
            timestamp: Date.now()
          }));
        }

        // Use the new authentication system with service context
        requireAuth(() => {
          // This will be executed after successful authentication
        }, redirectUrl, 'repair');

        setIsLoading(false);
        return;
      }

      // Submit the repair request
      const repairOrderData: RepairOrderData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        alternateContact: data.alternateContact,
        deviceModel: data.deviceModel,
        problemDescription: data.problemDescription,
        serviceType: serviceType
      };

      try {
        // Submit to Supabase
        const result = await createRepairOrder(repairOrderData);

        if (!result.success) {
          throw new Error(result.error || 'Failed to submit repair order');
        }

        // Clear any stored data
        sessionStorage.removeItem('pendingFormData');

        // Show success message with order ID
        const orderId = result.data?.id?.slice(0, 8) || 'Unknown';
        alert(`✅ Repair request submitted successfully!\n\nOrder ID: ${orderId}\nStatus: Pending\n\nWe will contact you soon to confirm your repair appointment.`);

      } catch (error: any) {
        // Check if it's an authentication error
        if (error.message && (error.message.includes('User does not exist') || error.message.includes('authentication'))) {

          // Store form data for restoration after signup
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pendingFormData', JSON.stringify({
              form_0: data,
              serviceType: serviceType,
              redirectUrl: redirectUrl,
              timestamp: Date.now()
            }));
          }

          // Use the new authentication system
          requireAuth(() => {
            // This will be executed after successful authentication
          }, redirectUrl, 'repair');

          setIsLoading(false);
          return;
        }
        
        throw error;
      }
      
    } catch (error) {
      console.error('Error submitting repair request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredFormData = useCallback((): RepairFormData | null => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return null;

    try {
      const storedData = sessionStorage.getItem('pendingFormData');
      if (!storedData) return null;

      const parsedData = JSON.parse(storedData);

      // Check if the stored data is for the current service type
      if (parsedData.form_0 && parsedData.serviceType === serviceType) {
        return {
          firstName: parsedData.form_0.firstName || '',
          lastName: parsedData.form_0.lastName || '',
          phoneNumber: parsedData.form_0.phoneNumber || '',
          alternateContact: parsedData.form_0.alternateContact || '',
          deviceModel: parsedData.form_0.deviceModel || '',
          problemDescription: parsedData.form_0.problemDescription || '',
        };
      }
    } catch (error) {
      console.error('Error parsing stored form data:', error);
      // Clear corrupted data only if we're in the browser
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingFormData');
      }
    }
    return null;
  }, [serviceType]);

  const clearStoredData = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingFormData');
    }
  }, []);

  return {
    handleFormSubmit,
    isLoading,
    isAutoSubmitting,
    getStoredFormData,
    clearStoredData,
  };
}
