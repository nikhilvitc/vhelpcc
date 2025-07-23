'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft, Shield, Loader2, Key, RefreshCw } from 'lucide-react';

import { resetPasswordSchema } from '@/lib/validations';
import { authApi, handleApiError } from '@/lib/api';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Enhanced Loading Screen Component (matching design)
const LoadingScreen = ({ message = "Resetting your password..." }) => {
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

// Header Component (matching the design)
const ResetPasswordHeader = () => {
  return (
    <header className="bg-[#233d8e] relative overflow-hidden z-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[#233d8e]"></div>
      <div className="absolute top-0 right-0 w-48 h-20 opacity-20">
        <div className="absolute top-1 right-6 text-2xl">✨</div>
        <div className="absolute top-4 right-12 text-lg">🔒</div>
        <div className="absolute top-2 right-2 text-xl">🛡️</div>
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
              href="/login"
              className="px-3 py-1.5 text-white hover:bg-white/20 backdrop-blur-sm font-medium transition-all duration-300 rounded-lg border border-white/20 hover:border-white/40 text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

// Invalid Token Page Component
const InvalidTokenPage = () => {
  return (
    <div className="w-full max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-120px)]">
        
        {/* Left Side - Error Message */}
        <div className="text-center lg:text-left space-y-6">
          <div>
            <div className="mx-auto lg:mx-0 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-600 shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Invalid Reset Link
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              This password reset link is invalid or has expired. Don't worry, you can request a new one easily.
            </p>
          </div>
          
          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-lg">Link may have expired</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-lg">Easy to request a new link</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg">Secure recovery process</span>
            </div>
          </div>
        </div>

        {/* Right Side - Action Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 opacity-100 rounded-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
                <p className="text-gray-600 text-sm">
                  The password reset link is no longer valid
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 font-medium text-sm hover:scale-105 hover:shadow-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request New Reset Link
                </Link>

                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium border-2 border-gray-200 hover:border-gray-300 text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Page Component
const SuccessPage = () => {
  return (
    <div className="w-full max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-120px)]">
        
        {/* Left Side - Success Message */}
        <div className="text-center lg:text-left space-y-6">
          <div>
            <div className="mx-auto lg:mx-0 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Password Reset Complete
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Your password has been successfully reset! You can now sign in with your new password and continue using all campus services.
            </p>
          </div>
          
          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-lg">Password successfully updated</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg">Account is now secure</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-lg">Ready to access your account</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 opacity-100 rounded-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h2>
                <p className="text-gray-600 text-sm">
                  Your password has been reset successfully
                </p>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 font-medium text-sm hover:scale-105 hover:shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Sign In to Your Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema.omit({ token: true })),
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setApiError('Reset token is missing');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authApi.resetPassword(token, data.password);
      
      if (response.success) {
        setIsSuccess(true);
      } else {
        setApiError(response.message || 'Failed to reset password');
      }
    } catch (error) {
      setApiError(handleApiError(error));
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
        {/* <ResetPasswordHeader /> */}
        
        {/* Background Images */}
        <div className="absolute left-4 top-20 w-16 h-16 opacity-30 hidden lg:block z-0">
          <div className="text-lg">🔒</div>
          <div className="absolute top-2 left-2 text-sm">🔑</div>
          <div className="absolute top-4 left-4 text-xs">🛡️</div>
        </div>

        <div className="absolute right-4 top-20 w-16 h-16 opacity-30 hidden lg:block z-0">
          <div className="absolute top-0 right-2 text-sm">🔐</div>
          <div className="absolute top-2 right-4 text-xs">💫</div>
          <div className="absolute bottom-1 right-0 text-lg">⚡</div>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative z-10 flex items-center justify-center px-4 py-4">
          {/* Show loading state while checking token */}
          {isValidToken === null ? (
            <LoadingScreen message="Validating reset link..." />
          ) : isValidToken === false ? (
            <InvalidTokenPage />
          ) : isSuccess ? (
            <SuccessPage />
          ) : (
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-120px)]">
                
                {/* Left Side - Reset Password Info */}
                <div className="text-center lg:text-left space-y-6">
                  <div>
                    <div className="mx-auto lg:mx-0 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      Create New Password
                    </h1>
                    <p className="text-xl text-blue-100 mb-6">
                      Choose a strong, secure password that you'll remember. Your new password will protect your campus account and all services.
                    </p>
                  </div>
                  
                  {/* Features List */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-white">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="text-lg">Secure password protection</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <span className="text-lg">Encrypted and private</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-lg">Instant account access</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Reset Form */}
                <div className="w-full max-w-md mx-auto">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                        <p className="text-gray-600 text-sm">Enter your new password below</p>
                      </div>

                      {/* Error Message */}
                      {apiError && (
                        <div className="rounded-lg bg-red-50 p-3 mb-4 border border-red-200 animate-slideUp">
                          <div className="text-sm text-red-700 font-medium">{apiError}</div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Password Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                              {...register('password')}
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              className={`w-full pl-10 pr-12 py-3 border ${
                                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400`}
                              placeholder="Enter your new password"
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

                        {/* Confirm Password Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                              {...register('confirmPassword')}
                              type={showConfirmPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              className={`w-full pl-10 pr-12 py-3 border ${
                                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400`}
                              placeholder="Confirm your new password"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600 animate-slideUp">{errors.confirmPassword.message}</p>
                          )}
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
                              Resetting...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Lock className="w-5 h-5 mr-2" />
                              Reset Password
                            </div>
                          )}
                        </button>

                        {/* Back to Login Link */}
                        <div className="text-center pt-4 border-t border-gray-200">
                          <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Sign In
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
// import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

// import { resetPasswordSchema } from '@/lib/validations';
// import { authApi, handleApiError } from '@/lib/api';

// interface ResetPasswordFormData {
//   password: string;
//   confirmPassword: string;
// }

// export default function ResetPasswordPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState<string>('');
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [token, setToken] = useState<string>('');
//   const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ResetPasswordFormData>({
//     resolver: zodResolver(resetPasswordSchema.omit({ token: true })),
//   });

//   useEffect(() => {
//     const tokenFromUrl = searchParams.get('token');
//     if (tokenFromUrl) {
//       setToken(tokenFromUrl);
//       setIsValidToken(true);
//     } else {
//       setIsValidToken(false);
//     }
//   }, [searchParams]);

//   const onSubmit = async (data: ResetPasswordFormData) => {
//     if (!token) {
//       setApiError('Reset token is missing');
//       return;
//     }

//     setIsLoading(true);
//     setApiError('');

//     try {
//       const response = await authApi.resetPassword(token, data.password);
      
//       if (response.success) {
//         setIsSuccess(true);
//       } else {
//         setApiError(response.message || 'Failed to reset password');
//       }
//     } catch (error) {
//       setApiError(handleApiError(error));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Show loading state while checking token
//   if (isValidToken === null) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   // Show error if no token
//   if (isValidToken === false) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div className="text-center">
//             <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
//               <AlertCircle className="h-6 w-6 text-red-600" />
//             </div>
//             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//               Invalid Reset Link
//             </h2>
//             <p className="mt-2 text-center text-sm text-gray-600">
//               The password reset link is invalid or has expired.
//             </p>
//           </div>

//           <div className="text-center space-y-4">
//             <Link
//               href="/forgot-password"
//               className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
//             >
//               Request a new reset link
//             </Link>
            
//             <div>
//               <Link
//                 href="/login"
//                 className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
//               >
//                 <ArrowLeft className="h-4 w-4 mr-1" />
//                 Back to sign in
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show success message
//   if (isSuccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div className="text-center">
//             <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
//               <CheckCircle className="h-6 w-6 text-green-600" />
//             </div>
//             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//               Password Reset Successful
//             </h2>
//             <p className="mt-2 text-center text-sm text-gray-600">
//               Your password has been successfully reset. You can now sign in with your new password.
//             </p>
//           </div>

//           <div className="text-center">
//             <Link
//               href="/login"
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               Sign in to your account
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show reset password form
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
//             <Lock className="h-6 w-6 text-blue-600" />
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Reset your password
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Enter your new password below
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
//           {apiError && (
//             <div className="rounded-md bg-red-50 p-4">
//               <div className="text-sm text-red-700">{apiError}</div>
//             </div>
//           )}

//           <div className="space-y-4">
//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 New Password
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
//                   placeholder="Enter your new password"
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
//                 Confirm New Password
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
//                   placeholder="Confirm your new password"
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
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Resetting password...
//                 </div>
//               ) : (
//                 'Reset password'
//               )}
//             </button>
//           </div>

//           <div className="text-center">
//             <Link
//               href="/login"
//               className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeft className="h-4 w-4 mr-1" />
//               Back to sign in
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
