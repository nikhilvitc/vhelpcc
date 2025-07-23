'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FoodOrder, Restaurant } from '@/types/food';
import {
  getRestaurantConfig
} from '@/lib/restaurants';
import { findRestaurantBySlugFromDB } from '@/lib/restaurant-utils';
import { getFoodOrderByToken } from '@/lib/food-api';
import { isAuthenticated, requireAuth } from '@/lib/auth';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const token = params.token as string;

  const [order, setOrder] = useState<FoodOrder | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializePage = async () => {
      // Check authentication
      if (!isAuthenticated()) {
        requireAuth(() => {
          // After login, reload the page
          window.location.reload();
        }, window.location.pathname, 'food');
        return;
      }

      // Find restaurant
      const foundRestaurant = await findRestaurantBySlugFromDB(slug);
      if (!foundRestaurant) {
        setError('Restaurant not found');
        setIsLoading(false);
        return;
      }
      setRestaurant(foundRestaurant);

      // Fetch order details
      fetchOrderDetails();
    };

    initializePage();
  }, [slug, token]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const result = await getFoodOrderByToken(token);
      
      if (!result.success) {
        setError(result.error || 'Failed to load order details');
        return;
      }

      setOrder(result.data || null);
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The order you are looking for could not be found.'}</p>
            <button
              onClick={() => router.push('/food')}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Restaurants
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const config = getRestaurantConfig(restaurant);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/food/${slug}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {restaurant.name}
        </button>

        {/* Order Confirmation Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Thank you for your order. We'll prepare it with care.
          </p>
          <div className="text-center">
            <span className="text-sm text-gray-500">Order #</span>
            <span className="font-mono font-bold text-lg ml-1 text-black">{order.order_token}</span>
          </div>
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              {order.estimated_delivery_time && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Delivery</span>
                  <div className="flex items-center text-gray-900">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(order.estimated_delivery_time).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="text-gray-900">{order.delivery_address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="text-gray-900">{order.delivery_phone}</p>
                </div>
              </div>
              {order.special_instructions && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Special Instructions</p>
                  <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">
                    {order.special_instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div> */}

        {/* Order Items */}
        {/* <div className="bg-white rounded-xl shadow-sm p-6 mt-6"> */}
          {/* <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.food_order_items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.menu_item?.name}</h3>
                  {item.special_requests && (
                    <p className="text-sm text-gray-600 mt-1">Note: {item.special_requests}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-gray-600">Qty: {item.quantity}</p>
                  <p className="font-medium text-gray-900">{formatPrice(item.total_price)}</p>
                </div>
              </div>
            ))}
          </div> */}

          {/* Order Total */}
          {/* <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice((order.total_amount - order.delivery_fee - order.tax_amount))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{formatPrice(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div> */}
        {/* </div> */}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={() => router.push(`/food/${slug}`)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Order Again
          </button>
          <button
            onClick={() => router.push('/food')}
            className="flex-1 px-6 py-3 text-white rounded-lg transition-colors"
            style={{ backgroundColor: config.theme.primary }}
          >
            Browse Restaurants
          </button>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
