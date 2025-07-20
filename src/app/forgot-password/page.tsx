'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, ArrowLeft, Key, CheckCircle, Loader2, Shield, RefreshCw } from 'lucide-react';

import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations';
import { authApi, handleApiError } from '@/lib/api';

// Enhanced Loading Screen Component (matching design)
const LoadingScreen = ({ message = "Sending reset link..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 flex flex-col items-center space-y-3 mx-4 max-w-sm w-full">
        <div className="relative">
          <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
          <div className="absolute inset-0 w-6 h-6 border-2 border-orange-200 rounded-full animate-pulse"></div>
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
const ForgotPasswordHeader = () => {
  return (
    <header className="bg-[#233d8e] relative overflow-hidden z-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[#233d8e]"></div>
      <div className="absolute top-0 right-0 w-48 h-20 opacity-20">
        <div className="absolute top-1 right-6 text-2xl">✨</div>
        <div className="absolute top-4 right-12 text-lg">🔑</div>
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

// Success Page Component
const SuccessPage = ({ submittedEmail, onTryAgain }) => {
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
              Check Your Email
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              We've sent a password reset link to help you regain access to your account securely.
            </p>
          </div>
          
          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-lg">Secure password reset process</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg">Protected by encryption</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-lg">Quick and easy recovery</span>
            </div>
          </div>
        </div>

        {/* Right Side - Instructions Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 opacity-100 rounded-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Sent!</h2>
                <p className="text-gray-600 text-sm">
                  Reset link sent to{' '}
                  <span className="font-semibold text-gray-900 break-all">{submittedEmail}</span>
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-3">Next Steps:</h3>
                <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                  <li>Check your email inbox and spam folder</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new secure password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onTryAgain}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium text-sm hover:scale-105 hover:shadow-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Didn't receive it? Try again
                </button>

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

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await authApi.forgotPassword(data);
      
      if (response.success) {
        setIsSuccess(true);
        setSubmittedEmail(data.email);
      } else {
        setApiError(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      setApiError(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setSubmittedEmail('');
    setApiError('');
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
        {/* <ForgotPasswordHeader /> */}
        
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
          {isSuccess ? (
            <SuccessPage submittedEmail={submittedEmail} onTryAgain={handleTryAgain} />
          ) : (
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-120px)]">
                
                {/* Left Side - Reset Password Info */}
                <div className="text-center lg:text-left space-y-6">
                  <div>
                    {/* <div className="mx-auto lg:mx-0 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
                      <Key className="h-8 w-8 text-white" />
                    </div> */}
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      Reset Your Password
                    </h1>
                    <p className="text-xl text-blue-100 mb-6">
                      No worries! Enter your email and we'll send you a secure link to reset your password and get you back into your account.
                    </p>
                  </div>
                  
                  {/* Features List */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-white">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="text-lg">Secure password recovery</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className="text-lg">Email verification required</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-lg">Quick and easy process</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Reset Form */}
                <div className="w-full max-w-md mx-auto">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                        <p className="text-gray-600 text-sm">Enter your email to reset your password</p>
                      </div>

                      {/* Error Message */}
                      {apiError && (
                        <div className="rounded-lg bg-red-50 p-3 mb-4 border border-red-200 animate-slideUp">
                          <div className="text-sm text-red-700 font-medium">{apiError}</div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Email Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                              {...register('email')}
                              type="email"
                              autoComplete="email"
                              className={`w-full pl-10 pr-4 py-3 border ${
                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-gray-400`}
                              placeholder="your.email@college.edu"
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600 animate-slideUp">{errors.email.message}</p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleSubmit(onSubmit)}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              Sending...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Mail className="w-5 h-5 mr-2" />
                              Send Reset Link
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

// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import Link from 'next/link';
// import { Mail, ArrowLeft, Key, CheckCircle } from 'lucide-react';

// import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations';
// import { authApi, handleApiError } from '@/lib/api';

// export default function ForgotPasswordPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState<string>('');
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [submittedEmail, setSubmittedEmail] = useState<string>('');

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ForgotPasswordFormData>({
//     resolver: zodResolver(forgotPasswordSchema),
//   });

//   const onSubmit = async (data: ForgotPasswordFormData) => {
//     setIsLoading(true);
//     setApiError('');

//     try {
//       const response = await authApi.forgotPassword(data);
      
//       if (response.success) {
//         setIsSuccess(true);
//         setSubmittedEmail(data.email);
//       } else {
//         setApiError(response.message || 'Failed to send reset email');
//       }
//     } catch (error) {
//       setApiError(handleApiError(error));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isSuccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div className="text-center">
//             <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
//               <CheckCircle className="h-6 w-6 text-green-600" />
//             </div>
//             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//               Check your email
//             </h2>
//             <p className="mt-2 text-center text-sm text-gray-600">
//               We've sent a password reset link to{' '}
//               <span className="font-medium text-gray-900">{submittedEmail}</span>
//             </p>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
//             <div className="text-sm text-blue-700">
//               <p className="font-medium mb-2">What's next?</p>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Check your email inbox (and spam folder)</li>
//                 <li>Click the reset link in the email</li>
//                 <li>Create a new password</li>
//               </ul>
//             </div>
//           </div>

//           <div className="text-center space-y-4">
//             <p className="text-sm text-gray-600">
//               Didn't receive the email?{' '}
//               <button
//                 onClick={() => {
//                   setIsSuccess(false);
//                   setSubmittedEmail('');
//                 }}
//                 className="font-medium text-blue-600 hover:text-blue-500"
//               >
//                 Try again
//               </button>
//             </p>
            
//             <Link
//               href="/login"
//               className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeft className="h-4 w-4 mr-1" />
//               Back to sign in
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100">
//             <Key className="h-6 w-6 text-orange-600" />
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Forgot your password?
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Enter your email address and we'll send you a link to reset your password.
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
//           {apiError && (
//             <div className="rounded-md bg-red-50 p-4">
//               <div className="text-sm text-red-700">{apiError}</div>
//             </div>
//           )}

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email address
//             </label>
//             <div className="mt-1 relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Mail className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 {...register('email')}
//                 type="email"
//                 autoComplete="email"
//                 className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
//                   errors.email ? 'border-red-300' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
//                 placeholder="Enter your email address"
//               />
//             </div>
//             {errors.email && (
//               <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
//             )}
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Sending reset link...
//                 </div>
//               ) : (
//                 'Send reset link'
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
