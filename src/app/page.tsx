'use client';

import { useState, useEffect } from 'react';
import {
  Wrench,
  Utensils,
  BookOpen,
  Smartphone,
  Laptop,
  X,
  Coffee,
  Pizza,
  Sandwich,
  IceCream,
  Cookie,
  ChefHat,
  ArrowRight,
  Search,
  MapPin,
  ChevronDown,
  AlertCircle,
  Home,
  MessageSquare,
  GraduationCap,
  Users,
  Gamepad2,
  Menu,
  Loader2
} from 'lucide-react';

import Header from '@/components/Header';

// Mock API functions
const getCurrentUser = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 500);
  });
};

const getServiceTypes = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [
          { name: 'phone', is_active: true },
          { name: 'laptop', is_active: true }
        ]
      });
    }, 500);
  });
};

// Loading Screen Component
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center space-y-4 mx-4 max-w-sm w-full">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-blue-200 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-800 font-medium">Loading...</p>
          <p className="text-gray-500 text-sm">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};

// Vendor Navigation Component
const VendorNavigation = () => {
  return (
    <div className="flex justify-center mb-4 px-4">
      <button
        onClick={() => window.open('/more-fun', '_blank')}
        className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl p-1 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02] w-full max-w-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
        
        <div className="relative bg-white rounded-xl px-4 py-2.5 flex items-center gap-2 group-hover:bg-gray-50 transition-all duration-300">
          <div className="relative">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Coffee className="w-3 h-3 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
          </div>
          
          <div className="text-left flex-1">
            <h3 className="text-base font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-700 group-hover:to-blue-700 transition-all duration-300">
              More Fun
            </h3>
            <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              Discover exciting activities & games
            </p>
          </div>
          
          <ArrowRight className="w-4 h-4 text-purple-600 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-700 delay-100"></div>
          <div className="absolute top-4 right-6 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-700 delay-300"></div>
          <div className="absolute bottom-3 left-8 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-700 delay-500"></div>
        </div>
      </button>
    </div>
  );
};

