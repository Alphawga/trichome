'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserIcon, MailIcon, PhoneIcon, EditIcon, EyeIcon, ShieldIcon } from '../../components/ui/icons';

// Temporary interfaces for migration
interface AdminProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  department: string;
  joinDate: string;
  lastLogin: string;
  permissions: string[];
  status: 'Active' | 'Inactive';
  bio: string;
  location: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  twoFactorEnabled: boolean;
}

interface ActivityLog {
  id: number;
  action: string;
  module: string;
  timestamp: string;
  details: string;
}

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'activity' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - will be replaced with tRPC calls
  const mockProfile: AdminProfile = {
    id: 1,
    name: 'Admin User',
    email: 'admin@trichomes.com',
    phone: '+234 801 234 5678',
    avatar: 'https://picsum.photos/seed/admin/200/200',
    role: 'Super Admin',
    department: 'System Administration',
    joinDate: '2023-01-15',
    lastLogin: '2023-10-25 14:30',
    permissions: ['users.manage', 'products.manage', 'orders.manage', 'system.admin'],
    status: 'Active',
    bio: 'Experienced system administrator with expertise in e-commerce platforms and team management.',
    location: 'Lagos, Nigeria',
    timezone: 'WAT (UTC+1)',
    language: 'English',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    twoFactorEnabled: true
  };

  const mockActivityLog: ActivityLog[] = [
    {
      id: 1,
      action: 'Updated product',
      module: 'Products',
      timestamp: '2023-10-25 14:15',
      details: 'Modified product "La Roche-Posay Cleanser" pricing'
    },
    {
      id: 2,
      action: 'Created user',
      module: 'Users',
      timestamp: '2023-10-25 13:45',
      details: 'Added new customer service representative'
    },
    {
      id: 3,
      action: 'Processed order',
      module: 'Orders',
      timestamp: '2023-10-25 12:30',
      details: 'Updated order ORD-0123 status to shipped'
    },
    {
      id: 4,
      action: 'Generated report',
      module: 'Analytics',
      timestamp: '2023-10-25 11:20',
      details: 'Exported monthly sales report'
    },
    {
      id: 5,
      action: 'Updated permissions',
      module: 'Users',
      timestamp: '2023-10-24 16:45',
      details: 'Modified role permissions for Content Manager'
    }
  ];

  const handleSaveProfile = () => {
    console.log('Save profile changes');
    setIsEditing(false);
    // TODO: Implement profile update API call
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // TODO: Reset form to original values
  };

  const handleToggle2FA = () => {
    console.log('Toggle 2FA');
    // TODO: Implement 2FA toggle
  };

  const handleNotificationChange = (type: keyof AdminProfile['notifications']) => {
    console.log('Toggle notification:', type);
    // TODO: Update notification preferences
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={mockProfile.avatar}
                  alt={mockProfile.name}
                  fill
                  className="rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                  <EditIcon />
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900">{mockProfile.name}</h2>
              <p className="text-gray-600">{mockProfile.role}</p>
              <p className="text-sm text-gray-500 mb-4">{mockProfile.department}</p>

              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                mockProfile.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {mockProfile.status}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-sm">
                <MailIcon className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{mockProfile.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <PhoneIcon className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{mockProfile.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <UserIcon className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">Joined {mockProfile.joinDate}</span>
              </div>
              <div className="flex items-center text-sm">
                <EyeIcon className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">Last login: {mockProfile.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'security', label: 'Security' },
                { key: 'activity', label: 'Activity Log' },
                { key: 'settings', label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border p-6">
            {activeTab === 'overview' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <EditIcon />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={mockProfile.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{mockProfile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        defaultValue={mockProfile.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{mockProfile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        defaultValue={mockProfile.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{mockProfile.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={mockProfile.location}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{mockProfile.location}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      defaultValue={mockProfile.bio}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{mockProfile.bio}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Security Settings</h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        mockProfile.twoFactorEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {mockProfile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-4">Permissions</h4>
                    <div className="space-y-2">
                      {mockProfile.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center">
                          <ShieldIcon className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Change Password</h4>
                    <p className="text-sm text-gray-600 mb-4">Keep your account secure with a strong password</p>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>

                <div className="space-y-4">
                  {mockActivityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {activity.module}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Preferences</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Notifications</h4>
                    <div className="space-y-3">
                      {Object.entries(mockProfile.notifications).map(([type, enabled]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type} notifications</span>
                          <button
                            onClick={() => handleNotificationChange(type as keyof AdminProfile['notifications'])}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${
                              enabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                              enabled ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                        <option value="WAT">WAT (UTC+1)</option>
                        <option value="GMT">GMT (UTC+0)</option>
                        <option value="EST">EST (UTC-5)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}