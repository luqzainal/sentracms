import React from 'react';
import { ArrowLeft, User, Mail, Shield, Building, Calendar, Phone, MapPin, Crown, Briefcase, UserCheck } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { getInitials } from '../../utils/avatarUtils';

interface UserProfileViewProps {
  user: any;
  onBack: () => void;
}

// Color palette for avatars
const AVATAR_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-yellow-500', text: 'text-white' },
  { bg: 'bg-red-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
  { bg: 'bg-cyan-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
  { bg: 'bg-lime-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
];

function getColorForName(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onBack }) => {
  const { clients } = useAppStore();
  
  // Find associated client if user is a client role
  const associatedClient = user.clientId ? clients.find(c => c.id === user.clientId) : null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return <Crown className="w-6 h-6 text-yellow-600" />;
      case 'Team':
        return <Briefcase className="w-6 h-6 text-blue-600" />;
      case 'Client Admin':
        return <UserCheck className="w-6 h-6 text-green-600" />;
      case 'Client Team':
        return <User className="w-6 h-6 text-green-600" />;
      default:
        return <User className="w-6 h-6 text-gray-600" />;
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

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Never') return 'Never';
    return new Date(dateString).toLocaleDateString('ms-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">User Profile</h1>
              <p className="text-sm text-slate-600">View user information and details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className={`w-20 h-20 ${getColorForName(user.name).bg} rounded-full flex items-center justify-center ${getColorForName(user.name).text} font-bold text-2xl`}>
              {getInitials(user.name)}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                {getRoleIcon(user.role)}
                <span>
                  {user.role === 'Super Admin' && 'Full system access with administrative privileges'}
                  {user.role === 'Team' && 'Team member with standard access permissions'}
                  {user.role === 'Client Admin' && 'Client administrator with full organization access'}
                  {user.role === 'Client Team' && 'Client team member with limited access'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Contact Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">{user.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${user.status === 'Active' ? 'text-green-800' : 'text-red-800'}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Association (if applicable) */}
        {associatedClient && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <Building className="w-5 h-5 text-green-600" />
              <span>Associated Client</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <span className="text-slate-900 font-medium">{associatedClient.businessName}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                <span className="text-slate-900">{associatedClient.name}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <span className="text-slate-900">{associatedClient.email}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <span className="text-slate-900">{associatedClient.phone || 'Not provided'}</span>
              </div>
              {associatedClient.company && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <span className="text-slate-900">{associatedClient.company}</span>
                </div>
              )}
              {associatedClient.address && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <span className="text-slate-900">{associatedClient.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Account Details</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Login</label>
              <span className="text-slate-900">
                {formatDate(user.lastLogin)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Created</label>
              <span className="text-slate-900">
                {formatDate(user.createdAt)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Updated</label>
              <span className="text-slate-900">
                {formatDate(user.updatedAt)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
              <span className="text-slate-900 font-mono text-sm">{user.id}</span>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span>Permissions</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.permissions && user.permissions.length > 0 ? (
              user.permissions.map((permission: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                >
                  {permission}
                </span>
              ))
            ) : (
              <span className="text-slate-500 italic">No specific permissions assigned</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView; 