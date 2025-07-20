'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ServiceControlsProps {
  serviceType?: 'phone' | 'laptop';
}

interface ServiceSettings {
  isActive: boolean;
  maxDailyOrders: number;
  estimatedTurnaroundDays: number;
  basePrice: number;
  emergencyMultiplier: number;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  autoAssignment: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

const ServiceControls: React.FC<ServiceControlsProps> = ({ serviceType }) => {
  const [settings, setSettings] = useState<ServiceSettings>({
    isActive: true,
    maxDailyOrders: 10,
    estimatedTurnaroundDays: 3,
    basePrice: 50,
    emergencyMultiplier: 1.5,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    autoAssignment: false,
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, [serviceType]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, you would load these from a service_settings table
      // For now, we'll use default values and localStorage for persistence
      const savedSettings = localStorage.getItem(`service_settings_${serviceType || 'general'}`);
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage (in a real app, this would be saved to database)
      localStorage.setItem(`service_settings_${serviceType || 'general'}`, JSON.stringify(settings));
      
      // Update service_types table if needed
      if (serviceType) {
        const { error } = await supabase
          .from('service_types')
          .update({ 
            is_active: settings.isActive,
            updated_at: new Date().toISOString()
          })
          .eq('name', serviceType);

        if (error) {
          throw error;
        }
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {serviceType ? `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service Controls` : 'Service Controls'}
        </h2>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Service Active</label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.isActive ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Daily Orders
            </label>
            <input
              type="number"
              min="1"
              value={settings.maxDailyOrders}
              onChange={(e) => setSettings(prev => ({ ...prev, maxDailyOrders: parseInt(e.target.value) || 1 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Turnaround (Days)
            </label>
            <input
              type="number"
              min="1"
              value={settings.estimatedTurnaroundDays}
              onChange={(e) => setSettings(prev => ({ ...prev, estimatedTurnaroundDays: parseInt(e.target.value) || 1 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.basePrice}
              onChange={(e) => setSettings(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Multiplier
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={settings.emergencyMultiplier}
              onChange={(e) => setSettings(prev => ({ ...prev, emergencyMultiplier: parseFloat(e.target.value) || 1 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                <input
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                <input
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
            <div className="grid grid-cols-2 gap-2">
              {daysOfWeek.map(day => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.workingDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Auto Assignment</label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, autoAssignment: !prev.autoAssignment }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoAssignment ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoAssignment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    notifications: { ...prev.notifications, email: e.target.checked }
                  }))}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Email Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    notifications: { ...prev.notifications, sms: e.target.checked }
                  }))}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">SMS Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    notifications: { ...prev.notifications, push: e.target.checked }
                  }))}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Push Notifications</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceControls;
