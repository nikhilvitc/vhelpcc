'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import RepairForm from '@/components/RepairForm';
import PreviousOrders from '@/components/PreviousOrders';
import { ArrowLeft, History, AlertCircle } from 'lucide-react';
import { useRepairFormPersistence } from '@/hooks/useRepairFormPersistence';
import { isServiceTypeActive } from '@/lib/service-types-api';

interface RepairFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternateContact?: string;
  deviceModel: string;
  problemDescription: string;
}

export default function LaptopRepairPage() {
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [storedFormData, setStoredFormData] = useState<RepairFormData | null>(null);
  const [isServiceActive, setIsServiceActive] = useState<boolean | null>(null);
  const [isCheckingService, setIsCheckingService] = useState(true);

  const {
    handleFormSubmit,
    isLoading,
    isAutoSubmitting,
    getStoredFormData
  } = useRepairFormPersistence({
    serviceType: 'laptop',
    redirectUrl: '/repair/laptop'
  });

  // Check service status on mount
  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        setIsCheckingService(true);
        const active = await isServiceTypeActive('laptop');
        setIsServiceActive(active);
      } catch (error) {
        console.error('Error checking service status:', error);
        setIsServiceActive(false);
      } finally {
        setIsCheckingService(false);
      }
    };

    checkServiceStatus();
  }, []);

  // Get stored form data on mount
  useEffect(() => {
    const data = getStoredFormData();
    setStoredFormData(data);
  }, [getStoredFormData]);

  return (
    <div className="min-h-screen bg-[#233d8e]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center text-white hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <button
            onClick={() => setShowPreviousOrders(true)}
            disabled={isCheckingService || !isServiceActive}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isCheckingService || !isServiceActive
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <History className="w-5 h-5 mr-2" />
            Show Previous Orders
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-3">
          <h1 className="text-4xl font-bold text-white mb-4">Laptop Repair Service</h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            {isCheckingService
              ? 'Checking service availability...'
              : isServiceActive
                ? 'Professional laptop and computer repair services. Our certified technicians can fix any issue with your device.'
                : 'This service is temporarily unavailable.'
            }
          </p>
        </div>

        <div className="mt-6 rounded-xl p-6">
          {/* <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Laptop Repair Services</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">💻</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Screen Repair</h3>
              <p className="text-sm text-black">LCD/LED screen replacement and repair</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">⚡</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Power Issues</h3>
              <p className="text-sm text-black">Charging port, battery, and power problems</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">🔧</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Hardware Upgrade</h3>
              <p className="text-sm text-black">RAM, SSD, and component upgrades</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">🛡️</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Virus Removal</h3>
              <p className="text-sm text-black">Malware and virus cleaning services</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">💾</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Data Recovery</h3>
              <p className="text-sm text-black">Recover lost or corrupted data</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">🔥</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Overheating</h3>
              <p className="text-sm text-black">Cooling system cleaning and repair</p>
            </div>
          </div>
        </div>

        {/* Service Status Check */}
        {isCheckingService ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking service availability...</p>
          </div>
        ) : !isServiceActive ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Available</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Laptop repair service is currently not in service. Please check back later or contact support.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            {/* Repair Form */}
            <RepairForm
              serviceType="laptop"
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              isAutoSubmitting={isAutoSubmitting}
              defaultValues={storedFormData || undefined}
            />

            {/* Service Information */}
        

            {/* Contact Information */}

          </>
        )}
      </main>

      {/* Previous Orders Modal */}
      {showPreviousOrders && (
        <PreviousOrders onClose={() => setShowPreviousOrders(false)} />
      )}

      {/* <Footer /> */}
    </div>
  );
}




// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import RepairForm from '@/components/RepairForm';
// import PreviousOrders from '@/components/PreviousOrders';
// import { ArrowLeft, History } from 'lucide-react';
// import { useRepairFormPersistence } from '@/hooks/useRepairFormPersistence';

// interface RepairFormData {
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   alternateContact?: string;
//   deviceModel: string;
//   problemDescription: string;
// }

// export default function LaptopRepairPage() {
//   const [showPreviousOrders, setShowPreviousOrders] = useState(false);
//   const [storedFormData, setStoredFormData] = useState<RepairFormData | null>(null);

//   const {
//     handleFormSubmit,
//     isLoading,
//     isAutoSubmitting,
//     getStoredFormData
//   } = useRepairFormPersistence({
//     serviceType: 'laptop',
//     redirectUrl: '/repair/laptop'
//   });

//   // Get stored form data on mount
//   useEffect(() => {
//     const data = getStoredFormData();
//     setStoredFormData(data);
//   }, [getStoredFormData]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Navigation */}
//         <div className="flex items-center justify-between mb-8">
//           <Link
//             href="/"
//             className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Back to Home
//           </Link>
          
//           <button
//             onClick={() => setShowPreviousOrders(true)}
//             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <History className="w-5 h-5 mr-2" />
//             Show Previous Orders
//           </button>
//         </div>

//         {/* Page Title */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">Laptop Repair Service</h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Professional laptop and computer repair services. Our certified technicians can fix any issue with your device.
//           </p>
//         </div>

//         {/* Repair Form */}
//         <RepairForm
//           serviceType="laptop"
//           onSubmit={handleFormSubmit}
//           isLoading={isLoading}
//           isAutoSubmitting={isAutoSubmitting}
//           defaultValues={storedFormData || undefined}
//         />

//         {/* Service Information */}
//         <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Laptop Repair Services</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="text-center p-4">
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                 <span className="text-blue-600 font-bold">💻</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Screen Repair</h3>
//               <p className="text-sm text-gray-600">LCD/LED screen replacement and repair</p>
//             </div>
            
//             <div className="text-center p-4">
//               <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                 <span className="text-green-600 font-bold">⚡</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Power Issues</h3>
//               <p className="text-sm text-gray-600">Charging port, battery, and power problems</p>
//             </div>
            
//             <div className="text-center p-4">
//               <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                 <span className="text-purple-600 font-bold">🔧</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Hardware Upgrade</h3>
//               <p className="text-sm text-gray-600">RAM, SSD, and component upgrades</p>
//             </div>
            
//             <div className="text-center p-4">
//               <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                 <span className="text-red-600 font-bold">🛡️</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Virus Removal</h3>
//               <p className="text-sm text-gray-600">Malware and virus cleaning services</p>
//             </div>
            
//             <div className="text-center p-4">
//               <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                 <span className="text-yellow-600 font-bold">💾</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Data Recovery</h3>
//               <p className="text-sm text-gray-600">Recover lost or corrupted data</p>
//             </div>
            
//             <div className="text-center p-4">
//               <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                 <span className="text-indigo-600 font-bold">🔥</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-2">Overheating</h3>
//               <p className="text-sm text-gray-600">Cooling system cleaning and repair</p>
//             </div>
//           </div>
//         </div>

//         {/* Contact Information */}
//         <div className="mt-8 bg-blue-50 rounded-xl p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
//           <p className="text-gray-600 mb-4">
//             If you have any questions about our laptop repair services, feel free to contact us.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4">
//             <a
//               href="tel:+1234567890"
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
//             >
//               Call Us: (123) 456-7890
//             </a>
//             <a
//               href="mailto:support@vhelp.com"
//               className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-center"
//             >
//               Email: support@vhelp.com
//             </a>
//           </div>
//         </div>
//       </main>

//       {/* Previous Orders Modal */}
//       {showPreviousOrders && (
//         <PreviousOrders onClose={() => setShowPreviousOrders(false)} />
//       )}

//       <Footer />
//     </div>
//   );
// }
