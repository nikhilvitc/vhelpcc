'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupabaseTest from '@/components/SupabaseTest';

export default function TestSupabasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <SupabaseTest />
      </div>
      
      <Footer />
    </div>
  );
}
