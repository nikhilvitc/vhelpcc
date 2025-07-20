















'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

export default function PhoneRepairPage() {
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
    serviceType: 'phone',
    redirectUrl: '/repair/phone'
  });

  // Check service status on mount
  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        setIsCheckingService(true);
        const active = await isServiceTypeActive('phone');
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
          <h1 className="text-4xl font-bold text-white mb-4">Phone Repair Service</h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            {isCheckingService
              ? 'Checking service availability...'
              : isServiceActive
                ? 'Get your smartphone repaired by our expert technicians. Fill out the form below to book an appointment.'
                : 'This service is temporarily unavailable.'
            }
          </p>
        </div>

        <div className="mt-6 rounded-xl p-6">
          {/* <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Phone Repair Services</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">📱</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Screen Repair</h3>
              <p className="text-sm text-black">Cracked or damaged screen replacement</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">🔋</span>
              </div>
              <h3 className="font-semibold text-black mb-2">Battery Replacement</h3>
              <p className="text-sm text-black">Quick battery replacement service</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">🔧</span>
              </div>
              <h3 className="font-semibold text-black mb-2">General Repair</h3>
              <p className="text-sm text-black">Software issues, water damage, and more</p>
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
              Phone repair service is currently not in service. Please check back later or contact support.
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
              serviceType="phone"
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