export default function HomePage() {
  const [showRepairPopup, setShowRepairPopup] = useState(false);
  const [showFoodPopup, setShowFoodPopup] = useState(false);
  const [showAcademicsPopup, setShowAcademicsPopup] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingCard, setLoadingCard] = useState(null);

  // Check user role and redirect vendors to their dashboards
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (user) {
          if (user.role === 'phone_vendor') {
            window.open('/admin/phone-vendor', '_blank');
            return;
          }
          if (user.role === 'laptop_vendor') {
            window.open('/admin/laptop-vendor', '_blank');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUserAndRedirect();
  }, []);

  // Fetch service types on component mount
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        setIsLoadingServices(true);
        const result = await getServiceTypes();
        if (result.success) {
          setServiceTypes(result.data || []);
        } else {
          console.error('Failed to fetch service types:', result.error);
        }
      } catch (error) {
        console.error('Error fetching service types:', error);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServiceTypes();
  }, []);

  const handleCardClick = async (cardId) => {
    setLoadingCard(cardId);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (cardId === 'repair-services') {
      try {
        const user = await getCurrentUser();
        if (user?.role === 'phone_vendor') {
          window.open('/admin/phone-vendor', '_blank');
          setLoadingCard(null);
          return;
        }
        if (user?.role === 'laptop_vendor') {
          window.open('/admin/laptop-vendor', '_blank');
          setLoadingCard(null);
          return;
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }

      setLoadingCard(null);
      setShowRepairPopup(true);
    } else if (cardId === 'food') {
      setLoadingCard(null);
      setShowFoodPopup(true);
    } else if (cardId === 'academics') {
      setLoadingCard(null);
      setShowAcademicsPopup(true);
    } else {
      window.open(`/category/${cardId}`, '_blank');
      setLoadingCard(null);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
          <p className="text-white text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-[#233d8e] relative overflow-hidden">
        <Header />
        
        {/* Background Images */}
        <div className="absolute left-0 top-16 w-24 h-24 opacity-40 hidden lg:block z-0">
          <div className="text-2xl">🥬</div>
          <div className="absolute top-4 left-3 text-xl">🫑</div>
          <div className="absolute top-8 left-6 text-lg">🥕</div>
          <div className="absolute bottom-0 left-1 text-base">🌽</div>
        </div>

        <div className="absolute right-0 top-16 w-24 h-24 opacity-40 hidden lg:block z-0">
          <div className="absolute top-0 right-3 text-xl">🍣</div>
          <div className="absolute top-4 right-6 text-lg">🥑</div>
          <div className="absolute bottom-2 right-1 text-2xl">🍽️</div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 py-9">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight max-w-5xl mx-auto py-2">
              Your College, Your Way, Your Features.
            </h1>

            <div className="mb-6 flex justify-center items-center w-full py-3">
              <VendorNavigation />
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto py-3">
              {/* Repair Services Card */}
              <div
                onClick={() => handleCardClick('repair-services')}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden transform hover:scale-105 hover:-translate-y-2"
              >
                {/* Animated background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                
                {/* Floating particles on hover */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                <div className="absolute top-4 left-3 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700"></div>
                <div className="absolute bottom-3 right-4 w-1 h-1 bg-red-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-600"></div>
                
                <div className="text-left relative z-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-red-600 transition-colors duration-300">REPAIR SERVICES</h3>
                  <p className="text-gray-500 font-medium mb-3 text-sm group-hover:text-gray-600 transition-colors duration-300">PHONE & LAPTOP REPAIR</p>
                  
                  <div className="text-red-500 font-bold text-base mb-4 group-hover:scale-110 transition-transform duration-300">QUICK & RELIABLE</div>
                  
                  <div className="relative mb-4">
                    <div className="w-20 h-16 mx-auto relative group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 bg-red-600 rounded-full w-14 h-14 group-hover:rotate-12 transition-transform duration-500"></div>
                      <div className="absolute top-1 left-2 text-xl group-hover:animate-bounce">🔧</div>
                      <div className="absolute bottom-0 right-0 text-lg group-hover:animate-pulse">📱</div>
                      <div className="absolute top-0 right-0 text-base group-hover:animate-bounce">💻</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Services Card */}
              <div
                onClick={() => handleCardClick('food')}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden transform hover:scale-105 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                
                <div className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                <div className="absolute top-4 left-3 w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700"></div>
                <div className="absolute bottom-3 right-4 w-1 h-1 bg-orange-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-600"></div>
                
                <div className="text-left relative z-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors duration-300">FOOD DELIVERY</h3>
                  <p className="text-gray-500 font-medium mb-3 text-sm group-hover:text-gray-600 transition-colors duration-300">FROM RESTAURANTS</p>
                  
                  <div className="text-orange-500 font-bold text-base mb-4 group-hover:scale-110 transition-transform duration-300">UPTO 60% OFF</div>
                  
                  <div className="relative mb-4">
                    <div className="w-20 h-16 mx-auto relative group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 bg-orange-600 rounded-full w-14 h-14 group-hover:rotate-12 transition-transform duration-500"></div>
                      <div className="absolute top-1 left-2 text-xl group-hover:animate-bounce">🍳</div>
                      <div className="absolute bottom-0 right-0 text-lg group-hover:animate-pulse">🥓</div>
                      <div className="absolute top-0 right-0 text-base group-hover:animate-bounce">🍅</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academics Card */}
              <div
                onClick={() => handleCardClick('academics')}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden md:col-span-2 xl:col-span-1 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                
                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                <div className="absolute top-4 left-3 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700"></div>
                <div className="absolute bottom-3 right-4 w-1 h-1 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-600"></div>
                
                <div className="text-left relative z-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors duration-300">ACADEMICS</h3>
                  <p className="text-gray-500 font-medium mb-3 text-sm group-hover:text-gray-600 transition-colors duration-300">STUDY & LEARN MORE</p>
                  
                  <div className="text-purple-500 font-bold text-base mb-4 group-hover:scale-110 transition-transform duration-300">KNOWLEDGE HUB</div>
                  
                  <div className="relative mb-4">
                    <div className="w-20 h-16 mx-auto relative group-hover:scale-110 transition-transform duration-500">
                      <div className="w-14 h-14 bg-purple-600 rounded-full mx-auto flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <div className="text-lg group-hover:animate-bounce">📚</div>
                      </div>
                      <div className="absolute top-0 right-1 text-base group-hover:animate-pulse">🎓</div>
                      <div className="absolute bottom-1 left-4 text-base group-hover:animate-bounce">✏️</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Loading Screen */}
        {loadingCard && <LoadingScreen />}

        {/* Repair Services Popup */}
        {showRepairPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 relative max-h-[80vh] overflow-y-auto transform animate-slideUp">
              <button
                onClick={() => setShowRepairPopup(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-red-600 mb-1">Repair Services</h2>
              <p className="text-gray-600 mb-5 text-sm">Choose the type of device you need repaired</p>

              <div className="space-y-3">
                {isLoadingServices ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 mt-2 text-sm">Loading services...</p>
                  </div>
                ) : (
                  <>
                    {/* Phone Repair Service */}
                    {(() => {
                      const phoneService = serviceTypes.find(s => s.name === 'phone');
                      const isActive = phoneService?.is_active ?? true;

                      if (!isActive) {
                        return (
                          <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-60 cursor-not-allowed">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-200 mr-4">
                              <Smartphone className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-gray-500">Phone Repair</h3>
                              <p className="text-gray-400 text-sm">Currently not in service</p>
                            </div>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          </div>
                        );
                      }

                      return (
                        <div
                          onClick={() => {
                            window.open('/repair/phone', '_blank');
                            setShowRepairPopup(false);
                          }}
                          className="flex items-center p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer hover:scale-105"
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors mr-4 group-hover:rotate-12 duration-300">
                            <Smartphone className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Phone Repair</h3>
                            <p className="text-gray-600 text-sm">Smartphone repair services</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Laptop Repair Service */}
                    {(() => {
                      const laptopService = serviceTypes.find(s => s.name === 'laptop');
                      const isActive = laptopService?.is_active ?? true;

                      if (!isActive) {
                        return (
                          <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-60 cursor-not-allowed">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-200 mr-4">
                              <Laptop className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-gray-500">Laptop Repair</h3>
                              <p className="text-gray-400 text-sm">Currently not in service</p>
                            </div>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          </div>
                        );
                      }

                      return (
                        <div
                          onClick={() => {
                            window.open('/repair/laptop', '_blank');
                            setShowRepairPopup(false);
                          }}
                          className="flex items-center p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group cursor-pointer hover:scale-105"
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors mr-4 group-hover:rotate-12 duration-300">
                            <Laptop className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">Laptop Repair</h3>
                            <p className="text-gray-600 text-sm">Laptop and computer repair services</p>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Food Services Popup */}
        {showFoodPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 relative max-h-[80vh] overflow-y-auto transform animate-slideUp">
              <button
                onClick={() => setShowFoodPopup(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-orange-600 mb-1">Food & Restaurants</h2>
              <p className="text-gray-600 mb-5 text-sm">Choose your food service category</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => {
                    window.open('/food', '_blank');
                    setShowFoodPopup(false);
                  }}
                  className="flex flex-col items-center p-5 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    🍽️
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-center">Restaurant</h3>
                  <p className="text-gray-600 text-center mt-1 text-xs">Order from partner restaurants and cafes</p>
                </div>

                <div
                  onClick={() => {
                    window.open('/hostel-mess', '_blank');
                    setShowFoodPopup(false);
                  }}
                  className="flex flex-col items-center p-5 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    🏠
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-center">Hostel and Mess</h3>
                  <p className="text-gray-600 text-center mt-1 text-xs">Hostel accommodation and mess services</p>
                </div>

                <div
                  onClick={() => {
                    window.open('/complaint-portal', '_blank');
                    setShowFoodPopup(false);
                  }}
                  className="flex flex-col items-center p-5 border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all duration-200 group cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    📝
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors text-center">Complaint Portal</h3>
                  <p className="text-gray-600 text-center mt-1 text-xs">Submit and track food service complaints</p>
                </div>
              </div>

              <div className="mt-5 text-center">
                <button 
                  onClick={() => window.open('/food', '_blank')}
                  className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-300 font-bold text-sm hover:scale-105 hover:shadow-lg"
                >
                  View All Options
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Academics and More Popup */}
        {showAcademicsPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-5 relative max-h-[80vh] overflow-y-auto transform animate-slideUp">
              <button
                onClick={() => setShowAcademicsPopup(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-purple-600 mb-1">Academics and More</h2>
              <p className="text-gray-600 mb-5 text-sm">Access study materials, clubs, faculty info, and more</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    window.open('/study-materials', '_blank');
                    setShowAcademicsPopup(false);
                  }}
                  className="flex flex-col items-center p-5 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    📚
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-center">Study Materials</h3>
                  <p className="text-gray-600 text-center mt-1 text-xs">Access notes, books, and study resources</p>
                </div>

                <div
                  onClick={() => {
                    window.open('/clubs', '_blank');
                    setShowAcademicsPopup(false);
                  }}
                  className="flex flex-col items-center p-5 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    👥
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors text-center">Clubs</h3>
                  <p className="text-gray-600 text-center mt-1 text-xs">Join student clubs and organizations</p>
                </div>

                <div
                  onClick={() => {
                    window.open('/faculty-info', '_blank');
                    setShowAcademicsPopup(false);
                  }}
                  className="flex flex-col items-center p-5 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    🎓
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-center">Faculty Info</h3>
                  <p className="text-gray-600 text-center mt-1 text-xs">Find faculty contact and office hours</p>
                </div>

                <div
                  onClick={() => {
                    window.open('/lost-and-found', '_blank');
                    setShowAcademicsPopup(false);
                  }}
                  className="flex flex-col items-center p-5 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    🔍
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-center">Lost and Found</h3>
                  <p className="text-gray-600 text-center mt-1 text-xs">Report lost items or find lost belongings</p>
                </div>
              </div>

              <div className="mt-5 text-center">
                <button 
                  onClick={() => window.open('/academics', '_blank')}
                  className="inline-flex items-center px-5 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-300 font-bold text-sm hover:scale-105 hover:shadow-lg"
                >
                  Explore All Services
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


















// 'use client';

// import { useState } from 'react';
// import {
//   Wrench,
//   Utensils,
//   BookOpen,
//   Smartphone,
//   Laptop,
//   X,
//   Coffee,
//   Pizza,
//   Sandwich,
//   IceCream,
//   Cookie,
//   ChefHat,
//   ArrowRight,
//   Search,
//   MapPin,
//   ChevronDown
// } from 'lucide-react';

// const Header = () => (
//   <header className="bg-blue-500 px-6 py-4">
//     <div className="max-w-7xl mx-auto flex justify-between items-center">
//       <div className="flex items-center">
//         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
//           <span className="text-blue-500 font-bold text-lg">V</span>
//         </div>
//         <span className="text-2xl font-bold text-white">Vhelp</span>
//       </div>
      
//       <nav className="hidden md:flex space-x-8">
//         <a href="#" className="text-white hover:text-blue-100 font-medium">Vhelp Corporate</a>
//         <a href="#" className="text-white hover:text-blue-100 font-medium">Partner with us</a>
//       </nav>
      
//       <div className="flex items-center space-x-4">
//         <button className="bg-transparent text-white px-6 py-2 rounded-xl border-2 border-white hover:bg-white hover:text-blue-500 font-medium transition-colors flex items-center">
//           Get the App
//           <ArrowRight className="w-4 h-4 ml-2" />
//         </button>
//         <button className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 font-medium transition-colors">
//           Sign in
//         </button>
//       </div>
//     </div>
//   </header>
// );

// export default function Home() {
//   const [showRepairPopup, setShowRepairPopup] = useState(false);
//   const [showFoodPopup, setShowFoodPopup] = useState(false);

//   const handleCardClick = (cardId: string) => {
//     if (cardId === 'repair-services') {
//       setShowRepairPopup(true);
//     } else if (cardId === 'food') {
//       setShowFoodPopup(true);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-blue-500 relative overflow-hidden">
//       <Header />

//       {/* Background Images - Left vegetables */}
//       <div className="absolute left-0 top-32 w-64 h-64 opacity-90">
//         <div className="text-8xl">🥬</div>
//         <div className="absolute top-16 left-8 text-6xl">🫑</div>
//         <div className="absolute top-32 left-16 text-5xl">🥕</div>
//         <div className="absolute bottom-0 left-4 text-4xl">🌽</div>
//       </div>

//       {/* Background Images - Right food */}
//       <div className="absolute right-0 top-32 w-64 h-64 opacity-90">
//         <div className="absolute top-0 right-8 text-6xl">🍣</div>
//         <div className="absolute top-16 right-16 text-5xl">🥑</div>
//         <div className="absolute bottom-8 right-4 text-7xl">🍽️</div>
//       </div>

//       {/* Main Content */}
//       <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
//         <div className="text-center mb-12">
//           <h1 className="text-5xl md:text-6xl font-bold text-white mb-12 leading-tight max-w-4xl mx-auto">
//             Discover best restaurants. Vhelp it!
//           </h1>

//           {/* Service Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Food Delivery Card */}
//             <div
//               onClick={() => handleCardClick('food')}
//               className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
//             >
//               <div className="text-left">
//                 <h3 className="text-2xl font-bold text-gray-800 mb-1">FOOD DELIVERY</h3>
//                 <p className="text-gray-500 font-medium mb-6">FROM RESTAURANTS</p>
                
//                 <div className="text-blue-500 font-bold text-xl mb-8">UPTO 60% OFF</div>
                
//                 {/* Food Image */}
//                 <div className="relative mb-6">
//                   <div className="w-32 h-24 mx-auto relative">
//                     <div className="absolute inset-0 bg-blue-600 rounded-full w-20 h-20"></div>
//                     <div className="absolute top-2 left-4 text-4xl">🍳</div>
//                     <div className="absolute bottom-0 right-2 text-3xl">🥓</div>
//                     <div className="absolute top-0 right-0 text-2xl">🍅</div>
//                   </div>
//                 </div>
                
//                 {/* Arrow Button */}
//                 <div className="flex justify-start">
//                   <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
//                     <ArrowRight className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Instamart Card */}
//             <div
//               onClick={() => handleCardClick('repair-services')}
//               className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
//             >
//               <div className="text-left">
//                 <h3 className="text-2xl font-bold text-gray-800 mb-1">INSTAMART</h3>
//                 <p className="text-gray-500 font-medium mb-6">INSTANT GROCERY</p>
                
//                 <div className="text-blue-500 font-bold text-xl mb-8">UPTO 60% OFF</div>
                
//                 {/* Grocery Image */}
//                 <div className="relative mb-6">
//                   <div className="w-32 h-24 mx-auto relative">
//                     <div className="text-5xl">🛒</div>
//                     <div className="absolute top-0 right-4 text-2xl">🥬</div>
//                     <div className="absolute bottom-2 left-8 text-2xl">🍎</div>
//                   </div>
//                 </div>
                
//                 {/* Arrow Button */}
//                 <div className="flex justify-start">
//                   <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
//                     <ArrowRight className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Dineout Card */}
//             <div
//               className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
//             >
//               <div className="text-left">
//                 <h3 className="text-2xl font-bold text-gray-800 mb-1">DINEOUT</h3>
//                 <p className="text-gray-500 font-medium mb-6">EAT OUT & SAVE MORE</p>
                
//                 <div className="text-blue-500 font-bold text-xl mb-8">UPTO 50% OFF</div>
                
//                 {/* Dineout Image */}
//                 <div className="relative mb-6">
//                   <div className="w-32 h-24 mx-auto relative">
//                     <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto flex items-center justify-center">
//                       <div className="text-3xl">🍽️</div>
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Arrow Button */}
//                 <div className="flex justify-start">
//                   <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
//                     <ArrowRight className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Repair Services Popup */}
//       {showRepairPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
//             <button
//               onClick={() => setShowRepairPopup(false)}
//               className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             <h2 className="text-3xl font-bold text-blue-600 mb-2">Instamart</h2>
//             <p className="text-gray-600 mb-8">Choose the type of service you need</p>

//             <div className="space-y-4">
//               <div className="flex items-center p-6 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer">
//                 <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition-colors mr-6">
//                   <Smartphone className="w-8 h-8 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Phone Repair</h3>
//                   <p className="text-gray-600">Smartphone repair services</p>
//                 </div>
//               </div>

//               <div className="flex items-center p-6 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer">
//                 <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition-colors mr-6">
//                   <Laptop className="w-8 h-8 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Laptop Repair</h3>
//                   <p className="text-gray-600">Laptop and computer repair services</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Food Services Popup */}
//       {showFoodPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
//             <button
//               onClick={() => setShowFoodPopup(false)}
//               className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             <h2 className="text-3xl font-bold text-blue-600 mb-2">Food Delivery</h2>
//             <p className="text-gray-600 mb-8">Choose from our partner restaurants</p>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {[
//                 { name: 'Starbucks', desc: 'Coffee & Beverages', emoji: '☕' },
//                 { name: 'Pizza Hut', desc: 'Pizza & Italian', emoji: '🍕' },
//                 { name: 'Subway', desc: 'Sandwiches & Subs', emoji: '🥪' },
//                 { name: 'Baskin Robbins', desc: 'Ice Cream & Desserts', emoji: '🍦' },
//                 { name: "McDonald's", desc: 'Fast Food & Burgers', emoji: '🍟' },
//                 { name: 'Olive Garden', desc: 'Fine Dining & Italian', emoji: '🍝' }
//               ].map((restaurant, index) => (
//                 <div
//                   key={index}
//                   className="flex flex-col items-center p-6 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer"
//                 >
//                   <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
//                     {restaurant.emoji}
//                   </div>
//                   <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-center">{restaurant.name}</h3>
//                   <p className="text-sm text-gray-600 text-center mt-1">{restaurant.desc}</p>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-8 text-center">
//               <button className="inline-flex items-center px-8 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors font-bold text-lg">
//                 View All Restaurants
//                 <ArrowRight className="w-5 h-5 ml-2" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


















// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import {
//   BookOpen,
//   Code,
//   Palette,
//   Camera,
//   Music,
//   Gamepad2,
//   Utensils,
//   Plane,
//   Heart,
//   Wrench,
//   Smartphone,
//   Laptop,
//   X,
//   Coffee,
//   Pizza,
//   Sandwich,
//   IceCream,
//   Cookie,
//   ChefHat,
//   AlertCircle,
//   Home as HomeIcon,
//   MessageSquare,
//   GraduationCap,
//   BookOpen as BookIcon,
//   Users,
//   Search
// } from 'lucide-react';
// import { getServiceTypes, ServiceType } from '@/lib/service-types-api';
// import VendorNavigation from '@/components/admin/VendorNavigation';
// import { getCurrentUser } from '@/lib/auth';

// interface CardData {
//   id: string;
//   title: string;
//   description: string;
//   icon: React.ComponentType<{ className?: string }>;
//   color: string;
//   bgGradient: string;
// }

// const cardData: CardData[] = [
//   {
//     id: 'repair-services',
//     title: 'Repair Services',
//     description: 'Professional phone and laptop repair services',
//     icon: Wrench,
//     color: 'text-red-600',
//     bgGradient: 'from-red-50 to-red-100'
//   },
//   {
//     id: 'food',
//     title: 'Food & Restaurants',
//     description: 'Order from your favorite restaurants and cafes',
//     icon: Utensils,
//     color: 'text-orange-600',
//     bgGradient: 'from-orange-50 to-orange-100'
//   },
//   {
//     id: 'academics',
//     title: 'Academics and More',
//     description: 'Study materials, clubs, faculty info, and lost & found',
//     icon: GraduationCap,
//     color: 'text-purple-600',
//     bgGradient: 'from-purple-50 to-purple-100'
//   }
// ];

// export default function Home() {
//   const router = useRouter();
//   const [showRepairPopup, setShowRepairPopup] = useState(false);
//   const [showFoodPopup, setShowFoodPopup] = useState(false);
//   const [showAcademicsPopup, setShowAcademicsPopup] = useState(false);
//   const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
//   const [isLoadingServices, setIsLoadingServices] = useState(true);
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true);

//   // Check user role and redirect vendors to their dashboards
//   useEffect(() => {
//     const checkUserAndRedirect = async () => {
//       try {
//         const user = await getCurrentUser();

//         if (user) {
//           // Redirect phone vendors to their dashboard
//           if (user.role === 'phone_vendor') {
//             router.push('/admin/phone-vendor');
//             return;
//           }

//           // Redirect laptop vendors to their dashboard
//           if (user.role === 'laptop_vendor') {
//             router.push('/admin/laptop-vendor');
//             return;
//           }
//         }
//       } catch (error) {
//         console.error('Error checking user role:', error);
//       } finally {
//         setIsCheckingAuth(false);
//       }
//     };

//     checkUserAndRedirect();
//   }, [router]);

//   // Fetch service types on component mount
//   useEffect(() => {
//     const fetchServiceTypes = async () => {
//       try {
//         setIsLoadingServices(true);
//         const result = await getServiceTypes();
//         if (result.success) {
//           setServiceTypes(result.data || []);
//         } else {
//           console.error('Failed to fetch service types:', result.error);
//         }
//       } catch (error) {
//         console.error('Error fetching service types:', error);
//       } finally {
//         setIsLoadingServices(false);
//       }
//     };

//     fetchServiceTypes();
//   }, []);

//   const handleCardClick = async (cardId: string) => {
//     if (cardId === 'repair-services') {
//       // Check if user is a vendor and redirect them directly
//       try {
//         const user = await getCurrentUser();
//         if (user?.role === 'phone_vendor') {
//           router.push('/admin/phone-vendor');
//           return;
//         }
//         if (user?.role === 'laptop_vendor') {
//           router.push('/admin/laptop-vendor');
//           return;
//         }
//       } catch (error) {
//         console.error('Error checking user role:', error);
//       }

//       // Show popup for regular users
//       setShowRepairPopup(true);
//     } else if (cardId === 'food') {
//       setShowFoodPopup(true);
//     } else if (cardId === 'academics') {
//       setShowAcademicsPopup(true);
//     } else {
//       // Handle other cards with existing navigation
//       window.open(`/category/${cardId}`, '_blank');
//     }
//   };

//   // Show loading while checking authentication
//   if (isCheckingAuth) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center mb-12">
//           <h2 className="text-4xl font-bold text-gray-900 mb-4">
//             Explore Our Categories
//           </h2>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Choose from our diverse range of categories to find exactly what you&apos;re looking for.
//             Each category offers unique content and experiences tailored to your interests.
//           </p>
//         </div>

//         {/* Vendor Navigation for Admin Users */}
//         <div className="mb-12">
//           <VendorNavigation />
//         </div>

//         {/* 3x3 Grid of Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {cardData.map((card) => {
//             const IconComponent = card.icon;

//             if (card.id === 'repair-services' || card.id === 'food' || card.id === 'academics') {
//               return (
//                 <div
//                   key={card.id}
//                   onClick={() => handleCardClick(card.id)}
//                   className="group cursor-pointer"
//                 >
//                   <div className={`
//                     bg-gradient-to-br ${card.bgGradient}
//                     rounded-xl p-6 shadow-lg hover:shadow-2xl
//                     transition-all duration-300 transform
//                     hover:-translate-y-3 hover:scale-105
//                     border border-gray-200 hover:border-gray-300
//                     cursor-pointer relative overflow-hidden
//                     before:absolute before:inset-0 before:bg-white before:opacity-0
//                     hover:before:opacity-10 before:transition-opacity before:duration-300
//                   `}>
//                     <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 relative z-10">
//                       <IconComponent className={`w-8 h-8 ${card.color} transition-transform duration-300 group-hover:scale-110`} />
//                     </div>

//                     <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300">
//                       {card.title}
//                     </h3>

//                     <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-500 transition-colors duration-300">
//                       {card.description}
//                     </p>

//                     <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
//                       <span>Explore</span>
//                       <svg
//                         className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               );
//             } else {
//               return (
//                 <Link
//                   key={card.id}
//                   href={`/category/${card.id}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="group"
//                 >
//                   <div className={`
//                     bg-gradient-to-br ${card.bgGradient}
//                     rounded-xl p-6 shadow-lg hover:shadow-2xl
//                     transition-all duration-300 transform
//                     hover:-translate-y-3 hover:scale-105
//                     border border-gray-200 hover:border-gray-300
//                     cursor-pointer relative overflow-hidden
//                     before:absolute before:inset-0 before:bg-white before:opacity-0
//                     hover:before:opacity-10 before:transition-opacity before:duration-300
//                   `}>
//                     <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 relative z-10">
//                       <IconComponent className={`w-8 h-8 ${card.color} transition-transform duration-300 group-hover:scale-110`} />
//                     </div>

//                     <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300">
//                       {card.title}
//                     </h3>

//                     <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-500 transition-colors duration-300">
//                       {card.description}
//                     </p>

//                     <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
//                       <span>Explore</span>
//                       <svg
//                         className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </div>
//                   </div>
//                 </Link>
//               );
//             }
//           })}
//         </div>
//       </main>

//       {/* Repair Services Popup */}
//       {showRepairPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
//             <button
//               onClick={() => setShowRepairPopup(false)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Repair Services</h2>
//             <p className="text-gray-600 mb-6">Choose the type of device you need repaired</p>

//             <div className="space-y-4">
//               {isLoadingServices ? (
//                 <div className="text-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
//                   <p className="text-gray-600 mt-2">Loading services...</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Phone Repair Service */}
//                   {(() => {
//                     const phoneService = serviceTypes.find(s => s.name === 'phone');
//                     const isActive = phoneService?.is_active ?? true;

//                     if (!isActive) {
//                       return (
//                         <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
//                           <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mr-4">
//                             <Smartphone className="w-6 h-6 text-gray-400" />
//                           </div>
//                           <div className="flex-1">
//                             <h3 className="font-semibold text-gray-500">Phone Repair</h3>
//                             <p className="text-sm text-gray-400">Currently not in service</p>
//                           </div>
//                           <AlertCircle className="w-5 h-5 text-red-500" />
//                         </div>
//                       );
//                     }

//                     return (
//                       <Link
//                         href="/repair/phone"
//                         className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
//                         onClick={() => setShowRepairPopup(false)}
//                       >
//                         <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mr-4">
//                           <Smartphone className="w-6 h-6 text-blue-600" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Phone Repair</h3>
//                           <p className="text-sm text-gray-600">Smartphone repair services</p>
//                         </div>
//                       </Link>
//                     );
//                   })()}

//                   {/* Laptop Repair Service */}
//                   {(() => {
//                     const laptopService = serviceTypes.find(s => s.name === 'laptop');
//                     const isActive = laptopService?.is_active ?? true;

//                     if (!isActive) {
//                       return (
//                         <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
//                           <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mr-4">
//                             <Laptop className="w-6 h-6 text-gray-400" />
//                           </div>
//                           <div className="flex-1">
//                             <h3 className="font-semibold text-gray-500">Laptop Repair</h3>
//                             <p className="text-sm text-gray-400">Currently not in service</p>
//                           </div>
//                           <AlertCircle className="w-5 h-5 text-red-500" />
//                         </div>
//                       );
//                     }

//                     return (
//                       <Link
//                         href="/repair/laptop"
//                         className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
//                         onClick={() => setShowRepairPopup(false)}
//                       >
//                         <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mr-4">
//                           <Laptop className="w-6 h-6 text-green-600" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Laptop Repair</h3>
//                           <p className="text-sm text-gray-600">Laptop and computer repair services</p>
//                         </div>
//                       </Link>
//                     );
//                   })()}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Food Services Popup */}
//       {showFoodPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
//             <button
//               onClick={() => setShowFoodPopup(false)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Food & Restaurants</h2>
//             <p className="text-gray-600 mb-6">Choose your food service category</p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* Restaurant Card */}
//               <Link
//                 href="/food"
//                 className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group cursor-pointer"
//                 onClick={() => setShowFoodPopup(false)}
//               >
//                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors mb-4">
//                   <Utensils className="w-10 h-10 text-orange-600" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-center text-lg">Restaurant</h3>
//                 <p className="text-sm text-gray-600 text-center mt-2">Order from partner restaurants and cafes</p>
//               </Link>

//               {/* Hostel and Mess Card */}
//               <Link
//                 href="/hostel-mess"
//                 className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group cursor-pointer"
//                 onClick={() => setShowFoodPopup(false)}
//               >
//                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-4">
//                   <HomeIcon className="w-10 h-10 text-blue-600" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-center text-lg">Hostel and Mess</h3>
//                 <p className="text-sm text-gray-600 text-center mt-2">Hostel accommodation and mess services</p>
//               </Link>

//               {/* Complaint Portal Card */}
//               <Link
//                 href="/complaint-portal"
//                 className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 group cursor-pointer"
//                 onClick={() => setShowFoodPopup(false)}
//               >
//                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors mb-4">
//                   <MessageSquare className="w-10 h-10 text-red-600" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors text-center text-lg">Complaint Portal</h3>
//                 <p className="text-sm text-gray-600 text-center mt-2">Submit and track food service complaints</p>
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Academics and More Popup */}
//       {showAcademicsPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
//             <button
//               onClick={() => setShowAcademicsPopup(false)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Academics and More</h2>
//             <p className="text-gray-600 mb-6">Access study materials, clubs, faculty info, and more</p>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Study Materials Card */}
//               <Link
//                 href="/study-materials"
//                 className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group cursor-pointer"
//                 onClick={() => setShowAcademicsPopup(false)}
//               >
//                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors mb-4">
//                   <BookIcon className="w-10 h-10 text-purple-600" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-center text-lg">Study Materials</h3>
//                 <p className="text-sm text-gray-600 text-center mt-2">Access notes, books, and study resources</p>
//               </Link>

//               {/* Clubs Card */}
//               <Link
//                 href="/clubs"
//                 className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group cursor-pointer"
//                 onClick={() => setShowAcademicsPopup(false)}
//               >
//                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mb-4">
//                   <Users className="w-10 h-10 text-green-600" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-center text-lg">Clubs</h3>
//                 <p className="text-sm text-gray-600 text-center mt-2">Join student clubs and organizations</p>
//               </Link>

//               {/* Faculty Info Card */}
//               <Link
//                 href="/faculty-info"
//                 className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group cursor-pointer"
//                 onClick={() => setShowAcademicsPopup(false)}
//               >
//                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-4">
//                   <GraduationCap className="w-10 h-10 text-blue-600" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-center text-lg">Faculty Info</h3>
//                 <p className="text-sm text-gray-600 text-center mt-2">Find faculty contact and office hours</p>
//               </Link>

//               {/* Lost and Found Card */}
//               <Link
//                 href="/lost-and-found"
//                 className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group cursor-pointer"
//                 onClick={() => setShowAcademicsPopup(false)}
//               >
//                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors mb-4">
//                   <Search className="w-10 h-10 text-orange-600" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-center text-lg">Lost and Found</h3>
//                 <p className="text-sm text-gray-600 text-center mt-2">Report lost items or find lost belongings</p>
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}

//       <Footer />
//     </div>
//   );
// }
