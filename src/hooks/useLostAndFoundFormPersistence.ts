import { useState, useCallback } from 'react';
import { lostAndFoundApi, CreateLostAndFoundData } from '@/lib/lost-and-found-api';
import { isAuthenticated, requireAuth } from '@/lib/auth';

interface UseLostAndFoundFormPersistenceProps {
  redirectUrl: string;
}

export const useLostAndFoundFormPersistence = ({ redirectUrl }: UseLostAndFoundFormPersistenceProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  // Get stored form data from session storage
  const getStoredFormData = useCallback((): CreateLostAndFoundData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const storedData = sessionStorage.getItem('pendingLostAndFoundData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Check if data is not too old (24 hours)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.formData;
        } else {
          // Remove old data
          sessionStorage.removeItem('pendingLostAndFoundData');
        }
      }
    } catch (error) {
      console.error('Error parsing stored form data:', error);
      sessionStorage.removeItem('pendingLostAndFoundData');
    }
    
    return null;
  }, []);

  // Clear stored form data
  const clearStoredFormData = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingLostAndFoundData');
    }
  }, []);

  // Handle form submission with authentication check
  const handleFormSubmit = useCallback(async (data: CreateLostAndFoundData) => {
    setIsLoading(true);
    
    try {
      // Check authentication using the new system
      if (!isAuthenticated()) {
        // Store form data in session storage for restoration after signup
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingLostAndFoundData', JSON.stringify({
            formData: data,
            redirectUrl: redirectUrl,
            timestamp: Date.now()
          }));
        }

        // Use the new authentication system with service context
        requireAuth(() => {
          // This will be executed after successful authentication
        }, redirectUrl, 'lost-and-found');

        setIsLoading(false);
        return;
      }

      // Submit the lost and found item
      const lostAndFoundData: CreateLostAndFoundData = {
        item_name: data.item_name,
        item_image_url: data.item_image_url,
        category: data.category,
        place: data.place,
        description: data.description,
        contact_phone: data.contact_phone,
      };

      try {
        const result = await lostAndFoundApi.submitLostAndFoundItem(lostAndFoundData);

        if (result.success) {
          // Clear any stored form data on successful submission
          clearStoredFormData();

          // Show success message
          alert('Lost and found item submitted successfully!');

          // Trigger a custom event to refresh the browse section
          window.dispatchEvent(new CustomEvent('lost-and-found-item-created'));
        } else {
          // Handle API error response
          throw new Error(result.error || 'Failed to submit lost and found item');
        }

      } catch (error: any) {
        // Check if it's an authentication error
        if (error.message && (error.message.includes('User does not exist') || error.message.includes('authentication'))) {
          // Store form data for restoration after signup
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pendingLostAndFoundData', JSON.stringify({
              formData: data,
              redirectUrl: redirectUrl,
              timestamp: Date.now()
            }));
          }

          // Use the new authentication system
          requireAuth(() => {
            // This will be executed after successful authentication
          }, redirectUrl, 'lost-and-found');

          setIsLoading(false);
          return;
        }
        
        throw error;
      }
      
    } catch (error) {
      console.error('Error submitting lost and found item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [redirectUrl, clearStoredFormData]);

  // Auto-submit stored form data after authentication
  const autoSubmitStoredData = useCallback(async () => {
    const storedData = getStoredFormData();
    if (!storedData) return;

    setIsAutoSubmitting(true);
    try {
      await handleFormSubmit(storedData);
      clearStoredFormData();
    } catch (error) {
      console.error('Error auto-submitting stored data:', error);
    } finally {
      setIsAutoSubmitting(false);
    }
  }, [getStoredFormData, handleFormSubmit, clearStoredFormData]);

  return {
    handleFormSubmit,
    isLoading,
    isAutoSubmitting,
    getStoredFormData,
    clearStoredFormData,
    autoSubmitStoredData,
  };
};
