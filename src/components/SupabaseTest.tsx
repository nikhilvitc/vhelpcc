'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/auth';

export default function SupabaseTest() {
  const [status, setStatus] = useState<string>('Checking...');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // Check environment variables
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        const envCheck = {
          hasUrl: !!url && url.includes('supabase.co'),
          hasKey: !!key && key.length > 20,
          url: url || 'Not set',
          keyLength: key?.length || 0
        };

        setDetails(prev => ({ ...prev, environment: envCheck }));

        if (!envCheck.hasUrl || !envCheck.hasKey) {
          setStatus('❌ Environment variables not configured');
          return;
        }

        // Test database connection
        const { data, error } = await supabase
          .from('restaurants')
          .select('count')
          .limit(1);

        if (error) {
          setStatus('❌ Database connection failed');
          setDetails(prev => ({ ...prev, dbError: error }));
          return;
        }

        // Test auth
        const { data: session } = await supabase.auth.getSession();
        
        setStatus('✅ Supabase connected successfully');
        setDetails(prev => ({ 
          ...prev, 
          database: 'Connected',
          session: session.session ? 'User logged in' : 'No active session'
        }));

      } catch (error) {
        setStatus('❌ Connection test failed');
        setDetails(prev => ({ ...prev, error: error }));
      }
    };

    testSupabase();
  }, []);

  const testSignup = async () => {
    try {
      setStatus('Testing signup...');
      
      const testEmail = `test-${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            phone: '+1234567890',
            address: '123 Test St',
            role: 'customer'
          }
        }
      });

      if (error) {
        setStatus('❌ Signup test failed');
        setDetails(prev => ({ ...prev, signupError: error }));
      } else {
        setStatus('✅ Signup test successful');
        setDetails(prev => ({ ...prev, signupResult: data }));
      }
    } catch (error) {
      setStatus('❌ Signup test error');
      setDetails(prev => ({ ...prev, signupError: error }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Status:</h3>
        <p className="text-lg">{status}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Details:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(details, null, 2)}
        </pre>
      </div>

      <div className="space-y-2">
        <button
          onClick={testSignup}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Signup
        </button>
        
        <div className="text-sm text-gray-600">
          <p><strong>Environment Variables:</strong></p>
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
          <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
        </div>
      </div>
    </div>
  );
}
