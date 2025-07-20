'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, X, CheckCircle, ArrowLeft, Phone, MapPin, Loader2 } from 'lucide-react';

import { signupSchema, SignupFormData } from '@/lib/validations';
import { signup, executePendingAction } from '@/lib/auth';
import { executePendingCartAction } from '@/lib/cart';

// Enhanced Loading Screen Component (matching home page style)
const LoadingScreen = ({ message = "Creating your account..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 flex flex-col items-center space-y-3 mx-4 max-w-sm w-full">
        <div className="relative">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          <div className="absolute inset-0 w-6 h-6 border-2 border-green-200 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-800 font-medium text-sm">{message}</p>
          <p className="text-gray-500 text-xs">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};

// Header Component (matching the design from Header.jsx)
const SignupHeader = () => {
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
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1.5 text-white hover:bg-white/20 backdrop-blur-sm font-medium transition-all duration-300 rounded-lg border border-white/20 hover:border-white/40 text-sm"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loginUrl, setLoginUrl] = useState('/login');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Preserve return URL when navigating to login
  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      setLoginUrl(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setApiError('');

    try {
      console.log('Signup form data:', data); // Debug log

      // Use our new Supabase auth system
      const result = await signup({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || '',
        address: data.address || ''
      });

      console.log('Signup result:', result); // Debug log

      if (result.success) {
        // Store the user's email for the confirmation popup
        setUserEmail(data.email);

        // Show email confirmation popup instead of redirecting
        setShowEmailConfirmation(true);

        // Note: We don't execute pending actions or navigate immediately
        // The user will be redirected after email confirmation
      } else {
        setApiError(result.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
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

      <div className="h-screen bg-[#233d8e] relative overflow-hidden flex flex-col">
        {/* <SignupHeader /> */}
        
        {/* Background Images */}
        <div className="absolute left-4 top-20 w-16 h-16 opacity-30 hidden lg:block z-0">
          <div className="text-lg">🎓</div>
          <div className="absolute top-2 left-2 text-sm">📚</div>
          <div className="absolute top-4 left-4 text-xs">✏️</div>
        </div>

        <div className="absolute right-4 top-20 w-16 h-16 opacity-30 hidden lg:block z-0">
          <div className="absolute top-0 right-2 text-sm">🌟</div>
          <div className="absolute top-2 right-4 text-xs">💡</div>
          <div className="absolute bottom-1 right-0 text-lg">🎯</div>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative z-10 flex items-center justify-center px-4 py-4">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-120px)]">
              
              {/* Left Side - Welcome Content */}
              <div className="text-center lg:text-left space-y-6">
                <div>
                  <div className="mx-auto lg:mx-0 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    Join Our College Community
                  </h1>
                  <p className="text-xl text-blue-100 mb-6">
                    Create your account and unlock access to all campus services, resources, and opportunities.
                  </p>
                </div>
                
                {/* Features List */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-lg">Access to all campus services</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-lg">Connect with clubs and organizations</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-lg">Get academic support and resources</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Signup Form */}
              <div className="w-full max-w-md mx-auto text-black">
                <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                      <p className="text-gray-600 text-sm">Fill in your details to get started</p>
                    </div>

                    {/* Error Message */}
                    {apiError && (
                      <div className="rounded-lg bg-red-50 p-3 mb-4 border border-red-200 animate-slideUp">
                        <div className="text-sm text-red-700 font-medium">{apiError}</div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* Name Fields Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* First Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              {...register('firstName')}
                              type="text"
                              autoComplete="given-name"
                              className={`w-full pl-9 pr-3 py-2.5 text-sm border ${
                                errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                              placeholder="First"
                            />
                          </div>
                          {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              {...register('lastName')}
                              type="text"
                              autoComplete="family-name"
                              className={`w-full pl-9 pr-3 py-2.5 text-sm border ${
                                errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                              placeholder="Last"
                            />
                          </div>
                          {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            {...register('email')}
                            type="email"
                            autoComplete="email"
                            className={`w-full pl-9 pr-3 py-2.5 text-sm border ${
                              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                            placeholder="your.email@college.edu"
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                      </div>

                      {/* Phone & Address Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Phone Field */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              {...register('phone')}
                              type="tel"
                              autoComplete="tel"
                              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                              placeholder="Phone"
                            />
                          </div>
                          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                        </div>

                        {/* Address Field */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                              {...register('address')}
                              type="text"
                              value="VIT Chennai"
                              readOnly
                              autoComplete="street-address"
                              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                              placeholder="Address"
                            />
                          </div>
                          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
                        </div>
                      </div>

                      {/* Password Fields */}
                      <div className="space-y-3">
                        {/* Password Field */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              {...register('password')}
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              className={`w-full pl-9 pr-10 py-2.5 text-sm border ${
                                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                              placeholder="Create password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              {...register('confirmPassword')}
                              type={showConfirmPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              className={`w-full pl-9 pr-10 py-2.5 text-sm border ${
                                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                              placeholder="Confirm password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Creating...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <UserPlus className="w-5 h-5 mr-2" />
                            Create Account
                          </div>
                        )}
                      </button>
                      </form>

                      {/* Login Link */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600">
                          Already have an account?{' '}
                          <Link
                            href={loginUrl}
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                          >
                            Sign in here
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

        {/* Email Confirmation Popup */}
        {showEmailConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fadeIn">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform animate-slideUp overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowEmailConfirmation(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 duration-300 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Check Your Email</h2>
                  <p className="mt-2 text-gray-600 text-sm">We've sent you a confirmation link</p>
                </div>

                {/* Content */}
                <div className="space-y-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Account Created!</p>
                        <p className="text-sm text-green-700 mt-1">Confirmation sent to:</p>
                        <p className="text-sm font-semibold text-green-800 mt-1 break-all">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h3>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Check your email inbox and spam folder</li>
                      <li>Click the confirmation link</li>
                      <li>You'll be automatically logged in</li>
                    </ol>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowEmailConfirmation(false);
                      window.location.reload();
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 font-medium text-sm"
                  >
                    Got it, I'll check my email
                  </button>

                  {/* <button
                    onClick={() => {
                      setShowEmailConfirmation(false);
                      router.push('/');
                    }}
                    className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium border border-gray-200 text-sm"
                  >
                    Go to Home Page
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        )}
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
// import { Eye, EyeOff, Mail, Lock, User, UserPlus, X, CheckCircle } from 'lucide-react';

// import { signupSchema, SignupFormData } from '@/lib/validations';
// import { signup, executePendingAction } from '@/lib/auth';
// import { executePendingCartAction } from '@/lib/cart';
// import { Phone, MapPin } from 'lucide-react';

// export default function SignupPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState<string>('');
//   const [loginUrl, setLoginUrl] = useState('/login');
//   const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
//   const [userEmail, setUserEmail] = useState<string>('');
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Preserve return URL when navigating to login
//   useEffect(() => {
//     const returnUrl = searchParams.get('returnUrl');
//     if (returnUrl) {
//       setLoginUrl(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
//     }
//   }, [searchParams]);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SignupFormData>({
//     resolver: zodResolver(signupSchema),
//   });

//   const onSubmit = async (data: SignupFormData) => {
//     setIsLoading(true);
//     setApiError('');

//     try {
//       console.log('Signup form data:', data); // Debug log

//       // Use our new Supabase auth system
//       const result = await signup({
//         email: data.email,
//         password: data.password,
//         first_name: data.firstName,
//         last_name: data.lastName,
//         phone: data.phone || '',
//         address: data.address || ''
//       });

//       console.log('Signup result:', result); // Debug log

//       if (result.success) {
//         // Store the user's email for the confirmation popup
//         setUserEmail(data.email);

//         // Show email confirmation popup instead of redirecting
//         setShowEmailConfirmation(true);

//         // Note: We don't execute pending actions or navigate immediately
//         // The user will be redirected after email confirmation
//       } else {
//         setApiError(result.error || 'Signup failed');
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
//             <UserPlus className="h-6 w-6 text-green-600" />
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Or{' '}
//             <Link
//               href={loginUrl}
//               className="font-medium text-blue-600 hover:text-blue-500"
//             >
//               sign in to your existing account
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
//             {/* First Name Field */}
//             <div>
//               <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
//                 First Name
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('firstName')}
//                   type="text"
//                   autoComplete="given-name"
//                   className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
//                     errors.firstName ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
//                   placeholder="Enter your first name"
//                 />
//               </div>
//               {errors.firstName && (
//                 <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
//               )}
//             </div>

//             {/* Last Name Field */}
//             <div>
//               <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
//                 Last Name
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('lastName')}
//                   type="text"
//                   autoComplete="family-name"
//                   className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
//                     errors.lastName ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
//                   placeholder="Enter your last name"
//                 />
//               </div>
//               {errors.lastName && (
//                 <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
//               )}
//             </div>

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

//             {/* Phone Field */}
//             <div>
//               <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//                 Phone Number
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Phone className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('phone')}
//                   type="tel"
//                   autoComplete="tel"
//                   className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
//                     errors.phone ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
//                   placeholder="Enter your phone number"
//                 />
//               </div>
//               {errors.phone && (
//                 <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
//               )}
//             </div>

//             {/* Address Field */}
//             <div>
//               <label htmlFor="address" className="block text-sm font-medium text-gray-700">
//                 Address
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
//                   <MapPin className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <textarea
//                   {...register('address')}
//                   rows={2}
//                   autoComplete="street-address"
//                   className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
//                     errors.address ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm resize-none`}
//                   placeholder="Enter your full address"
//                 />
//               </div>
//               {errors.address && (
//                 <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
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
//                   autoComplete="new-password"
//                   className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${
//                     errors.password ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
//                   placeholder="Create a password"
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

//             {/* Confirm Password Field */}
//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//                 Confirm Password
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('confirmPassword')}
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   autoComplete="new-password"
//                   className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${
//                     errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
//                   } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
//                   placeholder="Confirm your password"
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//               {errors.confirmPassword && (
//                 <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
//               )}
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Creating account...
//                 </div>
//               ) : (
//                 'Create account'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Email Confirmation Popup */}
//       {showEmailConfirmation && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div
//             className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform transition-all duration-300 scale-100"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Close button */}
//             <button
//               onClick={() => setShowEmailConfirmation(false)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             {/* Header */}
//             <div className="text-center mb-6">
//               <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Mail className="w-10 h-10 text-white" />
//               </div>
//               <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
//               <p className="mt-2 text-gray-600">We've sent you a confirmation link</p>
//             </div>

//             {/* Content */}
//             <div className="space-y-4 mb-6">
//               <div className="bg-green-50 rounded-xl p-4 border border-green-200">
//                 <div className="flex items-start space-x-3">
//                   <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-sm font-medium text-green-800">Account Created Successfully!</p>
//                     <p className="text-sm text-green-700 mt-1">
//                       We've sent a confirmation email to:
//                     </p>
//                     <p className="text-sm font-semibold text-green-800 mt-1 break-all">
//                       {userEmail}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
//                 <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h3>
//                 <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
//                   <li>Check your email inbox (and spam folder)</li>
//                   <li>Click the confirmation link in the email</li>
//                   <li>You'll be automatically logged in after confirmation</li>
//                 </ol>
//               </div>

//               <div className="text-center">
//                 <p className="text-xs text-gray-500">
//                   Didn't receive the email? Check your spam folder or contact support.
//                 </p>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-3">
//               <button
//                 onClick={() => setShowEmailConfirmation(false)}
//                 className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
//               >
//                 Got it, I'll check my email
//               </button>

//               <button
//                 onClick={() => {
//                   setShowEmailConfirmation(false);
//                   router.push('/');
//                 }}
//                 className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
//               >
//                 Go to Home Page
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
