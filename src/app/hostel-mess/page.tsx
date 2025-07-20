'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, Users, Calendar, MapPin, Phone, Mail, Clock, Star, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface LaundrySchedule {
  date: string;
  roomRange: string;
}

interface HostelBlock {
  id: string;
  name: string;
  description: string;
  laundrySchedule: LaundrySchedule[];
  month: string;
}

interface WeeklyMenu {
  day: string;
  menu: string;
}

interface MessHall {
  id: string;
  name: string;
  description: string;
  month: string;
  weeklyMenu: WeeklyMenu[];
}

export default function HostelMessPage() {
  const [activeTab, setActiveTab] = useState('hostel');
  const [selectedBlock, setSelectedBlock] = useState<HostelBlock | null>(null);
  const [showLaundryPopup, setShowLaundryPopup] = useState(false);
  const [hostelBlocks, setHostelBlocks] = useState<HostelBlock[]>([]);
  const [selectedMess, setSelectedMess] = useState<MessHall | null>(null);
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [messHalls, setMessHalls] = useState<MessHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [messLoading, setMessLoading] = useState(true);

  // Fetch hostel blocks data from JSON file
  useEffect(() => {
    const fetchHostelData = async () => {
      try {
        const response = await fetch('/laundry-schedule.json');
        const data = await response.json();
        setHostelBlocks(data.hostelBlocks);
      } catch (error) {
        console.error('Error fetching hostel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHostelData();
  }, []);

  // Fetch mess halls data from JSON file
  useEffect(() => {
    const fetchMessData = async () => {
      try {
        const response = await fetch('/mess-menu.json');
        const data = await response.json();
        setMessHalls(data.messHalls);
      } catch (error) {
        console.error('Error fetching mess data:', error);
      } finally {
        setMessLoading(false);
      }
    };

    fetchMessData();
  }, []);

  // Handler functions
  const handleBlockClick = (block: HostelBlock) => {
    setSelectedBlock(block);
    setShowLaundryPopup(true);
  };

  const closeLaundryPopup = () => {
    setShowLaundryPopup(false);
    setSelectedBlock(null);
  };

  const handleMessClick = (mess: MessHall) => {
    setSelectedMess(mess);
    setShowMenuPopup(true);
  };

  const closeMenuPopup = () => {
    setShowMenuPopup(false);
    setSelectedMess(null);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#233d8e] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              className="flex items-center text-white hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              Hostel & Mess Services
            </h1>
            <p className="text-base text-white max-w-3xl mx-auto">
              Find comfortable accommodation and quality dining services for students
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('hostel')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'hostel'
                  ? 'bg-[#233d8e] text-white'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Home className="w-5 h-5 inline mr-2" />
              Hostel Services
            </button>
            <button
              onClick={() => setActiveTab('mess')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'mess'
                  ? 'bg-[#233d8e] text-white'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Mess Services
            </button>
          </div>
        </div>

        {/* Hostel Services */}
        {activeTab === 'hostel' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hostel Blocks</h2>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading hostel blocks...</p>
              </div>
            )}

            {/* Hostel Blocks Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostelBlocks.map((block) => (
                <div
                  key={block.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleBlockClick(block)}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Home className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{block.name}</h3>
                    {/* <p className="text-gray-600 text-sm mb-4">{block.description}</p> */}

                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-center text-blue-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">View Laundry Schedule</span>
                      </div>
                    </div>

                    <button className="w-full bg-[#233d8e] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                      Check Schedule
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )}

            {/* No Data State */}
            {!loading && hostelBlocks.length === 0 && (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hostel blocks found</h3>
                <p className="text-gray-500">Unable to load hostel block data.</p>
              </div>
            )}
          </div>
        )}

        {/* Mess Services */}
        {activeTab === 'mess' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mess Halls</h2>

            {/* Loading State */}
            {messLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading mess halls...</p>
              </div>
            )}

            {/* Mess Halls Grid */}
            {!messLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {messHalls.map((mess) => (
                  <div
                    key={mess.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => handleMessClick(mess)}
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{mess.name}</h3>
                      {/* <p className="text-gray-600 text-sm mb-4">{mess.description}</p> */}

                      {/* <div className="bg-[#233d8e] rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-center text-white">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">View Weekly Menu</span>
                        </div>
                      </div> */}

                      <button className="w-full bg-[#233d8e] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                        Check Menu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Data State */}
            {!messLoading && messHalls.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mess halls found</h3>
                <p className="text-gray-500">Unable to load mess hall data.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Laundry Schedule Popup */}
      {showLaundryPopup && selectedBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeLaundryPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedBlock.name} - Laundry Schedule
              </h2>
              <p className="text-gray-600">{selectedBlock.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center bg-blue-100 py-2 rounded-lg">
                {selectedBlock.month}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-500 text-white">
                      <th className="border border-blue-600 px-4 py-2 text-left font-medium">Date</th>
                      <th className="border border-blue-600 px-4 py-2 text-left font-medium">Room Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBlock.laundrySchedule.map((schedule, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">
                          {schedule.date}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-gray-700">
                          {schedule.roomRange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Please check your room number and follow the schedule accordingly.
                  Laundry services are available from 8:00 AM to 6:00 PM on scheduled days.
                </p>
              </div>

              <button
                onClick={closeLaundryPopup}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Popup */}
      {showMenuPopup && selectedMess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeMenuPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedMess.name} - Weekly Menu
              </h2>
              <p className="text-gray-600">{selectedMess.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center bg-green-100 py-2 rounded-lg">
                {selectedMess.month}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-500 text-white">
                      <th className="border border-green-600 px-4 py-2 text-left font-medium">Day</th>
                      <th className="border border-green-600 px-4 py-2 text-left font-medium">Menu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMess.weeklyMenu.map((dayMenu, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">
                          {dayMenu.day}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-gray-700">
                          {dayMenu.menu}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 text-sm">
                  <strong>Note:</strong> Menu items may vary based on availability.
                  Please check with mess staff for any dietary restrictions or special requirements.
                </p>
              </div>

              <button
                onClick={closeMenuPopup}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
