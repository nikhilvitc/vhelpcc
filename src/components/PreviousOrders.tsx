'use client';

import { useState, useEffect } from 'react';
import { Clock, Smartphone, Laptop, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getUserRepairOrders, RepairOrder as ApiRepairOrder } from '@/lib/repair-api';

// Use the API RepairOrder type
type RepairOrder = ApiRepairOrder;

interface PreviousOrdersProps {
  onClose: () => void;
}

export default function PreviousOrders({ onClose }: PreviousOrdersProps) {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreviousOrders();
  }, []);

  const fetchPreviousOrders = async () => {
    try {
      setIsLoading(true);

      const result = await getUserRepairOrders();

      if (!result.success) {
        setError(result.error || 'Failed to load orders');
        return;
      }

      setOrders(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'in_progress':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return <Clock className="w-3 h-3 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Previous Orders</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading orders...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <button
                onClick={fetchPreviousOrders}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No previous orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                        {order.service_type === 'phone' ? (
                          <Smartphone className="w-3 h-3 text-gray-600" />
                        ) : (
                          <Laptop className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {order.service_type === 'phone' ? 'Phone Repair' : 'Laptop Repair'}
                        </h3>
                        <p className="text-xs text-gray-600">Order #{order.id.slice(-8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Device Model</p>
                      <p className="text-xs text-gray-600">{order.device_model}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Contact</p>
                      <p className="text-xs text-gray-600">{order.phone_number}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Problem Description</p>
                    <p className="text-xs text-gray-600">{order.problem_description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {formatDate(order.created_at)}</span>
                    <span>Updated: {formatDate(order.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



















// 'use client';

// import { useState, useEffect } from 'react';
// import { Clock, Smartphone, Laptop, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// import { getUserRepairOrders, RepairOrder as ApiRepairOrder } from '@/lib/repair-api';

// // Use the API RepairOrder type
// type RepairOrder = ApiRepairOrder;

// interface PreviousOrdersProps {
//   onClose: () => void;
// }

// export default function PreviousOrders({ onClose }: PreviousOrdersProps) {
//   const [orders, setOrders] = useState<RepairOrder[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchPreviousOrders();
//   }, []);

//   const fetchPreviousOrders = async () => {
//     try {
//       setIsLoading(true);

//       const result = await getUserRepairOrders();

//       if (!result.success) {
//         setError(result.error || 'Failed to load orders');
//         return;
//       }

//       setOrders(result.data || []);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to load orders');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case 'cancelled':
//         return <XCircle className="w-5 h-5 text-red-500" />;
//       case 'in_progress':
//         return <AlertCircle className="w-5 h-5 text-yellow-500" />;
//       default:
//         return <Clock className="w-5 h-5 text-blue-500" />;
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'pending':
//         return 'Pending';
//       case 'in_progress':
//         return 'In Progress';
//       case 'completed':
//         return 'Completed';
//       case 'cancelled':
//         return 'Cancelled';
//       default:
//         return 'Unknown';
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'bg-green-100 text-green-800';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       case 'in_progress':
//         return 'bg-yellow-100 text-yellow-800';
//       default:
//         return 'bg-blue-100 text-blue-800';
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-gray-900">Previous Orders</h2>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <XCircle className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//           {isLoading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//               <span className="ml-2 text-gray-600">Loading orders...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//               <p className="text-red-600 mb-4">{error}</p>
//               <button
//                 onClick={fetchPreviousOrders}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : orders.length === 0 ? (
//             <div className="text-center py-12">
//               <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-600">No previous orders found</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {orders.map((order) => (
//                 <div
//                   key={order.id}
//                   className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
//                 >
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                       <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
//                         {order.service_type === 'phone' ? (
//                           <Smartphone className="w-5 h-5 text-gray-600" />
//                         ) : (
//                           <Laptop className="w-5 h-5 text-gray-600" />
//                         )}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">
//                           {order.service_type === 'phone' ? 'Phone Repair' : 'Laptop Repair'}
//                         </h3>
//                         <p className="text-sm text-gray-600">Order #{order.id.slice(-8)}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       {getStatusIcon(order.status)}
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
//                         {getStatusText(order.status)}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-700">Device Model</p>
//                       <p className="text-sm text-gray-600">{order.device_model}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-700">Contact</p>
//                       <p className="text-sm text-gray-600">{order.phone_number}</p>
//                     </div>
//                   </div>

//                   <div className="mb-4">
//                     <p className="text-sm font-medium text-gray-700 mb-1">Problem Description</p>
//                     <p className="text-sm text-gray-600">{order.problem_description}</p>
//                   </div>

//                   <div className="flex items-center justify-between text-xs text-gray-500">
//                     <span>Created: {formatDate(order.created_at)}</span>
//                     <span>Updated: {formatDate(order.updated_at)}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
