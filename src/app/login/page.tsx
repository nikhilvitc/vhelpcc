'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

import { loginSchema, LoginFormData } from '@/lib/validations';
import { login, executePendingAction } from '@/lib/auth';
import { executePendingCartAction } from '@/lib/cart';

// Enhanced Loading Screen Component (matching design)
const LoadingScreen = ({ message = "Signing you in..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 flex flex-col items-center space-y-3 mx-4 max-w-sm w-full">
        <div className="relative">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <div className="absolute inset-0 w-6 h-6 border-2 border-blue-200 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-800 font-medium text-sm">{message}</p>
          <p className="text-gray-500 text-xs">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};

// Header Component (matching the design from signup)
const LoginHeader = () => {
  return (
    <header className="bg-[#233d8e] relative overflow-hidden z-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[#233d8e]"></div>
      <div className="absolute top-0 right-0 w-48 h-20 opacity-20">
        <div className="absolute top-1 right-6 text-2xl">✨</div>
        <div className="absolute top-4 right-12 text-lg">🚀</div>
        <div className="absolute top-2 right-2 text-xl">💫</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium text-sm">Back</span>
            </button>
          </div>
          
          {/* Center - Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <img src="./assets/logo.png" alt="Logo" className="w-6 h-6" />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center">
            <Link
              href="/"
              className="px-3 py-1.5 text-white hover:bg-white/20 backdrop-blur-sm font-medium transition-all duration-300 rounded-lg border border-white/20 hover:border-white/40 text-sm"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [signupUrl, setSignupUrl] = useState('/signup');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Preserve return URL when navigating to signup
  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      setSignupUrl(`/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError('');

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        // Execute any pending actions after successful login
        try {
          executePendingAction();
          executePendingCartAction();
        } catch (actionError) {
          console.error('Error executing pending actions:', actionError);
          // Continue with navigation even if pending actions fail
        }

        // Get return URL from query params or session storage
        const urlParams = new URLSearchParams(window.location.search);
        let returnUrl = urlParams.get('returnUrl');

        if (!returnUrl) {
          returnUrl = sessionStorage.getItem('returnUrl') || '';
        }

        // Clean up session storage
        sessionStorage.removeItem('returnUrl');
        sessionStorage.removeItem('serviceContext');

        // Navigate to return URL or home page
        router.push(returnUrl || '/');
      } else {
        setApiError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>

      <div className="h-screen bg-[#233d8e] relative overflow-hidden flex flex-col text-black">
        {/* <LoginHeader /> */}
        
        {/* Background Images */}
        <div className="absolute left-4 top-20 w-16 h-16 opacity-30 hidden lg:block z-0">
          <div className="text-lg">🔐</div>
          <div className="absolute top-2 left-2 text-sm">🔑</div>
          <div className="absolute top-4 left-4 text-xs">🛡️</div>
        </div>

        <div className="absolute right-4 top-20 w-16 h-16 opacity-30 hidden lg:block z-0">
          <div className="absolute top-0 right-2 text-sm">⚡</div>
          <div className="absolute top-2 right-4 text-xs">💫</div>
          <div className="absolute bottom-1 right-0 text-lg">🎯</div>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative z-10 flex items-center justify-center px-4 py-4">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-120px)]">
              
              {/* Left Side - Welcome Content */}
              <div className="text-center lg:text-left space-y-6">
                <div>
                  {/* <div className="mx-auto lg:mx-0 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
                    <LogIn className="h-8 w-8 text-white" />
                  </div> */}
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    Welcome Back
                  </h1>
                  <p className="text-xl text-blue-100 mb-6">
                    Sign in to access your campus services, connect with your community, and manage your college experience.
                  </p>
                </div>
                
                {/* Features List */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-lg">Access all your services instantly</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-lg">Stay connected with campus life</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-lg">Manage your academic journey</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
                      <p className="text-gray-600 text-sm">Enter your credentials to continue</p>
                    </div>

                    {/* Error Message */}
                    {apiError && (
                      <div className="rounded-lg bg-red-50 p-3 mb-4 border border-red-200 animate-slideUp">
                        <div className="text-sm text-red-700 font-medium">{apiError}</div>
                      </div>
                    )}

                    <div onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            {...register('email')}
                            type="email"
                            autoComplete="email"
                            className={`w-full pl-10 pr-4 py-3 border ${
                              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400`}
                            placeholder="your.email@college.edu"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 animate-slideUp">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            className={`w-full pl-10 pr-12 py-3 border ${
                              errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400`}
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600 animate-slideUp">{errors.password.message}</p>
                        )}
                      </div>

                      {/* Forgot Password Link */}
                      <div className="flex justify-end">
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                          Forgot your password?
                        </Link>
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign In
                          </div>
                        )}
                      </button>

                      {/* Signup Link */}
                      <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          Don't have an account?{' '}
                          <Link
                            href={signupUrl}
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                          >
                            Create one here
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Loading Screen */}
        {isLoading && <LoadingScreen />}
      </div>
    </>
  );
}
















// 'use client';

// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

// import { loginSchema, LoginFormData } from '@/lib/validations';
// import { login, executePendingAction } from '@/lib/auth';
// import { executePendingCartAction } from '@/lib/cart';

// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState<string>('');
//   const [signupUrl, setSignupUrl] = useState('/signup');
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Preserve return URL when navigating to signup
//   useEffect(() => {
//     const returnUrl = searchParams.get('returnUrl');
//     if (returnUrl) {
//       setSignupUrl(`/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
//     }
//   }, [searchParams]);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//   });

//   const onSubmit = async (data: LoginFormData) => {
//     setIsLoading(true);
//     setApiError('');

//     try {
//       const result = await login(data.email, data.password);

//       if (result.success) {
//         // Execute any pending actions after successful login
//         try {
//           executePendingAction();
//           executePendingCartAction();
//         } catch (actionError) {
//           console.error('Error executing pending actions:', actionError);
//           // Continue with navigation even if pending actions fail
//         }

//         // Get return URL from query params or session storage
//         const urlParams = new URLSearchParams(window.location.search);
//         let returnUrl = urlParams.get('returnUrl');

//         if (!returnUrl) {
//           returnUrl = sessionStorage.getItem('returnUrl') || '';
//         }

//         // Clean up session storage
//         sessionStorage.removeItem('returnUrl');
//         sessionStorage.removeItem('serviceContext');

//         // Navigate to return URL or home page
//         router.push(returnUrl || '/');
//       } else {
//         setApiError(result.error || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
//             <LogIn className="h-6 w-6 text-blue-600" />
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in to your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Or{' '}
//             <Link
//               href={signupUrl}
//               className="font-medium text-blue-600 hover:text-blue-500"
//             >
//               create a new account
//             </Link>
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
//           {apiError && (
//             <div className="rounded-md bg-red-50 p-4">
//               <div className="text-sm text-red-700">{apiError}</div>
//             </div>
//           )}

//           <div className="space-y-4">
//             {/* Email Field */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('email')}
//                   type="email"
//                   autoComplete="email"
//                   className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
//                     errors.email ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
//                   placeholder="Enter your email"
//                 />
//               </div>
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('password')}
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${
//                     errors.password ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
//                   placeholder="Enter your password"
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="text-sm">
//               <Link
//                 href="/forgot-password"
//                 className="font-medium text-blue-600 hover:text-blue-500"
//               >
//                 Forgot your password?
//               </Link>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Signing in...
//                 </div>
//               ) : (
//                 'Sign in'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
