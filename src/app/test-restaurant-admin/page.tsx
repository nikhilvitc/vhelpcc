'use client';

import React, { useState } from 'react';
import { 
  getRestaurantForAdmin, 
  getRestaurantOrders, 
  getRestaurantMenuItems,
  getRestaurantStats,
  createRestaurantMenuItem
} from '@/lib/restaurant-admin-api';

export default function TestRestaurantAdminPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFunction();
      addResult(testName, { success: true, data: result });
    } catch (error: any) {
      addResult(testName, { success: false, error: error.message });
    }
    setLoading(false);
  };

  const testGetRestaurant = () => runTest('Get Restaurant for Admin', async () => {
    return await getRestaurantForAdmin();
  });

  const testGetOrders = () => runTest('Get Restaurant Orders', async () => {
    return await getRestaurantOrders();
  });

  const testGetMenuItems = () => runTest('Get Restaurant Menu Items', async () => {
    return await getRestaurantMenuItems();
  });

  const testGetStats = () => runTest('Get Restaurant Stats', async () => {
    return await getRestaurantStats();
  });

  const testCreateMenuItem = () => runTest('Create Menu Item', async () => {
    return await createRestaurantMenuItem({
      name: 'Test Item',
      description: 'A test menu item',
      price: 9.99,
      category: 'Test Category',
      is_available: true,
      preparation_time: 10
    });
  });

  const testUpdateOrderStatus = () => runTest('Update Order Status', async () => {
    // This would need a real order ID to work
    return { message: 'Test skipped - requires real order ID' };
  });

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Admin API Test</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page tests the restaurant admin API functions. Make sure you're logged in as a restaurant admin.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={testGetRestaurant}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Test Get Restaurant
              </button>
              
              <button
                onClick={testGetOrders}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Test Get Orders
              </button>
              
              <button
                onClick={testGetMenuItems}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Test Get Menu Items
              </button>
              
              <button
                onClick={testGetStats}
                disabled={loading}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
              >
                Test Get Stats
              </button>
              
              <button
                onClick={testCreateMenuItem}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Test Create Menu Item
              </button>
              
              <button
                onClick={testUpdateOrderStatus}
                disabled={loading}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Test Update Order Status
              </button>
            </div>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Running test...</span>
            </div>
          )}

          {/* Results */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{result.test}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.result.success ? 'SUCCESS' : 'ERROR'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {new Date(result.timestamp).toLocaleString()}
                </div>
                
                <div className="bg-gray-50 rounded p-3 overflow-auto">
                  <pre className="text-sm">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No test results yet. Click a test button to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
