'use client';

import React, { useState } from 'react';
import { RepairOrder } from '@/lib/repair-api';
import { supabase } from '@/lib/supabase';

interface OrderDetailsModalProps {
  order: RepairOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate: (orderId: string, newStatus: string, notes?: string) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdate
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [updating, setUpdating] = useState(false);

  React.useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setNewPriority(order.priority);
      setTechnicianNotes(order.technician_notes || '');
      setEstimatedCost(order.estimated_cost?.toString() || '');
      setActualCost(order.actual_cost?.toString() || '');
      setEstimatedCompletion(order.estimated_completion_date || '');
    }
  }, [order]);

  const handleUpdate = async () => {
    if (!order) return;

    try {
      setUpdating(true);

      const updateData: any = {
        status: newStatus,
        priority: newPriority,
        technician_notes: technicianNotes,
        updated_at: new Date().toISOString()
      };

      if (estimatedCost) {
        updateData.estimated_cost = parseFloat(estimatedCost);
      }

      if (actualCost) {
        updateData.actual_cost = parseFloat(actualCost);
      }

      if (estimatedCompletion) {
        updateData.estimated_completion_date = estimatedCompletion;
      }

      if (newStatus === 'completed') {
        updateData.completion_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('repair_orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) {
        throw error;
      }

      // Create history entry
      await supabase
        .from('repair_order_history')
        .insert({
          repair_order_id: order.id,
          user_id: order.user_id,
          old_status: order.status,
          new_status: newStatus,
          old_priority: order.priority,
          new_priority: newPriority,
          notes: technicianNotes
        });

      onOrderUpdate(order.id, newStatus, technicianNotes);
      onClose();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Order ID: {order.id}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={handlePrint}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Print Order Details"
              >
                🖨️
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">
                    {order.service_type === 'phone' ? '📱' : '💻'}
                  </span>
                  Order Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Service Type</span>
                    <p className="text-gray-900 capitalize">{order.service_type} Repair</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Device Model</span>
                    <p className="text-gray-900">{order.device_model}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority</span>
                    <p className={`capitalize font-medium ${
                      order.priority === 'urgent' ? 'text-red-600' :
                      order.priority === 'high' ? 'text-orange-600' :
                      order.priority === 'normal' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {order.priority}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <p className="text-gray-900">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Last Updated</span>
                    <p className="text-gray-900">{new Date(order.updated_at).toLocaleString()}</p>
                  </div>
                  {order.estimated_completion_date && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Estimated Completion</span>
                      <p className="text-gray-900">{new Date(order.estimated_completion_date).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Full Name</span>
                    <p className="text-gray-900 font-medium">{order.first_name} {order.last_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone Number</span>
                    <p className="text-gray-900">
                      <a href={`tel:${order.phone_number}`} className="text-blue-600 hover:underline">
                        {order.phone_number}
                      </a>
                    </p>
                  </div>
                  {order.alternate_contact && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-500">Alternate Contact</span>
                      <p className="text-gray-900">
                        <a href={`tel:${order.alternate_contact}`} className="text-blue-600 hover:underline">
                          {order.alternate_contact}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">🔧</span>
                  Problem Description
                </h3>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-700 whitespace-pre-wrap">{order.problem_description}</p>
                </div>
              </div>

              {order.customer_notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="text-2xl mr-2">📝</span>
                    Customer Notes
                  </h3>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-gray-700 whitespace-pre-wrap">{order.customer_notes}</p>
                  </div>
                </div>
              )}

              {/* Cost Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">💰</span>
                  Cost Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estimated Cost</span>
                    <p className="text-gray-900 font-medium">
                      {order.estimated_cost ? `$${order.estimated_cost.toFixed(2)}` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Actual Cost</span>
                    <p className="text-gray-900 font-medium">
                      {order.actual_cost ? `$${order.actual_cost.toFixed(2)}` : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technician Notes */}
              {order.technician_notes && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="text-2xl mr-2">🔧</span>
                    Technician Notes
                  </h3>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-gray-700 whitespace-pre-wrap">{order.technician_notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">📅</span>
                  Order Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Created</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {order.status !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status: {order.status.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{new Date(order.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {order.completion_date && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Completed</p>
                        <p className="text-xs text-gray-500">{new Date(order.completion_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Update Form */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">✏️</span>
                  Update Order
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={actualCost}
                      onChange={(e) => setActualCost(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Completion Date
                    </label>
                    <input
                      type="datetime-local"
                      value={estimatedCompletion}
                      onChange={(e) => setEstimatedCompletion(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technician Notes
                    </label>
                    <textarea
                      value={technicianNotes}
                      onChange={(e) => setTechnicianNotes(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes about the repair progress..."
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold mb-3 flex items-center">
                  <span className="text-xl mr-2">⚡</span>
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${order.phone_number}`}
                    className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <span className="mr-2">📞</span>
                    Call Customer
                  </a>
                  <a
                    href={`sms:${order.phone_number}`}
                    className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">💬</span>
                    Send SMS
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
