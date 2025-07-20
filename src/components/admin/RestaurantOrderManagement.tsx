'use client';

import React, { useState } from 'react';
import { FoodOrder, Restaurant } from '@/types/food';
import { updateRestaurantOrderStatus } from '@/lib/restaurant-admin-api';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TruckIcon,
  EyeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface RestaurantOrderManagementProps {
  orders: FoodOrder[];
  onOrderUpdate: () => void;
  restaurant: Restaurant | null;
}

interface OrderDetailsModalProps {
  order: FoodOrder;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: FoodOrder['status']) => void;
  restaurant: Restaurant | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  order, 
  onClose, 
  onStatusUpdate,
  restaurant 
}) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: FoodOrder['status']) => {
    setUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions: FoodOrder['status'][] = [
    'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_token}</h2>
              <p className="text-sm text-gray-600">
                Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p><strong>Name:</strong> {(order as any).users?.first_name} {(order as any).users?.last_name}</p>
              <p><strong>Phone:</strong> {order.delivery_phone}</p>
              <p><strong>Email:</strong> {(order as any).users?.email}</p>
              <p><strong>Address:</strong> {order.delivery_address}</p>
              {order.special_instructions && (
                <p><strong>Special Instructions:</strong> {order.special_instructions}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.food_order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.menu_items?.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {item.special_requests && (
                      <p className="text-sm text-blue-600">Note: {item.special_requests}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.total_price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">${item.unit_price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${(order.total_amount - order.delivery_fee - order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee:</span>
                <span>${order.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax:</span>
                <span>${order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Update Status</h3>
            <div className="flex items-center space-x-3 mb-4">
              <span>Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating || status === order.status}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === order.status
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {updating ? 'Updating...' : status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RestaurantOrderManagement({ 
  orders, 
  onOrderUpdate, 
  restaurant 
}: RestaurantOrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: FoodOrder['status']) => {
    setUpdating(orderId);
    try {
      const response = await updateRestaurantOrderStatus(orderId, newStatus);
      if (response.success) {
        onOrderUpdate();
      } else {
        alert(response.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'confirmed': return <CheckCircleIcon className="w-5 h-5 text-blue-600" />;
      case 'preparing': return <ClockIcon className="w-5 h-5 text-orange-600" />;
      case 'ready': return <CheckCircleIcon className="w-5 h-5 text-purple-600" />;
      case 'out_for_delivery': return <TruckIcon className="w-5 h-5 text-indigo-600" />;
      case 'delivered': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending ({statusCounts.pending || 0})</option>
            <option value="confirmed">Confirmed ({statusCounts.confirmed || 0})</option>
            <option value="preparing">Preparing ({statusCounts.preparing || 0})</option>
            <option value="ready">Ready ({statusCounts.ready || 0})</option>
            <option value="out_for_delivery">Out for Delivery ({statusCounts.out_for_delivery || 0})</option>
            <option value="delivered">Delivered ({statusCounts.delivered || 0})</option>
            <option value="cancelled">Cancelled ({statusCounts.cancelled || 0})</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No orders found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{order.order_token}</div>
                        <div className="text-sm text-gray-500">
                          {order.food_order_items?.length || 0} items
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {(order as any).users?.first_name} {(order as any).users?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{order.delivery_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          restaurant={restaurant}
        />
      )}
    </div>
  );
}
