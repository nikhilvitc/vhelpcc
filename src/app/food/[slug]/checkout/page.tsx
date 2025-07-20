'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, CreditCard, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Restaurant, Cart, FoodOrder } from '@/types/food';
import {
  getRestaurantConfig
} from '@/lib/restaurants';
import { findRestaurantBySlugFromDB } from '@/lib/restaurant-utils';
import {
  getCart,
  formatPrice,
  getCartTotalWithFees,
  validateCart,
  generateOrderToken,
  clearCart,
  requireAuthForCart
} from '@/lib/cart';
import { getCurrentUserSync, isAuthenticated } from '@/lib/auth';
import { createFoodOrder, CreateFoodOrderData } from '@/lib/food-api';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  specialInstructions: string;
  paymentMethod: 'card' | 'cash';
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    specialInstructions: '',
    paymentMethod: 'card'
  });

  // Load restaurant and cart data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Check authentication first
        if (!isAuthenticated()) {
          requireAuthForCart(() => {}, `/food/${slug}/checkout`);
          return;
        }

        // Find restaurant by slug from database
        const foundRestaurant = await findRestaurantBySlugFromDB(slug);

        if (!foundRestaurant) {
          router.push('/food');
          return;
        }

        setRestaurant(foundRestaurant);

        // Get current cart
        const currentCart = getCart();
        if (!currentCart || currentCart.restaurant_id !== foundRestaurant.id) {
          router.push(`/food/${slug}`);
          return;
        }

        setCart(currentCart);

        // Pre-fill form with user data
        const currentUser = getCurrentUserSync();
        if (currentUser) {
          setForm(prev => ({
            ...prev,
            firstName: currentUser.first_name || '',
            lastName: currentUser.last_name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            address: currentUser.address || ''
          }));
        }

        // Validate cart
        const validation = validateCart(currentCart, foundRestaurant);
        if (!validation.isValid) {
          setErrors(validation.errors);
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
        router.push('/food');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug, router]);

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!form.firstName.trim()) newErrors.push('First name is required');
    if (!form.lastName.trim()) newErrors.push('Last name is required');
    if (!form.email.trim()) newErrors.push('Email is required');
    if (!form.phone.trim()) newErrors.push('Phone number is required');
    if (!form.address.trim()) newErrors.push('Address is required');
    // if (!form.city.trim()) newErrors.push('City is required');
    // if (!form.zipCode.trim()) newErrors.push('ZIP code is required');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.push('Please enter a valid email address');
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      newErrors.push('Please enter a valid phone number');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant || !cart) return;

    // Validate form
    if (!validateForm()) return;

    // Validate cart again
    const cartValidation = validateCart(cart, restaurant);
    if (!cartValidation.isValid) {
      setErrors(cartValidation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order object
      const totals = getCartTotalWithFees(cart, restaurant);
      const orderToken = generateOrderToken();

      const orderData: CreateFoodOrderData = {
        restaurant_id: restaurant.id,
        order_token: orderToken,
        total_amount: totals.total,
        delivery_fee: totals.deliveryFee,
        tax_amount: totals.tax,
        delivery_address: `${form.address}, ${form.city}, ${form.zipCode}`,
        delivery_phone: form.phone,
        special_instructions: form.specialInstructions || undefined,
        estimated_delivery_time: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
        cart_items: cart.items
      };

      // Submit order to Supabase
      const result = await createFoodOrder(orderData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create food order');
      }

      // Clear cart after successful order
      clearCart();

      // Redirect to order confirmation
      router.push(`/food/${slug}/order/${orderToken}`);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrors(['Failed to submit order. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!restaurant || !cart) {
    return null;
  }

  const config = getRestaurantConfig(restaurant);
  const totals = getCartTotalWithFees(cart, restaurant);

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        '--restaurant-primary': config.theme.primary,
        '--restaurant-secondary': config.theme.secondary,
        '--restaurant-accent': config.theme.accent,
      } as React.CSSProperties}
    >
      {/* <Header /> */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/food/${slug}`)}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Menu
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium mb-2">Please fix the following errors:</h3>
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    readOnly
                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': config.theme.primary + '50'
                    } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    readOnly
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': config.theme.primary + '50'
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': config.theme.primary + '50'
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  readOnly
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': config.theme.primary + '50'
                  } as React.CSSProperties}
                />
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={form.address}
                  readOnly
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': config.theme.primary + '50'
                  } as React.CSSProperties}
                />
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': config.theme.primary + '50'
                    } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': config.theme.primary + '50'
                    } as React.CSSProperties}
                  />
                </div>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={form.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  rows={3}
                  placeholder="Any special delivery instructions..."
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent resize-none"
                  style={{ 
                    '--tw-ring-color': config.theme.primary + '50'
                  } as React.CSSProperties}
                />
              </div>

              {/* Payment Method */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="card"
                      checked={form.paymentMethod === 'card'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="w-5 h-5 mr-2" />
                    Credit/Debit Card
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cash"
                      checked={form.paymentMethod === 'cash'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="mr-3"
                    />
                    <span className="w-5 h-5 mr-2 flex items-center justify-center text-sm">💵</span>
                    Cash on Delivery
                  </label>
                </div>
              </div> */}

              <button
                type="submit"
                disabled={isSubmitting || errors.length > 0}
                className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: config.theme.primary,
                  ':hover': {
                    backgroundColor: config.theme.primaryHover
                  }
                }}
              >
                {isSubmitting ? 'Placing Order...' : `Place Order • ${formatPrice(totals.total)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Restaurant Info */}
            <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-6">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: config.theme.primary }}
              >
                <config.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">{restaurant.description}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
              {cart.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.menu_item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.menu_item.price)} × {item.quantity}
                    </p>
                    {item.special_requests && (
                      <p className="text-xs text-gray-500 italic">
                        Note: {item.special_requests}
                      </p>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatPrice(item.menu_item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 border-black text-black">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>{formatPrice(totals.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
            </div>

            {/* Estimated Delivery Time */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-800">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">Estimated Delivery: 30-45 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}
