'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Auth callback params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            setStatus('error');
            setMessage('Failed to confirm email. Please try again.');
            return;
          }

          if (data.user) {
            console.log('User confirmed:', data.user);
            
            // Get user profile from database
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError || !profileData) {
              console.error('Error fetching user profile:', profileError);
              setStatus('error');
              setMessage('Account confirmed but failed to load profile. Please try logging in.');
              return;
            }

            // Save user data to localStorage
            const userData = {
              id: profileData.id,
              email: profileData.email,
              firstName: profileData.first_name,
              lastName: profileData.last_name,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              phone: profileData.phone,
              address: profileData.address,
              role: profileData.role,
              created_at: profileData.created_at,
              updated_at: profileData.updated_at
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');

            // Trigger auth change event
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }));

            setStatus('success');
            setMessage('Email confirmed successfully! You are now logged in.');

            // Execute any pending actions
            try {
              const pendingAction = sessionStorage.getItem('pendingAction');
              const returnUrl = sessionStorage.getItem('returnUrl');
              const serviceContext = sessionStorage.getItem('serviceContext');

              // Clean up session storage
              sessionStorage.removeItem('pendingAction');
              sessionStorage.removeItem('returnUrl');
              sessionStorage.removeItem('serviceContext');

              // Determine where to redirect
              let redirectUrl = '/';
              
              if (returnUrl) {
                redirectUrl = returnUrl;
              } else if (serviceContext) {
                if (serviceContext === 'repair') {
                  redirectUrl = '/repair';
                } else if (serviceContext === 'food') {
                  redirectUrl = '/food';
                }
              }

              // Redirect after a short delay
              setTimeout(() => {
                router.push(redirectUrl);
              }, 2000);

            } catch (actionError) {
              console.error('Error executing pending actions:', actionError);
              // Still redirect to home even if pending actions fail
              setTimeout(() => {
                router.push('/');
              }, 2000);
            }
          }
        } else {
          console.error('Invalid callback parameters');
          setStatus('error');
          setMessage('Invalid confirmation link. Please try signing up again.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during email confirmation. Please try again.');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Confirming your email...
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please wait while we verify your account.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Email Confirmed!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {message}
              </p>
              <p className="mt-4 text-center text-sm text-gray-500">
                Redirecting you to the app...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Confirmation Failed
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Signing Up Again
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
