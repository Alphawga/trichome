'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SearchIcon, FilterIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, UserIcon, ShieldIcon } from '../../components/ui/icons';

// Temporary interfaces for migration
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  status: 'Active' | 'Inactive';
  createdDate: string;
  color: string;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  joinDate: string;
  permissions: string[];
}

interface UserRowProps {
  user: AdminUser;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

interface RoleCardProps {
  role: Role;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewUsers: (roleId: number) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onView, onEdit, onDelete }) => (
  <tr className="border-b last:border-0 hover:bg-gray-50">
    <td className="p-4 flex items-center">
      <div className="relative w-10 h-10 mr-4 flex-shrink-0">
        <Image
          src={user.avatar}
          alt={user.name}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div>
        <span className="font-medium text-gray-900">{user.name}</span>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </td>
    <td className="p-4">
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
        {user.role}
      </span>
    </td>
    <td className="p-4">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        user.status === 'Active' ? 'bg-green-100 text-green-800' :
        user.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {user.status}
      </span>
    </td>
    <td className="p-4 text-gray-600">{user.lastLogin}</td>
    <td className="p-4 text-gray-600">{user.joinDate}</td>
    <td className="p-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onView(user.id)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="View user details"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(user.id)}
          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
          title="Edit user"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete user"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete, onViewUsers }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: role.color }}></div>
        <div>
          <h3 className="font-semibold text-gray-900">{role.name}</h3>
          <p className="text-sm text-gray-500">{role.description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onEdit(role.id)}
          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
          title="Edit role"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(role.id)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete role"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>

    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Permissions ({role.permissions.length})</p>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {role.permissions.slice(0, 5).map((permission, index) => (
          <div key={index} className="flex items-center text-xs">
            <ShieldIcon className="w-3 h-3 text-gray-400 mr-2" />
            <span className="text-gray-600">{permission.name}</span>
          </div>
        ))}
        {role.permissions.length > 5 && (
          <p className="text-xs text-gray-500">+{role.permissions.length - 5} more permissions</p>
        )}
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center text-sm text-gray-600">
        <UserIcon className="w-4 h-4 mr-1" />
        <span>{role.userCount} users</span>
      </div>
      <button
        onClick={() => onViewUsers(role.id)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        View Users
      </button>
    </div>
  </div>
);

export default function AdminPermissionsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock data - will be replaced with tRPC calls
  const mockRoles: Role[] = [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access and control',
      userCount: 2,
      status: 'Active',
      createdDate: '2023-01-01',
      color: '#ef4444',
      permissions: [
        { id: 'users.create', name: 'Create Users', description: 'Can create new users', module: 'Users', actions: ['create'] },
        { id: 'users.read', name: 'View Users', description: 'Can view user data', module: 'Users', actions: ['read'] },
        { id: 'users.update', name: 'Update Users', description: 'Can modify users', module: 'Users', actions: ['update'] },
        { id: 'users.delete', name: 'Delete Users', description: 'Can remove users', module: 'Users', actions: ['delete'] },
        { id: 'products.manage', name: 'Manage Products', description: 'Full product management', module: 'Products', actions: ['create', 'read', 'update', 'delete'] },
        { id: 'orders.manage', name: 'Manage Orders', description: 'Full order management', module: 'Orders', actions: ['create', 'read', 'update', 'delete'] },
        { id: 'system.admin', name: 'System Administration', description: 'System settings access', module: 'System', actions: ['admin'] },
      ]
    },
    {
      id: 2,
      name: 'Store Manager',
      description: 'Manage products, orders, and customers',
      userCount: 5,
      status: 'Active',
      createdDate: '2023-02-15',
      color: '#3b82f6',
      permissions: [
        { id: 'products.manage', name: 'Manage Products', description: 'Full product management', module: 'Products', actions: ['create', 'read', 'update', 'delete'] },
        { id: 'orders.manage', name: 'Manage Orders', description: 'Full order management', module: 'Orders', actions: ['create', 'read', 'update', 'delete'] },
        { id: 'customers.read', name: 'View Customers', description: 'Can view customer data', module: 'Customers', actions: ['read'] },
        { id: 'customers.update', name: 'Update Customers', description: 'Can modify customer info', module: 'Customers', actions: ['update'] },
      ]
    },
    {
      id: 3,
      name: 'Customer Service',
      description: 'Handle customer inquiries and orders',
      userCount: 8,
      status: 'Active',
      createdDate: '2023-03-01',
      color: '#10b981',
      permissions: [
        { id: 'orders.read', name: 'View Orders', description: 'Can view order details', module: 'Orders', actions: ['read'] },
        { id: 'orders.update', name: 'Update Orders', description: 'Can modify order status', module: 'Orders', actions: ['update'] },
        { id: 'customers.read', name: 'View Customers', description: 'Can view customer data', module: 'Customers', actions: ['read'] },
        { id: 'customers.update', name: 'Update Customers', description: 'Can modify customer info', module: 'Customers', actions: ['update'] },
      ]
    },
    {
      id: 4,
      name: 'Content Manager',
      description: 'Manage website content and promotions',
      userCount: 3,
      status: 'Active',
      createdDate: '2023-04-10',
      color: '#f59e0b',
      permissions: [
        { id: 'products.read', name: 'View Products', description: 'Can view product data', module: 'Products', actions: ['read'] },
        { id: 'products.update', name: 'Update Products', description: 'Can modify product info', module: 'Products', actions: ['update'] },
        { id: 'promotions.manage', name: 'Manage Promotions', description: 'Full promotion management', module: 'Promotions', actions: ['create', 'read', 'update', 'delete'] },
      ]
    },
    {
      id: 5,
      name: 'Viewer',
      description: 'Read-only access to data',
      userCount: 12,
      status: 'Active',
      createdDate: '2023-05-20',
      color: '#6b7280',
      permissions: [
        { id: 'products.read', name: 'View Products', description: 'Can view product data', module: 'Products', actions: ['read'] },
        { id: 'orders.read', name: 'View Orders', description: 'Can view order details', module: 'Orders', actions: ['read'] },
        { id: 'customers.read', name: 'View Customers', description: 'Can view customer data', module: 'Customers', actions: ['read'] },
      ]
    }
  ];

  const mockUsers: AdminUser[] = Array.from({ length: 30 }, (_, i) => {
    const roles = ['Super Admin', 'Store Manager', 'Customer Service', 'Content Manager', 'Viewer'];
    const statuses: AdminUser['status'][] = ['Active', 'Inactive', 'Pending'];

    return {
      id: i + 1,
      name: `Admin User ${i + 1}`,
      email: `admin${i + 1}@trichomes.com`,
      avatar: `https://picsum.photos/seed/${i + 200}/80/80`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastLogin: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      joinDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      permissions: ['read', 'write', 'delete']
    };
  });

  const allPermissions = mockRoles.flatMap(role => role.permissions);
  const uniquePermissions = allPermissions.filter((permission, index, self) =>
    index === self.findIndex(p => p.id === permission.id)
  );

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddRole = () => {
    console.log('Add new role');
    // TODO: Navigate to role creation form
  };

  const handleAddUser = () => {
    console.log('Add new user');
    // TODO: Navigate to user creation form
  };

  const handleEditRole = (id: number) => {
    console.log('Edit role:', id);
    // TODO: Navigate to role edit form
  };

  const handleDeleteRole = (id: number) => {
    console.log('Delete role:', id);
    // TODO: Implement delete confirmation and action
  };

  const handleViewRoleUsers = (roleId: number) => {
    console.log('View users for role:', roleId);
    setActiveTab('users');
    // TODO: Filter users by role
  };

  const handleViewUser = (id: number) => {
    console.log('View user:', id);
    // TODO: Navigate to user detail view
  };

  const handleEditUser = (id: number) => {
    console.log('Edit user:', id);
    // TODO: Navigate to user edit form
  };

  const handleDeleteUser = (id: number) => {
    console.log('Delete user:', id);
    // TODO: Implement delete confirmation and action
  };

  const roles = ['All', ...Array.from(new Set(mockUsers.map(u => u.role)))];
  const statuses = ['All', 'Active', 'Inactive', 'Pending'];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Permissions & Roles</h1>
          <p className="text-gray-600">Manage user access and permissions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddRole}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Role
          </button>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'roles', label: 'Roles & Permissions', count: mockRoles.length },
            { key: 'users', label: 'Users', count: mockUsers.length },
            { key: 'permissions', label: 'All Permissions', count: uniquePermissions.length }
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
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'roles' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRoles.map(role => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={handleEditRole}
                onDelete={handleDeleteRole}
                onViewUsers={handleViewRoleUsers}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          {/* User Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role} Role</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status} Status</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-700">User</th>
                  <th className="p-4 font-semibold text-sm text-gray-700">Role</th>
                  <th className="p-4 font-semibold text-sm text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-700">Last Login</th>
                  <th className="p-4 font-semibold text-sm text-gray-700">Join Date</th>
                  <th className="p-4 font-semibold text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={handleViewUser}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No users found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div>
          <div className="bg-white rounded-lg border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Permissions</h3>
              <div className="space-y-6">
                {['Users', 'Products', 'Orders', 'Customers', 'Promotions', 'System'].map(module => {
                  const modulePermissions = uniquePermissions.filter(p => p.module === module);
                  return (
                    <div key={module} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900 mb-3">{module} Module</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modulePermissions.map(permission => (
                          <div key={permission.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center mb-2">
                              <ShieldIcon className="w-4 h-4 text-blue-500 mr-2" />
                              <span className="font-medium text-sm">{permission.name}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{permission.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {permission.actions.map(action => (
                                <span key={action} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {action}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}