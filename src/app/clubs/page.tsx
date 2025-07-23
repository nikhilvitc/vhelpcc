'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Mail, Phone, Star, Clock, Filter, ExternalLink, Globe, Instagram, Linkedin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

interface Club {
  name: string;
  description: string;
  imageUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  isTechnical: boolean;
}

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch clubs data from JSON file
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/clubs.json');
        const clubsData: Club[] = await response.json();
        setClubs(clubsData);
      } catch (error) {
        console.error('Error fetching clubs data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Remove the mock data array since we're now using real data
  const categories = ['Technical', 'Non-Technical'];

  const getCategoryColor = (isTechnical: boolean) => {
    return isTechnical
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           (selectedCategory === 'Technical' && club.isTechnical) ||
                           (selectedCategory === 'Non-Technical' && !club.isTechnical);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#233d8e] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              className="flex items-center text-green-200 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              Student Clubs
            </h1>
            <p className="text-base text-green-100 max-w-3xl mx-auto">
              Join clubs and organizations to pursue your interests and meet like-minded students
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading clubs...</p>
          </div>
        )}

        {/* Clubs Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Club Logo */}
                <div className="flex items-center justify-center mb-4">
                  {club.imageUrl ? (
                    <div className="w-20 h-20 relative rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={`/${club.imageUrl}`}
                        alt={`${club.name} logo`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to default icon if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="w-10 h-10 text-green-600" />
                    </div>
                  )}
                </div>

                {/* Club Info */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{club.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(club.isTechnical)}`}>
                    {club.isTechnical ? 'Technical' : 'Non-Technical'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{club.description}</p>

                {/* Social Links */}
                <div className="flex justify-center space-x-3 mb-4">
                  {club.instagramUrl && (
                    <a
                      href={club.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {club.linkedinUrl && (
                    <a
                      href={club.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {club.websiteUrl && (
                    <a
                      href={club.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                      title="Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Action Button */}
                {/* <div className="mt-4">
                  <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium">
                    Learn More
                  </button>
                </div> */}
              </div>
            ))}
          </div>
        )}

        {!loading && filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* <Footer /> */}
    </div>
  );
}
