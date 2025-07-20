'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Star, Truck, AlertCircle } from 'lucide-react';
import { Restaurant } from '@/types/food';
import { getRestaurantConfig, isRestaurantOpen } from '@/lib/restaurants';

interface RestaurantCardProps {
  restaurant: Restaurant;
  className?: string;
}

export default function RestaurantCard({ restaurant, className = '' }: RestaurantCardProps) {
  const config = getRestaurantConfig(restaurant);
  const IconComponent = config.icon;
  const isOpen = isRestaurantOpen(restaurant);
  const isActive = restaurant.is_active;

  // Handle inactive restaurants
  if (!isActive) {
    return (
      <div className={`group block ${className}`}>
        <div className="relative bg-gray-100 rounded-xl shadow-lg border border-gray-200 overflow-hidden opacity-60 cursor-not-allowed">
          {/* Inactive Restaurant Content */}
          <div className="relative h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Currently Closed</p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-500">{restaurant.name}</h3>
              <div className="flex items-center text-gray-400">
                <IconComponent className="w-5 h-5 mr-1" />
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {restaurant.description || 'This restaurant is temporarily not in service.'}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-red-500">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="font-medium">Not in Service</span>
              </div>
              <div className="text-gray-400">
                <span>Temporarily Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/food/${restaurant.slug}`}
      className={`group block ${className}`}
    >
      <div
        className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-gray-200 hover:border-gray-300 overflow-hidden"
        style={{
          '--restaurant-primary': config.theme.primary,
          '--restaurant-secondary': config.theme.secondary,
          '--restaurant-accent': config.theme.accent,
        } as React.CSSProperties}
      >
        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* Restaurant Image or Icon */}
        <div 
          className="h-32 flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${config.theme.primary}15, ${config.theme.secondary}15)`
          }}
        >
          {restaurant.image_url ? (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: config.theme.primary }}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
            {restaurant.name}
          </h3>
          
          {restaurant.description && (
            <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-500 transition-colors">
              {restaurant.description}
            </p>
          )}

          {/* Restaurant Details */}
          <div className="space-y-2">
            {/* Operating Hours */}
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>
                {restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}
              </span>
            </div>

            {/* Delivery Info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <Truck className="w-3 h-3 mr-1" />
                <span>${restaurant.delivery_fee.toFixed(2)} delivery</span>
              </div>
              <div className="flex items-center">
                <span>Min: ${restaurant.minimum_order.toFixed(2)}</span>
              </div>
            </div>

            {/* Rating (placeholder for future implementation) */}
            <div className="flex items-center text-xs text-gray-500">
              <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
              <span>4.5 (120+ reviews)</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <div 
              className="w-full py-2 px-4 rounded-lg text-white text-sm font-medium text-center transition-all duration-200 group-hover:shadow-lg"
              style={{
                backgroundColor: config.theme.primary,
                ':hover': {
                  backgroundColor: config.theme.primaryHover
                }
              }}
            >
              {isOpen ? 'Order Now' : 'View Menu'}
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: config.theme.primary }}
        />
      </div>
    </Link>
  );
}

// Restaurant Grid Component
interface RestaurantGridProps {
  restaurants: Restaurant[];
  className?: string;
}

export function RestaurantGrid({ restaurants, className = '' }: RestaurantGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}

// Restaurant List Component (for mobile or compact view)
interface RestaurantListProps {
  restaurants: Restaurant[];
  className?: string;
}

export function RestaurantList({ restaurants, className = '' }: RestaurantListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {restaurants.map((restaurant) => {
        const config = getRestaurantConfig(restaurant);
        const IconComponent = config.icon;
        const isOpen = isRestaurantOpen(restaurant);

        return (
          <Link
            key={restaurant.id}
            href={`/food/${restaurant.slug}`}
            className="block"
          >
            <div className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-gray-300">
              {/* Restaurant Icon */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                style={{ backgroundColor: config.theme.primary }}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </div>

              {/* Restaurant Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {restaurant.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                {restaurant.description && (
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {restaurant.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="w-3 h-3 mr-1" />
                      <span>${restaurant.delivery_fee.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                    <span>4.5</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
