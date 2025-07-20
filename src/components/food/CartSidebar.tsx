'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { Cart, CartItem, Restaurant } from '@/types/food';
import { getRestaurantConfig } from '@/lib/restaurants';
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  formatPrice,
  getCartTotalWithFees,
  useCartListener,
  canAccessCart,
  requireAuthForCart
} from '@/lib/cart';
import { isAuthenticated, getCurrentUserSync } from '@/lib/auth';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant?: Restaurant;
  onCheckout?: (cart: Cart) => void;
}

export default function CartSidebar({ isOpen, onClose, restaurant, onCheckout }: CartSidebarProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Load cart on mount and listen for updates
  useEffect(() => {
    // Check authentication when cart opens
    if (isOpen) {
      const { canAccess, reason } = canAccessCart();

      if (!canAccess) {
        if (reason === 'authentication_required') {
          setAuthError('Please log in to view your cart');
        } else if (reason === 'cart_empty') {
          setAuthError('Your cart is empty');
        }
        return;
      }

      setAuthError(null);
    }

    setCart(getCart());

    const unsubscribe = useCartListener((updatedCart) => {
      setCart(updatedCart);

      // Clear auth error if cart is updated
      if (updatedCart && authError) {
        setAuthError(null);
      }
    });

    return unsubscribe;
  }, [isOpen, authError]);

  const config = restaurant ? getRestaurantConfig(restaurant) : null;

  const handleQuantityChange = (menuItemId: string, newQuantity: number, specialRequests?: string) => {
    updateCartItemQuantity(menuItemId, newQuantity, specialRequests);
  };

  const handleRemoveItem = (menuItemId: string, specialRequests?: string) => {
    removeFromCart(menuItemId, specialRequests);
  };

  const handleCheckout = () => {
    if (cart && restaurant && onCheckout) {
      setIsLoading(true);
      onCheckout(cart);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totals = cart && restaurant ? getCartTotalWithFees(cart, restaurant) : null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={config ? { backgroundColor: `${config.theme.primary}` } : {}}
          >
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold text-white">Your Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto">
            {authError ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">{authError}</p>
                {authError.includes('log in') ? (
                  <div className="text-center px-4">
                    <p className="text-sm mb-4">
                      Please log in to add items to your cart and place orders.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        requireAuthForCart(() => {}, window.location.pathname);
                      }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-center px-4">
                    Add some delicious items from the menu to get started!
                  </p>
                )}
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-sm text-center px-4">
                  Add some delicious items from the menu to get started!
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Restaurant Info */}
                {restaurant && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: config?.theme.primary }}
                    >
                      {config && <config.icon className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">{restaurant.description}</p>
                    </div>
                  </div>
                )}

                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.items.map((item, index) => (
                    <CartItemComponent
                      key={`${item.menu_item.id}-${item.special_requests || 'no-requests'}-${index}`}
                      item={item}
                      config={config}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Totals and Checkout */}
          {cart && cart.items.length > 0 && restaurant && totals && (
            <div className="border-t p-4 space-y-4 border-black text-black">
              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between ">
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(totals.deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(totals.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>

              {/* Minimum Order Warning */}
              {totals.subtotal < restaurant.minimum_order && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Minimum order: {formatPrice(restaurant.minimum_order)}
                    <br />
                    Add {formatPrice(restaurant.minimum_order - totals.subtotal)} more to continue
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading || totals.subtotal < restaurant.minimum_order}
                className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: config?.theme.primary || '#f97316',
                  ':hover': {
                    backgroundColor: config?.theme.primaryHover || '#ea580c'
                  }
                }}
              >
                {isLoading ? 'Processing...' : `Checkout • ${formatPrice(totals.total)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Individual Cart Item Component
interface CartItemComponentProps {
  item: CartItem;
  config: any;
  onQuantityChange: (menuItemId: string, newQuantity: number, specialRequests?: string) => void;
  onRemove: (menuItemId: string, specialRequests?: string) => void;
}

function CartItemComponent({ item, config, onQuantityChange, onRemove }: CartItemComponentProps) {
  const totalPrice = item.menu_item.price * item.quantity;

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-black">
      {/* Item Image/Icon */}
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
        {item.menu_item.image_url ? (
          <img
            src={item.menu_item.image_url}
            alt={item.menu_item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: config?.theme.primary || '#f97316' }}
          >
            <span className="text-white font-bold text-sm">
              {item.menu_item.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.menu_item.name}</h4>
        <p className="text-sm text-gray-600">{formatPrice(item.menu_item.price)} each</p>
        
        {item.special_requests && (
          <p className="text-xs text-gray-500 mt-1 italic">
            Note: {item.special_requests}
          </p>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onQuantityChange(item.menu_item.id, item.quantity - 1, item.special_requests)}
              className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3 text-gray-500" />
            </button>
            <span className="w-6 text-center text-gray-500 text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.menu_item.id, item.quantity + 1, item.special_requests)}
              className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
            <button
              onClick={() => onRemove(item.menu_item.id, item.special_requests)}
              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
