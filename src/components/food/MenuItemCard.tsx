'use client';

import React, { useState } from 'react';
import { Plus, Minus, Clock, AlertCircle } from 'lucide-react';
import { MenuItem, Restaurant } from '@/types/food';
import { getRestaurantConfig } from '@/lib/restaurants';
import { addToCart, formatPrice } from '@/lib/cart';
import { isAuthenticated } from '@/lib/auth';

interface MenuItemCardProps {
  menuItem: MenuItem;
  restaurant: Restaurant;
  className?: string;
  onAddToCart?: (menuItem: MenuItem, quantity: number, specialRequests?: string) => void;
}

export default function MenuItemCard({ 
  menuItem, 
  restaurant, 
  className = '',
  onAddToCart 
}: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [showSpecialRequests, setShowSpecialRequests] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const config = getRestaurantConfig(restaurant);

  const handleAddToCart = async () => {
    if (!menuItem.is_available) return;

    setIsAdding(true);

    try {
      if (onAddToCart) {
        onAddToCart(menuItem, quantity, specialRequests || undefined);
      } else {
        const result = addToCart(menuItem, quantity, specialRequests || undefined);

        // If addToCart returns null, it means user needs to login
        if (result === null) {
          setIsAdding(false);
          return;
        }
      }

      // Reset form only if successfully added
      setQuantity(1);
      setSpecialRequests('');
      setShowSpecialRequests(false);

      // Show success feedback (you might want to use a toast library)
      console.log(`Added ${quantity} ${menuItem.name} to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden ${className}`}
      style={{
        '--restaurant-primary': config.theme.primary,
        '--restaurant-secondary': config.theme.secondary,
        '--restaurant-accent': config.theme.accent,
      } as React.CSSProperties}
    >
      {/* Menu Item Image */}
      <div className="relative h-48 bg-gray-100">
        {menuItem.image_url ? (
          <img
            src={menuItem.image_url}
            alt={menuItem.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${config.theme.primary}10` }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: config.theme.primary }}
            >
              <span className="text-white font-bold text-xl">
                {menuItem.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Availability Badge */}
        {!menuItem.is_available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Unavailable
            </div>
          </div>
        )}
      </div>

      {/* Menu Item Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {menuItem.name}
          </h3>
          <span 
            className="text-lg font-bold ml-2"
            style={{ color: config.theme.primary }}
          >
            {formatPrice(menuItem.price)}
          </span>
        </div>

        {menuItem.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {menuItem.description}
          </p>
        )}

        {/* Category and Prep Time */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          {menuItem.category && (
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {menuItem.category}
            </span>
          )}
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{menuItem.preparation_time} min</span>
          </div>
        </div>

        {/* Quantity Selector */}
        {menuItem.is_available && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={decrementQuantity}
                  className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 text-gray-500" />
                </button>
                <span className="w-8 text-center text-gray-500 font-medium">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Special Requests Toggle */}
            <button
              onClick={() => setShowSpecialRequests(!showSpecialRequests)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showSpecialRequests ? 'Hide' : 'Add'} special requests
            </button>

            {/* Special Requests Input */}
            {showSpecialRequests && (
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requests or modifications..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                style={{ 
                  '--tw-ring-color': config.theme.primary + '50'
                } as React.CSSProperties}
                rows={2}
              />
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: config.theme.primary,
                ':hover': {
                  backgroundColor: config.theme.primaryHover
                }
              }}
            >
              {isAdding ? 'Adding...' : `Add to Cart • ${formatPrice(menuItem.price * quantity)}`}
            </button>
          </div>
        )}

        {/* Unavailable Message */}
        {!menuItem.is_available && (
          <div className="text-center py-3">
            <p className="text-red-600 text-sm font-medium">
              This item is currently unavailable
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Menu Grid Component
interface MenuGridProps {
  menuItems: MenuItem[];
  restaurant: Restaurant;
  className?: string;
  onAddToCart?: (menuItem: MenuItem, quantity: number, specialRequests?: string) => void;
}

export function MenuGrid({ menuItems, restaurant, className = '', onAddToCart }: MenuGridProps) {
  // Group menu items by category
  const groupedItems = menuItems.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className={className}>
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((menuItem) => (
              <MenuItemCard
                key={menuItem.id}
                menuItem={menuItem}
                restaurant={restaurant}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
