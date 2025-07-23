'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Star,
  Truck,
  ShoppingCart,
  Search,
  Filter,
  ShieldX
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MenuGrid } from '@/components/food/MenuItemCard';
import CartSidebar from '@/components/food/CartSidebar';
import PreviousFoodOrders from '@/components/food/PreviousFoodOrders';
import { Restaurant, MenuItem, Cart } from '@/types/food';
import {
  getRestaurantConfig,
  isRestaurantOpen
} from '@/lib/restaurants';
import { findRestaurantBySlugFromDB, fetchMenuItemsFromDB } from '@/lib/restaurant-utils';
import { getCart, getCartItemCount, useCartListener } from '@/lib/cart';

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);

  // Load restaurant and menu data
  useEffect(() => {
    const loadRestaurantData = async () => {
      setIsLoading(true);
      try {
        // Find restaurant by slug from database
        const foundRestaurant = await findRestaurantBySlugFromDB(slug);
        
        if (!foundRestaurant) {
          router.push('/food');
          return;
        }

        setRestaurant(foundRestaurant);

        // Only fetch menu items if restaurant is active
        if (foundRestaurant.is_active) {
          // Fetch menu items from database
          const menuItems = await fetchMenuItemsFromDB(foundRestaurant.id);
          setMenuItems(menuItems);
          setFilteredMenuItems(menuItems);
        } else {
          // Clear menu items for inactive restaurants
          setMenuItems([]);
          setFilteredMenuItems([]);
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        router.push('/food');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadRestaurantData();
    }
  }, [slug, router]);

  // Load cart and listen for updates
  useEffect(() => {
    const currentCart = getCart();
    setCartItemCount(getCartItemCount(currentCart));
    
    const unsubscribe = useCartListener((updatedCart) => {
      setCartItemCount(getCartItemCount(updatedCart));
    });
    
    return unsubscribe;
  }, []);

  // Filter menu items
  useEffect(() => {
    let filtered = menuItems;

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredMenuItems(filtered);
  }, [menuItems, searchQuery, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  const config = getRestaurantConfig(restaurant);
  const isOpen = isRestaurantOpen(restaurant);
  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)))];

  const handleCheckout = (cart: Cart) => {
    // Navigate to checkout page
    router.push(`/food/${slug}/checkout`);
    setIsCartOpen(false);
  };

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

      {/* Restaurant Header */}
      <div 
        className="relative bg-gradient-to-r text-white"
        style={{
          background: `linear-gradient(135deg, ${config.theme.primary}, ${config.theme.secondary})`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/food')}
            className="flex items-center text-white hover:text-gray-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Restaurants
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div 
                className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
              >
                <config.icon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {restaurant.name}
                </h1>
                <p className="text-lg opacity-90 mb-2">
                  {restaurant.description}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-1" />
                    <span>${restaurant.delivery_fee.toFixed(2)} delivery</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current text-yellow-300" />
                    <span>4.5 (120+ reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Cart */}
            <div className="flex items-center space-x-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isOpen
                    ? 'bg-green-500 bg-opacity-20 text-green-100'
                    : 'bg-red-500 bg-opacity-20 text-red-100'
                }`}
              >
                {isOpen ? 'Open Now' : 'Closed'}
              </span>
              
              <div className="flex items-center space-x-3 text-black">
                <button
                  onClick={() => setShowPreviousOrders(true)}
                  disabled={!restaurant?.is_active}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    restaurant?.is_active
                      ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-black'
                      : 'bg-gray-500 bg-opacity-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span>Previous Orders</span>
                </button>

                {cartItemCount > 0 && restaurant?.is_active && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md text-black">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
              style={{ 
                '--tw-ring-color': config.theme.primary + '50'
              } as React.CSSProperties}
            />
          </div>

          <div className="flex items-center space-x-4 text-black">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
              style={{ 
                '--tw-ring-color': config.theme.primary + '50'
              } as React.CSSProperties}
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Menu Items */}
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-16">
            {!restaurant?.is_active ? (
              // Restaurant is inactive
              <>
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <ShieldX className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Restaurant Not in Service
                </h3>
                <p className="text-gray-600 mb-4">
                  This restaurant is temporarily closed and not accepting orders.
                </p>
                <Link
                  href="/food"
                  className="inline-flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Other Restaurants
                </Link>
              </>
            ) : (
              // Restaurant is active but no menu items found
              <>
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No menu items found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-2 text-white rounded-lg hover:shadow-lg transition-all"
                  style={{ backgroundColor: config.theme.primary }}
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <MenuGrid 
            menuItems={filteredMenuItems} 
            restaurant={restaurant}
          />
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        restaurant={restaurant}
        onCheckout={handleCheckout}
      />

      {/* Previous Orders Modal */}
      {showPreviousOrders && (
        <PreviousFoodOrders
          onClose={() => setShowPreviousOrders(false)}
        />
      )}

      {/* <Footer /> */}
    </div>
  );
}


