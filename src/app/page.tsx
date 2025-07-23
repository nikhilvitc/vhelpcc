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
        onClick={() => window.open('https://vhelp-game-chi.vercel.app/', '_blank')}
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
