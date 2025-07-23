'use client';

import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Send, Search, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import Link from 'next/link';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  submittedDate: string;
  lastUpdated: string;
  submittedBy: string;
}

export default function ComplaintPortalPage() {
  const [activeTab, setActiveTab] = useState('submit');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock complaints data
  const complaints: Complaint[] = [
    {
      id: 'CP001',
      title: 'Poor food quality in Central Mess',
      description: 'The food served yesterday was undercooked and had a bad taste.',
      category: 'Food Quality',
      status: 'in-progress',
      priority: 'high',
      submittedDate: '2024-01-15',
      lastUpdated: '2024-01-16',
      submittedBy: 'John Doe'
    },
    {
      id: 'CP002',
      title: 'Hostel WiFi connectivity issues',
      description: 'WiFi has been down for 3 days in Hostel A, Block 2.',
      category: 'Infrastructure',
      status: 'resolved',
      priority: 'medium',
      submittedDate: '2024-01-10',
      lastUpdated: '2024-01-14',
      submittedBy: 'Jane Smith'
    },
    {
      id: 'CP003',
      title: 'Unhygienic conditions in mess hall',
      description: 'Tables and floors are not properly cleaned after meals.',
      category: 'Hygiene',
      status: 'pending',
      priority: 'high',
      submittedDate: '2024-01-18',
      lastUpdated: '2024-01-18',
      submittedBy: 'Mike Johnson'
    }
  ];

  const categories = [
    'Food Quality',
    'Hygiene',
    'Infrastructure',
    'Service',
    'Billing',
    'Staff Behavior',
    'Other'
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Complaint submitted:', formData);
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium'
    });
    alert('Complaint submitted successfully!');
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              className="flex items-center text-red-200 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Complaint Portal
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Submit and track your complaints about food services, hostel facilities, and more
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'submit'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Send className="w-5 h-5 inline mr-2" />
              Submit Complaint
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'track'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Track Complaints
            </button>
          </div>
        </div>

        {/* Submit Complaint Form */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a New Complaint</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Complaint Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Brief description of your complaint"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Please provide detailed information about your complaint..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 transition-colors font-medium"
                >
                  Submit Complaint
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Track Complaints */}
        {activeTab === 'track' && (
          <div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                        <span className="text-sm text-gray-500">#{complaint.id}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{complaint.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {complaint.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated: {complaint.lastUpdated}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredComplaints.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2023 Complaint Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
