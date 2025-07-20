// Restaurant configuration and theming system
import { 
  Coffee, 
  Pizza, 
  Sandwich, 
  IceCream, 
  Cookie, 
  ChefHat 
} from 'lucide-react';
import { Restaurant, RestaurantConfig, RestaurantTheme } from '@/types/food';

// Color utility functions
const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Generate theme variations from base colors
const generateTheme = (primary: string, secondary: string, accent: string): RestaurantTheme => {
  const [pH, pS, pL] = hexToHsl(primary);
  const [sH, sS, sL] = hexToHsl(secondary);
  const [aH, aS, aL] = hexToHsl(accent);

  return {
    primary,
    secondary,
    accent,
    primaryHover: hslToHex(pH, pS, Math.max(pL - 10, 0)),
    secondaryHover: hslToHex(sH, sS, Math.max(sL - 10, 0)),
    accentHover: hslToHex(aH, aS, Math.max(aL - 10, 0)),
    primaryLight: hslToHex(pH, Math.max(pS - 20, 0), Math.min(pL + 30, 95)),
    secondaryLight: hslToHex(sH, Math.max(sS - 20, 0), Math.min(sL + 30, 95)),
    accentLight: hslToHex(aH, Math.max(aS - 20, 0), Math.min(aL + 30, 95))
  };
};

// Restaurant icon mapping
const RESTAURANT_ICONS = {
  'starbucks': Coffee,
  'pizza-hut': Pizza,
  'subway': Sandwich,
  'baskin-robbins': IceCream,
  'mcdonalds': Cookie,
  'olive-garden': ChefHat
} as const;

// Default restaurant configurations
export const DEFAULT_RESTAURANTS: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Starbucks',
    slug: 'starbucks',
    description: 'Coffee & Beverages',
    primary_color: '#00704A',
    secondary_color: '#1E3932',
    accent_color: '#00A862',
    is_active: true,
    opening_time: '06:00:00',
    closing_time: '22:00:00',
    delivery_fee: 2.99,
    minimum_order: 5.00
  },
  {
    name: 'Pizza Hut',
    slug: 'pizza-hut',
    description: 'Pizza & Italian',
    primary_color: '#E31837',
    secondary_color: '#C41E3A',
    accent_color: '#B71C1C',
    is_active: true,
    opening_time: '11:00:00',
    closing_time: '23:00:00',
    delivery_fee: 3.99,
    minimum_order: 15.00
  },
  {
    name: 'Subway',
    slug: 'subway',
    description: 'Sandwiches & Subs',
    primary_color: '#FFCC00',
    secondary_color: '#FDD835',
    accent_color: '#F57F17',
    is_active: true,
    opening_time: '07:00:00',
    closing_time: '22:00:00',
    delivery_fee: 2.49,
    minimum_order: 8.00
  },
  {
    name: 'Baskin Robbins',
    slug: 'baskin-robbins',
    description: 'Ice Cream & Desserts',
    primary_color: '#E91E63',
    secondary_color: '#F06292',
    accent_color: '#C2185B',
    is_active: true,
    opening_time: '10:00:00',
    closing_time: '22:00:00',
    delivery_fee: 2.99,
    minimum_order: 6.00
  },
  {
    name: "McDonald's",
    slug: 'mcdonalds',
    description: 'Fast Food & Burgers',
    primary_color: '#FFC72C',
    secondary_color: '#FFCA28',
    accent_color: '#FF8F00',
    is_active: true,
    opening_time: '06:00:00',
    closing_time: '24:00:00',
    delivery_fee: 2.99,
    minimum_order: 10.00
  },
  {
    name: 'Olive Garden',
    slug: 'olive-garden',
    description: 'Fine Dining & Italian',
    primary_color: '#4CAF50',
    secondary_color: '#66BB6A',
    accent_color: '#388E3C',
    is_active: true,
    opening_time: '11:00:00',
    closing_time: '22:00:00',
    delivery_fee: 4.99,
    minimum_order: 20.00
  }
];

// Get restaurant configuration by slug
export const getRestaurantConfig = (restaurant: Restaurant): RestaurantConfig => {
  const theme = generateTheme(
    restaurant.primary_color,
    restaurant.secondary_color,
    restaurant.accent_color
  );

  const icon = RESTAURANT_ICONS[restaurant.slug as keyof typeof RESTAURANT_ICONS] || ChefHat;

  return {
    restaurant,
    theme,
    icon
  };
};

// Get all restaurant configurations
export const getAllRestaurantConfigs = (restaurants: Restaurant[]): RestaurantConfig[] => {
  return restaurants.map(getRestaurantConfig);
};

// Find restaurant by slug
export const findRestaurantBySlug = (restaurants: Restaurant[], slug: string): Restaurant | undefined => {
  return restaurants.find(restaurant => restaurant.slug === slug);
};

// Check if restaurant is open
export const isRestaurantOpen = (restaurant: Restaurant): boolean => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 8);
  
  // Handle 24-hour restaurants
  if (restaurant.closing_time === '24:00:00' || restaurant.closing_time === '00:00:00') {
    return currentTime >= restaurant.opening_time;
  }
  
  // Handle normal hours
  if (restaurant.opening_time <= restaurant.closing_time) {
    return currentTime >= restaurant.opening_time && currentTime <= restaurant.closing_time;
  }
  
  // Handle overnight restaurants (e.g., 22:00 - 06:00)
  return currentTime >= restaurant.opening_time || currentTime <= restaurant.closing_time;
};

// Generate CSS custom properties for restaurant theme
export const generateThemeCSS = (theme: RestaurantTheme): Record<string, string> => {
  return {
    '--restaurant-primary': theme.primary,
    '--restaurant-secondary': theme.secondary,
    '--restaurant-accent': theme.accent,
    '--restaurant-primary-hover': theme.primaryHover,
    '--restaurant-secondary-hover': theme.secondaryHover,
    '--restaurant-accent-hover': theme.accentHover,
    '--restaurant-primary-light': theme.primaryLight,
    '--restaurant-secondary-light': theme.secondaryLight,
    '--restaurant-accent-light': theme.accentLight
  };
};

// Utility function to apply theme to an element
export const applyThemeToElement = (element: HTMLElement, theme: RestaurantTheme): void => {
  const cssProps = generateThemeCSS(theme);
  Object.entries(cssProps).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};
