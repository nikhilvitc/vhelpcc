'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/types/food';
import { 
  updateRestaurantSettings, 
  toggleRestaurantStatus,
  RestaurantSettings as RestaurantSettingsType 
} from '@/lib/restaurant-admin-api';
import { 
  ClockIcon, 
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface RestaurantSettingsProps {
  restaurant: Restaurant | null;
  onUpdate: () => void;
}

export default function RestaurantSettings({ restaurant, onUpdate }: RestaurantSettingsProps) {
  const [settings, setSettings] = useState<RestaurantSettingsType>({
    opening_time: '09:00:00',
    closing_time: '22:00:00',
    delivery_fee: 2.99,
    minimum_order: 10.00,
    is_active: true,
    description: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (restaurant) {
      setSettings({
        opening_time: restaurant.opening_time,
        closing_time: restaurant.closing_time,
        delivery_fee: restaurant.delivery_fee,
        minimum_order: restaurant.minimum_order,
        is_active: restaurant.is_active,
        description: restaurant.description || '',
        image_url: restaurant.image_url || ''
      });
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await updateRestaurantSettings(settings);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Restaurant settings updated successfully!' });
        onUpdate();
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await toggleRestaurantStatus();
      
      if (response.success) {
        const newStatus = response.data?.is_active ? 'opened' : 'closed';
        setMessage({ 
          type: 'success', 
          text: `Restaurant ${newStatus} successfully!` 
        });
        onUpdate();
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to toggle status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RestaurantSettingsType, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!restaurant) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading restaurant settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BuildingStorefrontIcon className="w-6 h-6 mr-2" />
            Restaurant Settings
          </h2>
        </div>

        <div className="p-6">
          {/* Restaurant Status Toggle */}
          <div className="mb-6 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {restaurant.is_active ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
                ) : (
                  <XCircleIcon className="w-8 h-8 text-red-500 mr-3" />
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Restaurant Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    {restaurant.is_active ? 'Currently accepting orders' : 'Currently closed for orders'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleStatus}
                disabled={loading}
                className={`px-4 py-2 rounded-md font-medium ${
                  restaurant.is_active
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {loading ? 'Updating...' : restaurant.is_active ? 'Close Restaurant' : 'Open Restaurant'}
              </button>
            </div>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Operating Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Opening Time
                </label>
                <input
                  type="time"
                  value={settings.opening_time}
                  onChange={(e) => handleInputChange('opening_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Closing Time
                </label>
                <input
                  type="time"
                  value={settings.closing_time}
                  onChange={(e) => handleInputChange('closing_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                  Delivery Fee ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.delivery_fee}
                  onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                  Minimum Order ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.minimum_order}
                  onChange={(e) => handleInputChange('minimum_order', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your restaurant..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhotoIcon className="w-4 h-4 inline mr-1" />
                Restaurant Image URL
              </label>
              <input
                type="url"
                value={settings.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/restaurant-image.jpg"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
