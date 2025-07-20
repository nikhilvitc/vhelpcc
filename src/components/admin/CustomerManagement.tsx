'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant, FoodOrder } from '@/types/food';
import { 
  getRestaurantCustomers, 
  getCustomerOrderHistory,
  CustomerInfo 
} from '@/lib/restaurant-admin-api';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

interface CustomerManagementProps {
  restaurant: Restaurant | null;
}

export default function CustomerManagement({ restaurant }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);
  const [customerOrders, setCustomerOrders] = useState<FoodOrder[]>([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await getRestaurantCustomers();
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  };

  const loadCustomerOrderHistory = async (customer: CustomerInfo) => {
    setSelectedCustomer(customer);
    setShowOrderHistory(true);
    setOrderHistoryLoading(true);

    try {
      const response = await getCustomerOrderHistory(customer.id);
      if (response.success) {
        setCustomerOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error loading customer order history:', error);
    } finally {
      setOrderHistoryLoading(false);
    }
  };

  const getCustomerSegment = (customer: CustomerInfo) => {
    if (customer.totalOrders >= 10) {
      return { label: 'VIP', color: 'bg-purple-100 text-purple-800' };
    } else if (customer.totalOrders > 1) {
      return { label: 'Returning', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { label: 'New', color: 'bg-green-100 text-green-800' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <UsersIcon className="w-6 h-6 mr-2" />
              Customer Management
            </h2>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.totalOrders >= 10).length}
              </div>
              <div className="text-sm text-gray-600">VIP Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {customers.filter(c => c.totalOrders > 1 && c.totalOrders < 10).length}
              </div>
              <div className="text-sm text-gray-600">Returning Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {customers.filter(c => c.totalOrders === 1).length}
              </div>
              <div className="text-sm text-gray-600">New Customers</div>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const segment = getCustomerSegment(customer);
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${segment.color}`}>
                        {segment.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingBagIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{customer.totalOrders}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">${customer.totalSpent.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.averageOrderValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => loadCustomerOrderHistory(customer)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View Orders
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found matching your search.</p>
          </div>
        )}
      </div>

      {/* Customer Order History Modal */}
      {showOrderHistory && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Order History - {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h3>
              <button
                onClick={() => setShowOrderHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            {orderHistoryLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading order history...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {customerOrders.length > 0 ? (
                  <div className="space-y-4">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">Order #{order.order_token}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {order.delivery_address}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${order.total_amount.toFixed(2)}</div>
                            <div className={`text-sm px-2 py-1 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders found for this customer.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
