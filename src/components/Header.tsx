'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authStorage, authHelpers } from '@/lib/api';
import { getCurrentUserSync, logout, useAuthListener } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';
import { User, LogOut, Home, Menu, X, Settings, Shield, Store, ChefHat } from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export default function Header({
  showBackButton = false,
  backButtonText = "Back to Home",
  backButtonHref = "/"
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  const { user, isLoading: isCheckingAuth, isLoggedIn: isAuthenticated, refreshAuth } = useAuth();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Listen for auth changes to refresh the auth provider
  useEffect(() => {
    const handleAuthChange = () => {
      refreshAuth();
    };

    window.addEventListener('authStatusChanged', handleAuthChange);
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [refreshAuth]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfilePopup || showMobileMenu) {
        setShowProfilePopup(false);
        setShowMobileMenu(false);
      }
    };

    if (showProfilePopup || showMobileMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfilePopup, showMobileMenu]);

  const handleLogout = async () => {
    try {
      // Use new auth system logout
      await logout();

      // Also clear old auth system
      await authStorage.clear();

      // Refresh auth state
      await refreshAuth();

      // Trigger auth change event
      window.dispatchEvent(new CustomEvent('auth-changed'));

      // Close popup
      setShowProfilePopup(false);

      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'phone_vendor':
      case 'laptop_vendor':
        return <Store className="w-4 h-4" />;
      case 'restaurant_admin':
        return <ChefHat className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'phone_vendor':
        return 'Phone Vendor';
      case 'laptop_vendor':
        return 'Laptop Vendor';
      case 'restaurant_admin':
        return 'Restaurant Admin';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
      <header className="bg-[#233d8e] relative overflow-hidden z-50">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[#233d8e]"></div>
        <div className="absolute top-0 right-0 w-64 h-32 opacity-20">
          <div className="absolute top-2 right-8 text-4xl">✨</div>
          <div className="absolute top-8 right-16 text-2xl">🚀</div>
          <div className="absolute top-4 right-4 text-3xl">💫</div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex justify-between items-center">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              {showBackButton ? (
                <Link
                  href={backButtonHref}
                  className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-300 hover:scale-105 border border-white/20"
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium text-sm">{backButtonText}</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Logo */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <img src="./assets/logo.png" alt="Logo" className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right section */}
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/"
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 text-sm ${
                    isHomePage
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                {isCheckingAuth ? (
                  // Loading state
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-xs text-white">Checking...</span>
                  </div>
                ) : isAuthenticated ? (
                  // Authenticated user profile with logout button
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfilePopup(true);
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl font-medium transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105 text-sm"
                    >
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="hidden sm:inline">{user?.firstName || user?.first_name || 'User'}</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 px-2 py-1.5 bg-red-500/20 backdrop-blur-sm text-white hover:bg-red-500/30 rounded-xl font-medium transition-all duration-300 border border-red-400/30 hover:border-red-400/50 hover:scale-105 text-sm"
                    >
                      <LogOut className="w-3 h-3" />
                      <span className="hidden sm:inline text-xs">Logout</span>
                    </button>
                  </div>
                ) : (
                  // Unauthenticated user buttons
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="px-3 py-1.5 text-white hover:bg-white/20 backdrop-blur-sm font-medium transition-all duration-300 rounded-xl border border-white/20 hover:border-white/40 text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3 py-1.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileMenu(!showMobileMenu);
                }}
                className="md:hidden p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-300"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </nav>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-3 pb-3 border-t border-white/20">
              <div className="flex flex-col space-y-2 mt-3">
                <Link
                  href="/"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${
                    isHomePage
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                {isCheckingAuth ? (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-xs text-white">Checking...</span>
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMobileMenu(false);
                        setShowProfilePopup(true);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white text-sm"
                    >
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-white text-sm">{user?.firstName || user?.first_name || 'User'}</p>
                        <p className="text-xs text-blue-100">{user?.email}</p>
                      </div>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-red-500/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-red-400/30 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-white hover:bg-white/20 backdrop-blur-sm font-medium rounded-xl transition-all duration-300 border border-white/20 text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-3 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-medium transition-all duration-300 shadow-lg text-center text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Profile Information Popup */}
      {showProfilePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowProfilePopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
            </div>

            {/* User Information */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.firstName || user?.first_name || 'User'} {user?.lastName || user?.last_name || ''}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
                <p className="text-lg text-gray-900">{user?.email}</p>
              </div>

              {user?.role && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-sm font-medium text-gray-500 block mb-1">Role</label>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <p className="text-lg text-gray-900">{getRoleText(user.role)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Admin Dashboard Link */}
              {(user?.role === 'admin' || user?.role === 'phone_vendor' || user?.role === 'laptop_vendor' || user?.role === 'restaurant_admin') && (
                <Link
                  href="/admin"
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                  onClick={() => setShowProfilePopup(false)}
                >
                  {getRoleIcon(user?.role)}
                  <span>Go to {getRoleText(user?.role)}</span>
                </Link>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setShowProfilePopup(false)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
















// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { authStorage, authHelpers } from '@/lib/api';
// import { getCurrentUserSync, isAuthenticated as checkAuth, logout, useAuthListener, getUserDisplayName } from '@/lib/auth';
// import { useAuth } from '@/components/AuthProvider';
// import { User, LogOut, ChevronDown } from 'lucide-react';

// interface HeaderProps {
//   showBackButton?: boolean;
//   backButtonText?: string;
//   backButtonHref?: string;
// }

// export default function Header({
//   showBackButton = false,
//   backButtonText = "Back to Home",
//   backButtonHref = "/"
// }: HeaderProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const isHomePage = pathname === '/';

//   const { user, isLoading: isCheckingAuth, isLoggedIn: isAuthenticated, refreshAuth } = useAuth();
//   const [showUserMenu, setShowUserMenu] = useState(false);

//   // Listen for auth changes to refresh the auth provider
//   useEffect(() => {
//     const handleAuthChange = () => {
//       refreshAuth();
//     };

//     window.addEventListener('authStatusChanged', handleAuthChange);
//     window.addEventListener('auth-changed', handleAuthChange);

//     return () => {
//       window.removeEventListener('authStatusChanged', handleAuthChange);
//       window.removeEventListener('auth-changed', handleAuthChange);
//     };
//   }, [refreshAuth]);

//   // Close user menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (showUserMenu) {
//         setShowUserMenu(false);
//       }
//     };

//     if (showUserMenu) {
//       document.addEventListener('click', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//     };
//   }, [showUserMenu]);

//   const handleLogout = async () => {
//     try {
//       // Use new auth system logout
//       await logout();

//       // Also clear old auth system
//       await authStorage.clear();

//       // Refresh auth state
//       await refreshAuth();

//       // Trigger auth change event
//       window.dispatchEvent(new CustomEvent('auth-changed'));

//       router.push('/');
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <header className="bg-white shadow-sm border-b">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             {showBackButton && (
//               <Link
//                 href={backButtonHref}
//                 className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
//               >
//                 <svg 
//                   className="w-4 h-4 mr-2" 
//                   fill="none" 
//                   stroke="currentColor" 
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//                 {backButtonText}
//               </Link>
//             )}
//             {!showBackButton && (
//               <div>
//                 <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200">
//                   VHELP
//                 </Link>
//                 {isHomePage && (
//                   <p className="text-gray-600 mt-1">Discover amazing content across different categories</p>
//                 )}
//               </div>
//             )}
//           </div>
          
//           <nav className="flex items-center space-x-4">
//             <Link
//               href="/"
//               className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
//                 isHomePage
//                   ? 'text-blue-600 bg-blue-50'
//                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//               }`}
//             >
//               Home
//             </Link>

//             {isCheckingAuth ? (
//               // Loading state while checking authentication
//               <div className="flex items-center space-x-2">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
//                 <span className="text-sm text-gray-500">Checking...</span>
//               </div>
//             ) : isAuthenticated ? (
//               // Authenticated user navigation
//               <div className="relative">
//                 <button
//                   onClick={() => setShowUserMenu(!showUserMenu)}
//                   className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
//                 >
//                   <User className="w-4 h-4" />
//                   <span>{user?.firstName || user?.first_name || 'User'}</span>
//                   <ChevronDown className="w-4 h-4" />
//                 </button>

//                 {showUserMenu && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
//                     <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
//                       {user?.email}
//                     </div>

//                     {/* Admin Navigation */}
//                     {(user?.role === 'admin' || user?.role === 'phone_vendor' || user?.role === 'laptop_vendor' || user?.role === 'restaurant_admin') && (
//                       <>
//                         <Link
//                           href="/admin"
//                           className="w-full flex items-center space-x-2 px-4 py-2 text-left text-blue-600 hover:bg-blue-50 transition-colors duration-200"
//                           onClick={() => setShowUserMenu(false)}
//                         >
//                           <span className="text-sm">⚙️</span>
//                           <span>
//                             {user?.role === 'admin' ? 'Admin Dashboard' :
//                              user?.role === 'phone_vendor' ? 'Phone Vendor' :
//                              user?.role === 'laptop_vendor' ? 'Laptop Vendor' :
//                              user?.role === 'restaurant_admin' ? 'Restaurant Admin' : 'Dashboard'}
//                           </span>
//                         </Link>
//                         <div className="border-t border-gray-100 my-1"></div>
//                       </>
//                     )}

//                     <button
//                       onClick={handleLogout}
//                       className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       <span>Logout</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               // Unauthenticated user navigation
//               <>
//                 <Link
//                   href="/login"
//                   className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   href="/signup"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// }
