'use client';

import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  ChefHat, 
  Package, 
  XCircle,
  AlertCircle 
} from 'lucide-react';
import { FoodOrder, OrderStatus } from '@/types/food';
import { ORDER_STATUS_CONFIG } from '@/types/food';
import { getRestaurantConfig } from '@/lib/restaurants';
import { formatPrice } from '@/lib/cart';

interface OrderStatusProps {
  order: FoodOrder;
  className?: string;
  showDetails?: boolean;
}

export default function OrderStatusComponent({ order, className = '', showDetails = true }: OrderStatusProps) {
  const config = order.restaurant ? getRestaurantConfig(order.restaurant) : null;
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'confirmed':
        return CheckCircle;
      case 'preparing':
        return ChefHat;
      case 'ready':
        return Package;
      case 'out_for_delivery':
        return Truck;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  // Calculate estimated delivery time if not provided
  const getEstimatedDeliveryTime = () => {
    if (order.estimated_delivery_time) {
      return new Date(order.estimated_delivery_time);
    }
    
    // Estimate based on order creation time + preparation time + delivery time
    const orderTime = new Date(order.created_at);
    const estimatedMinutes = 30; // Default estimation
    return new Date(orderTime.getTime() + estimatedMinutes * 60000);
  };

  const estimatedTime = getEstimatedDeliveryTime();
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}
      style={config ? {
        '--restaurant-primary': config.theme.primary,
        '--restaurant-secondary': config.theme.secondary,
        '--restaurant-accent': config.theme.accent,
      } as React.CSSProperties : {}}
    >
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={config ? { backgroundColor: `${config.theme.primary}10` } : {}}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {order.restaurant && config && (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.theme.primary }}
              >
                <config.icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                Order #{order.order_token}
              </h3>
              {order.restaurant && (
                <p className="text-sm text-gray-600">{order.restaurant.name}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatPrice(order.total_amount)}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}
          >
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
          </div>
          <div>
            <h4 className={`font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </h4>
            <p className="text-sm text-gray-600">
              {statusConfig.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <OrderProgressBar status={order.status} config={config} />

        {/* Timing Information */}
        {!isCancelled && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isDelivered ? 'Delivered at:' : 'Estimated delivery:'}
              </span>
              <span className="font-medium text-gray-900">
                {isDelivered && order.actual_delivery_time
                  ? new Date(order.actual_delivery_time).toLocaleTimeString()
                  : estimatedTime.toLocaleTimeString()
                }
              </span>
            </div>
          </div>
        )}

        {/* Order Details */}
        {showDetails && order.order_items && (
          <div className="mt-4 space-y-2">
            <h5 className="font-medium text-gray-900">Order Items:</h5>
            {order.order_items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.menu_item?.name || 'Item'}
                </span>
                <span className="text-gray-900">
                  {formatPrice(item.total_price)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Information */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Delivery Address:</span>
                <p className="text-gray-900">{order.delivery_address}</p>
              </div>
              <div>
                <span className="text-gray-600">Contact:</span>
                <span className="text-gray-900 ml-2">{order.delivery_phone}</span>
              </div>
              {order.special_instructions && (
                <div>
                  <span className="text-gray-600">Special Instructions:</span>
                  <p className="text-gray-900">{order.special_instructions}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Order Progress Bar Component
interface OrderProgressBarProps {
  status: OrderStatus;
  config: any;
}

function OrderProgressBar({ status, config }: OrderProgressBarProps) {
  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'out_for_delivery', label: 'Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center p-3 bg-red-50 rounded-lg">
        <XCircle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-700 font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isCompleted 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
                style={isCompleted ? { backgroundColor: config?.theme.primary || '#f97316' } : {}}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-1 text-center ${
                isCurrent ? 'font-medium text-gray-900' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
        <div 
          className="h-full transition-all duration-500"
          style={{ 
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            backgroundColor: config?.theme.primary || '#f97316'
          }}
        />
      </div>
    </div>
  );
}

// Order List Component
interface OrderListProps {
  orders: FoodOrder[];
  className?: string;
  showDetails?: boolean;
}

export function OrderList({ orders, className = '', showDetails = false }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {orders.map((order) => (
        <OrderStatusComponent
          key={order.id}
          order={order}
          showDetails={showDetails}
        />
      ))}
    </div>
  );
}
