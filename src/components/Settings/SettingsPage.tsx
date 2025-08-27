import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/AppStore';
import { User, Trash2, Edit, Eye, Crown, Briefcase, Users, Plus, Search, Menu, Database } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../common/ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';
import UserModal from './UserModal';
import UserProfileView from './UserProfileView';
import GHLWebhookTest from './GHLWebhookTest';

interface SettingsPageProps {
  onToggleSidebar?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onToggleSidebar }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [_statusFilter, _setStatusFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const [isCleaningChats, setIsCleaningChats] = useState(false);
  const [isMergingChats, setIsMergingChats] = useState(false);
  const [isFixingFiles, setIsFixingFiles] = useState(false);

  const { 
    users, 
    loading,
    fetchUsers,
    addUser, 
    updateUser, 
    deleteUser,
    cleanOrphanedChats,
    mergeDuplicateChats 
  } = useAppStore();

  const { success, error } = useToast();

  // Custom confirmation modal
  const { confirmation, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  useEffect(() => {
    // Fetch initial data
    fetchUsers();
  }, [fetchUsers]);

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
      () => deleteUser(userId),
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
        const result = await updateUser(selectedUser.id, userData);
        if (result.success) {
          if (result.passwordUpdated) {
            success('User updated successfully! Password has been changed and saved to database.');
          } else {
            success('User updated successfully!');
          }
        }
      } else {
        // Add new user
        await addUser({
          ...userData,
          lastLogin: null
        });
        success('User created successfully!');
      }
      setShowUserModal(false);
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save user. Please try again.';
      error('Failed to save user', errorMessage);
    }
  };

  const handleViewUserProfile = (user: any) => {
    setSelectedUserForProfile(user);
    setShowUserProfile(true);
  };

  const handleBackFromUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUserForProfile(null);
  };

  const handleCleanOrphanedChats = async () => {
    showConfirmation(
      async () => {
        setIsCleaningChats(true);
        try {
          const deletedCount = await cleanOrphanedChats();
          success(`Successfully cleaned ${deletedCount} orphaned chat rooms.`);
        } catch (err) {
          console.error('Error cleaning orphaned chats:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to clean orphaned chats. Please try again.';
          error('Failed to clean orphaned chats', errorMessage);
        } finally {
          setIsCleaningChats(false);
        }
      },
      {
        title: 'Clean Orphaned Chats',
        message: 'Are you sure you want to clean orphaned chat rooms? This will delete chat rooms for clients that no longer exist.',
        confirmText: 'Clean',
        type: 'warning'
      }
    );
  };

  const handleMergeDuplicateChats = async () => {
    showConfirmation(
      async () => {
        setIsMergingChats(true);
        try {
          const mergedCount = await mergeDuplicateChats();
          success(`Successfully merged ${mergedCount} duplicate chat rooms.`);
        } catch (err) {
          console.error('Error merging duplicate chats:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to merge duplicate chats. Please try again.';
          error('Failed to merge duplicate chats', errorMessage);
        } finally {
          setIsMergingChats(false);
        }
      },
      {
        title: 'Merge Duplicate Chats',
        message: 'Are you sure you want to merge duplicate chat rooms? This will combine multiple chat rooms for the same client into one.',
        confirmText: 'Merge',
        type: 'warning'
      }
    );
  };

  const handleFixAllFiles = async () => {
    showConfirmation(
      async () => {
        setIsFixingFiles(true);
        try {
          const response = await fetch('/api/run-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              script: 'quick-fix-files',
              description: 'Fix ACL for all files'
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            const message = result.fixedCount 
              ? `Successfully fixed ACL for ${result.fixedCount} files!`
              : result.message;
            success(message);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to fix files');
          }
        } catch (err) {
          console.error('Error fixing files:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to fix files';
          error('Failed to fix files', errorMessage);
        } finally {
          setIsFixingFiles(false);
        }
      },
      {
        title: 'Fix All Files ACL',
        message: 'Are you sure you want to fix ACL for all files? This will make all uploaded files publicly accessible.',
        confirmText: 'Fix Files',
        type: 'warning'
      }
    );
  };

  const roleStats = {
    'Super Admin': users.filter(u => u.role === 'Super Admin').length,
    'Team': users.filter(u => u.role === 'Team').length,
    'Client Admin': users.filter(u => u.role === 'Client Admin').length,
    'Client Team': users.filter(u => u.role === 'Client Team').length
  };

  const totalUsers = users.length;

  if (showUserProfile && selectedUserForProfile) {
    return (
      <UserProfileView
        user={selectedUserForProfile}
        onBack={handleBackFromUserProfile}
      />
    );
  }

  if (loading.users) {
    return (
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1 lg:mt-2 text-sm lg:text-base">Manage system settings and user access</p>
        </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('webhook')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'webhook'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              GHL Webhook Test
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              System Maintenance
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Webhook Test Tab */}
          {activeTab === 'webhook' && (
            <GHLWebhookTest />
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 lg:p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Total Users</p>
                      <p className="text-xl lg:text-2xl font-bold text-purple-900 mt-1">{totalUsers}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 lg:p-6 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Super Admins</p>
                      <p className="text-xl lg:text-2xl font-bold text-red-900 mt-1">{roleStats['Super Admin']}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <Crown className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 lg:p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Team Members</p>
                      <p className="text-xl lg:text-2xl font-bold text-blue-900 mt-1">{roleStats['Team']}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 lg:p-6 border border-green-200 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Client Users</p>
                      <p className="text-xl lg:text-2xl font-bold text-green-900 mt-1">{roleStats['Client Admin'] + roleStats['Client Team']}</p>
                      <p className="text-xs text-green-600 mt-1">Admin: {roleStats['Client Admin']} | Team: {roleStats['Client Team']}</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters and Add User */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm lg:text-base"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 lg:px-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[120px] lg:min-w-[150px] transition-all duration-200 text-sm lg:text-base"
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
                  className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm text-sm lg:text-base"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add User</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto -mx-4 lg:mx-0">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm min-w-[200px]">User</th>
                        <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm min-w-[120px]">Role</th>
                        <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm min-w-[100px] hidden lg:table-cell">Created</th>
                        <th className="text-center py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm min-w-[100px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100">
                          <td className="py-3 lg:py-4 px-3 lg:px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-500 rounded-full flex items-center justify-center text-white font-medium text-sm lg:text-base">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900 text-sm lg:text-base">{user.name}</h4>
                                <p className="text-xs lg:text-sm text-slate-600 truncate max-w-[150px] lg:max-w-none">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 lg:py-4 px-3 lg:px-6">
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(user.role)}
                              <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                {user.role}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 lg:py-4 px-3 lg:px-6 hidden lg:table-cell">
                            <span className="text-xs lg:text-sm text-slate-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 lg:py-4 px-3 lg:px-6">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleViewUserProfile(user)}
                                className="p-1.5 lg:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1.5 lg:p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 group"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 lg:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* System Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* System Maintenance Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 lg:p-6 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 rounded-lg p-2">
                      <Database className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">System Maintenance</h2>
                      <p className="text-sm text-slate-600">Clean up and maintain system data</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Clean Orphaned Chat Rooms */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start space-x-4">
                        <div className="bg-yellow-100 rounded-full p-3 flex-shrink-0">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-yellow-800 mb-2">Clean Orphaned Chat Rooms</h3>
                          <p className="text-sm text-yellow-700 mb-4 leading-relaxed">
                            Remove chat rooms that belong to deleted clients. This helps keep your chat list clean and organized.
                          </p>
                          <button
                            onClick={handleCleanOrphanedChats}
                            disabled={isCleaningChats}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-2"
                          >
                            {isCleaningChats ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Cleaning...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Clean Orphaned Chats</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Merge Duplicate Chat Rooms */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-800 mb-2">Merge Duplicate Chat Rooms</h3>
                          <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                            Combine multiple chat rooms for the same client into one. All messages will be preserved and merged into the oldest chat room.
                          </p>
                          <button
                            onClick={handleMergeDuplicateChats}
                            disabled={isMergingChats}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-2"
                          >
                            {isMergingChats ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Merging...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <span>Merge Duplicate Chats</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fix All Files ACL */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-800 mb-2">Fix All Files ACL</h3>
                          <p className="text-sm text-green-700 mb-4 leading-relaxed">
                            Fix access permissions for all uploaded files. This makes files accessible if they show "access denied" errors.
                          </p>
                          <button
                            onClick={handleFixAllFiles}
                            disabled={isFixingFiles}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-2"
                          >
                            {isFixingFiles ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Fixing...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Fix All Files</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
          message={confirmation.message}
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