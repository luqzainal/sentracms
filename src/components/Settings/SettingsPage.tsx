import React, { useState, useEffect } from 'react';
import { Users, Settings, Search, Plus, Edit, Trash2, Crown, Briefcase, User } from 'lucide-react';
import { usersService } from '../../services/database';
import UserModal from './UserModal';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';
import GHLWebhookTest from './GHLWebhookTest';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { success, error } = useToast();
  const { confirmation, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const result = await usersService.getAll();
      if (result.success) {
        setUsers(result.data || []);
      } else {
        error('Failed to load users');
      }
    } catch (err) {
      error('Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'Team':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'Client Admin':
        return <User className="w-4 h-4 text-green-600" />;
      case 'Client Team':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Team':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Client Admin':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Client Team':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    showConfirmation(
      () => usersService.delete(userId),
      {
        title: 'Delete User',
        message: 'Are you sure you want to delete this user?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (selectedUser) {
        // Update existing user
        const result = await usersService.update(selectedUser.id, userData);
        if (result.success) {
          if (result.passwordUpdated) {
            success('User updated successfully! Password has been changed and saved to database.');
          } else {
            success('User updated successfully!');
          }
          setShowUserModal(false);
          loadUsers();
        } else {
          error(result.error || 'Failed to update user');
        }
      } else {
        // Add new user
        const result = await usersService.create(userData);
        if (result.success) {
          success('User added successfully!');
          setShowUserModal(false);
          loadUsers();
        } else {
          error(result.error || 'Failed to add user');
        }
      }
    } catch (err) {
      error('Error saving user');
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-sm text-slate-600 mt-1">Manage system settings and user accounts</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-4 lg:px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('webhook')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'webhook'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>GHL Webhook Test</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>System Maintenance</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Team">Team</option>
                    <option value="Client Admin">Client Admin</option>
                    <option value="Client Team">Client Team</option>
                  </select>
                </div>
                <button
                  onClick={handleAddUser}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 lg:px-6 py-4 text-center text-slate-500">
                            Loading users...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 lg:px-6 py-4 text-center text-slate-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50">
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10">
                                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="w-4 h-4 lg:w-5 lg:h-5 text-slate-500" />
                                  </div>
                                </div>
                                <div className="ml-3 lg:ml-4">
                                  <div className="text-sm font-medium text-slate-900">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(user.role)}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                  {user.role}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status || 'Active')}`}>
                                {user.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleEditUser(user)}
                                  className="p-1.5 lg:p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                >
                                  <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1.5 lg:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* GHL Webhook Test Tab */}
          {activeTab === 'webhook' && (
            <div className="space-y-6">
              <GHLWebhookTest />
            </div>
          )}

          {/* System Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* System Maintenance content would go here */}
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onSave={handleSaveUser}
        />
      )}

      {/* Toast Notification */}
      {/* The useToast hook handles its own rendering */}

      {/* Custom Confirmation Modal */}
      {confirmation && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          onClose={hideConfirmation}
          onConfirm={handleConfirm}
          title={confirmation.title || 'Confirm Action'}
          message={confirmation.message || 'Are you sure?'}
          confirmText={confirmation.confirmText}
          cancelText={confirmation.cancelText}
          type={confirmation.type}
          icon={confirmation.icon}
        />
      )}
    </div>
  );
};

export default SettingsPage;