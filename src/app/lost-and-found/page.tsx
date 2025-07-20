'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, MapPin, Calendar, User, Phone, Mail, Filter, Eye, CheckCircle, Upload, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { lostAndFoundApi, LostAndFoundItem, CreateLostAndFoundData } from '@/lib/lost-and-found-api';
import { useLostAndFoundFormPersistence } from '@/hooks/useLostAndFoundFormPersistence';
import { isAuthenticated } from '@/lib/auth';

export default function LostAndFoundPage() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [showRestoredMessage, setShowRestoredMessage] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const [formData, setFormData] = useState<CreateLostAndFoundData>({
    item_name: '',
    category: 'lost',
    place: '',
    description: '',
    contact_phone: '',
    item_image_url: '',
  });

  const {
    handleFormSubmit,
    isLoading,
    isAutoSubmitting,
    getStoredFormData,
    clearStoredFormData,
    autoSubmitStoredData,
  } = useLostAndFoundFormPersistence({
    redirectUrl: '/lost-and-found'
  });

  useEffect(() => {
  if (typeof window !== 'undefined') {
    setCurrentUrl(window.location.pathname);
  }
}, []);


  // Load lost and found items
  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      const response = await lostAndFoundApi.getLostAndFoundItems({
        category: selectedType === 'all' ? undefined : selectedType as 'lost' | 'found',
        status: 'active',
        search: searchTerm || undefined,
      });
      setItems(response.items);
    } catch (error) {
      console.error('Error loading lost and found items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const authenticated = isAuthenticated();
      setAuthStatus(authenticated ? 'authenticated' : 'unauthenticated');
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus('unauthenticated');
    }
  };

  // Handle authentication changes
  const handleAuthChange = () => {
    checkAuthStatus();
  };

  useEffect(() => {
    loadItems();
  }, [selectedType, searchTerm]);

  useEffect(() => {
    checkAuthStatus();

    // Check for stored form data and show message if found
    const storedData = getStoredFormData();
    if (storedData) {
      setShowRestoredMessage(true);
      setFormData(storedData);
      setActiveTab('post');

      // Auto-submit if user is authenticated
      if (isAuthenticated()) {
        autoSubmitStoredData();
      }
    }

    // Listen for authentication changes
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('auth-changed', handleAuthChange);

    // Listen for new items created
    window.addEventListener('lost-and-found-item-created', loadItems);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('lost-and-found-item-created', loadItems);
    };
  }, []);

  const categories = ['Electronics', 'Bags', 'Accessories', 'Personal Items', 'Books', 'Clothing', 'Keys', 'Other'];

  const getTypeColor = (type: string) => {
    return type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.category === selectedType;

    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submitted with data:', formData);
    console.log('Authentication status:', authStatus);
    console.log('Is authenticated:', isAuthenticated());

    // Debug localStorage contents
    console.log('=== localStorage Debug ===');
    console.log('user:', localStorage.getItem('user'));
    console.log('auth_token:', localStorage.getItem('auth_token'));
    console.log('user_data:', localStorage.getItem('user_data'));
    console.log('========================');

    try {
      await handleFormSubmit(formData);
      // Reset form on successful submission
      setFormData({
        item_name: '',
        category: 'lost',
        place: '',
        description: '',
        contact_phone: '',
        item_image_url: '',
      });
      setShowRestoredMessage(false);
      alert('Item posted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error submitting item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#233d8e] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              className="flex items-center text-white hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              Lost and Found
            </h1>
            <p className="text-base text-orange-100 max-w-3xl mx-auto">
              Report lost items or help others find their belongings
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-[#233d8e] text-white'
                  : 'text-black hover:text-[#233d8e]'
              }`}
            >
              <Search className="w-5 h-5 inline mr-2" />
              Browse Items
            </button>
            <button
              onClick={() => setActiveTab('post')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'post'
                  ? 'bg-[#233d8e] text-white'
                  : 'text-black hover:text-[#233d8e]'
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Post Item
            </button>
          </div>
        </div>

        {/* Browse Items Tab */}
        {activeTab === 'browse' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-black">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Lost & Found</option>
                    <option value="lost">Lost Items</option>
                    <option value="found">Found Items</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            {isLoadingItems ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading items...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {item.item_image_url && (
                      <img
                        src={item.item_image_url}
                        alt={item.item_name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{item.item_name}</h3>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.category)}`}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description || 'No description provided'}</p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{item.place}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        {item.user && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>{item.user.first_name} {item.user.last_name}</span>
                          </div>
                        )}
                      </div>

                      {item.contact_phone && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-1" />
                            <span>{item.contact_phone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingItems && filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or post a new item.</p>
              </div>
            )}
          </div>
        )}

        {/* Post Item Tab */}
        {activeTab === 'post' && (
          <div className="max-w-2xl mx-auto">
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Post a Lost or Found Item</h2>

    {/* Sign-in Modal */}
    {authStatus === 'unauthenticated' && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
            <p className="text-sm text-gray-600 mb-6">You need to be logged in to post a lost or found item. Your form data will be saved and submitted after you log in.</p>
            <div className="flex gap-3">
              <button onClick={()=>window.location.href=`/login?returnUrl=${encodeURIComponent(currentUrl)}`} className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                Sign In
              </button>
              <button onClick={()=>setActiveTab('browse')} className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Form Data Restored Message */}
    {showRestoredMessage && (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
        <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">Form Data Restored</h3>
          <p className="text-sm text-blue-700">Your previously entered form data has been restored.</p>
        </div>
        <button onClick={() => setShowRestoredMessage(false)} className="text-blue-600 hover:text-blue-500 text-sm ml-2">×</button>
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-4 text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="lost">Lost Item</option>
            <option value="found">Found Item</option>
          </select>
        </div>

        <div>
          <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
          <input
            type="text"
            id="item_name"
            name="item_name"
            required
            value={formData.item_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Black iPhone 13"
          />
        </div>
      </div>

      <div>
        <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
        <input
          type="text"
          id="place"
          name="place"
          required
          value={formData.place}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Where was it lost/found?"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Provide detailed information about the item..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
          <input
            type="tel"
            id="contact_phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Your phone number"
          />
        </div>

        <div>
          <label htmlFor="item_image_url" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="url"
            id="item_image_url"
            name="item_image_url"
            value={formData.item_image_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Image URL"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">Upload images to Imgur and paste the URL above.</p>

      <button
        type="submit"
        disabled={isLoading || isAutoSubmitting}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading || isAutoSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isAutoSubmitting ? 'Auto-submitting...' : 'Submitting...'}
          </div>
        ) : (
          'Post Item'
        )}
      </button>
    </form>
  </div>
</div>
        )}
      </div>

      {/* <Footer /> */}
    </div>
  );
}
