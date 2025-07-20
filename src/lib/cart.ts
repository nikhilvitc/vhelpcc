// Cart management utilities for restaurant-specific functionality
import { Cart, CartItem, MenuItem, Restaurant } from '@/types/food';
import { isAuthenticated, getCurrentUserSync, requireAuth } from '@/lib/auth';

const CART_STORAGE_KEY = 'vhelpcc_food_cart';

// Get cart from localStorage
export const getCart = (): Cart | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : null;
  } catch (error) {
    console.error('Error parsing cart data:', error);
    return null;
  }
};

// Save cart to localStorage
export const saveCart = (cart: Cart): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  } catch (error) {
    console.error('Error saving cart data:', error);
  }
};

// Clear cart from localStorage
export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: null }));
};

// Initialize empty cart for a restaurant
export const initializeCart = (restaurantId: string): Cart => {
  return {
    restaurant_id: restaurantId,
    items: [],
    total_amount: 0
  };
};

// Add item to cart without authentication check (allow guest cart)
export const addToCart = (menuItem: MenuItem, quantity: number = 1, specialRequests?: string): Cart | null => {
  // Allow adding to cart without authentication
  // Authentication will be required only when accessing cart for checkout

  let cart = getCart();

  // If no cart exists or cart is for different restaurant, create new cart
  if (!cart || cart.restaurant_id !== menuItem.restaurant_id) {
    cart = initializeCart(menuItem.restaurant_id);
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.menu_item.id === menuItem.id && item.special_requests === specialRequests
  );

  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    const cartItem: CartItem = {
      menu_item: menuItem,
      quantity,
      special_requests: specialRequests
    };
    cart.items.push(cartItem);
  }

  // Recalculate total
  cart.total_amount = calculateCartTotal(cart.items);

  saveCart(cart);
  return cart;
};

// Remove item from cart
export const removeFromCart = (menuItemId: string, specialRequests?: string): Cart | null => {
  const cart = getCart();
  if (!cart) return null;
  
  cart.items = cart.items.filter(
    item => !(item.menu_item.id === menuItemId && item.special_requests === specialRequests)
  );
  
  cart.total_amount = calculateCartTotal(cart.items);
  
  if (cart.items.length === 0) {
    clearCart();
    return null;
  }
  
  saveCart(cart);
  return cart;
};

// Update item quantity in cart
export const updateCartItemQuantity = (
  menuItemId: string, 
  newQuantity: number, 
  specialRequests?: string
): Cart | null => {
  const cart = getCart();
  if (!cart) return null;
  
  if (newQuantity <= 0) {
    return removeFromCart(menuItemId, specialRequests);
  }
  
  const itemIndex = cart.items.findIndex(
    item => item.menu_item.id === menuItemId && item.special_requests === specialRequests
  );
  
  if (itemIndex >= 0) {
    cart.items[itemIndex].quantity = newQuantity;
    cart.total_amount = calculateCartTotal(cart.items);
    saveCart(cart);
  }
  
  return cart;
};

// Calculate total amount for cart items
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.menu_item.price * item.quantity);
  }, 0);
};

// Get cart item count
export const getCartItemCount = (cart?: Cart | null): number => {
  if (!cart) cart = getCart();
  if (!cart) return 0;
  
  return cart.items.reduce((count, item) => count + item.quantity, 0);
};

// Check if cart belongs to specific restaurant
export const isCartForRestaurant = (restaurantId: string): boolean => {
  const cart = getCart();
  return cart?.restaurant_id === restaurantId;
};

// Get cart total with delivery fee and tax
export const getCartTotalWithFees = (cart: Cart, restaurant: Restaurant): {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
} => {
  const subtotal = cart.total_amount;
  const deliveryFee = subtotal >= restaurant.minimum_order ? restaurant.delivery_fee : 0;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + deliveryFee + tax;
  
  return {
    subtotal,
    deliveryFee,
    tax,
    total
  };
};

// Validate cart before checkout
export const validateCart = (cart: Cart, restaurant: Restaurant): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!cart || cart.items.length === 0) {
    errors.push('Cart is empty');
  }
  
  if (cart && cart.total_amount < restaurant.minimum_order) {
    errors.push(`Minimum order amount is $${restaurant.minimum_order.toFixed(2)}`);
  }
  
  // Check if all items are still available
  const unavailableItems = cart?.items.filter(item => !item.menu_item.is_available) || [];
  if (unavailableItems.length > 0) {
    errors.push('Some items in your cart are no longer available');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format price for display
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

// Generate order token
export const generateOrderToken = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`.toUpperCase();
};

// Execute pending cart action after login
export const executePendingCartAction = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Check for pending cart access (user was trying to view cart)
    const pendingAccess = sessionStorage.getItem('pendingCartAccess');
    if (pendingAccess) {
      sessionStorage.removeItem('pendingCartAccess');
      // User was trying to access cart, redirect them back to cart
      const returnUrl = sessionStorage.getItem('returnUrl');
      if (returnUrl && returnUrl.includes('/cart')) {
        window.location.href = returnUrl;
        return;
      }
    }

    // Check for pending add to cart action
    const pendingActionData = sessionStorage.getItem('pendingCartAction');
    if (pendingActionData) {
      const actionData = JSON.parse(pendingActionData);
      sessionStorage.removeItem('pendingCartAction');

      if (actionData.action === 'addToCart') {
        addToCart(actionData.menuItem, actionData.quantity, actionData.specialRequests);
        console.log(`Added ${actionData.quantity} ${actionData.menuItem.name} to cart after login`);
      }
    }
  } catch (error) {
    console.error('Error executing pending cart action:', error);
    // Clear corrupted data
    sessionStorage.removeItem('pendingCartAction');
    sessionStorage.removeItem('pendingCartAccess');
  }
};

// Check if user can access cart (for viewing/checkout - requires authentication)
export const canAccessCart = (): { canAccess: boolean; reason?: string } => {
  const cart = getCart();
  if (!cart || cart.items.length === 0) {
    return { canAccess: false, reason: 'cart_empty' };
  }

  if (!isAuthenticated()) {
    return { canAccess: false, reason: 'authentication_required' };
  }

  return { canAccess: true };
};

// Require authentication for cart access (viewing/checkout)
export const requireAuthForCart = (onSuccess: () => void, returnUrl?: string): void => {
  if (!isAuthenticated()) {
    // Store current cart state before redirecting to login
    const cart = getCart();
    if (cart && cart.items.length > 0) {
      sessionStorage.setItem('pendingCartAccess', 'true');
    }
    requireAuth(onSuccess, returnUrl, 'food');
  } else {
    const cart = getCart();
    if (!cart || cart.items.length === 0) {
      // Cart is empty, redirect to menu
      if (typeof window !== 'undefined') {
        window.location.href = '/food';
      }
    } else {
      onSuccess();
    }
  }
};



// Cart event listeners for React components
export const useCartListener = (callback: (cart: Cart | null) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleCartUpdate = (event: CustomEvent) => {
    callback(event.detail);
  };

  window.addEventListener('cart-updated', handleCartUpdate as EventListener);

  return () => {
    window.removeEventListener('cart-updated', handleCartUpdate as EventListener);
  };
};
