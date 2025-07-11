import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Eye, EyeOff, Crown, Briefcase, UserCheck } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  clientId?: number;
}

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: (userData: any) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const { clients } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Team' as 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team',
    clientId: '',
  });

  const [portalAccess, setPortalAccess] = useState({
    username: '',
    portalPassword: '',
    confirmPortalPassword: '',
    showPortalPassword: false,
    showConfirmPortalPassword: false,
    hasStoredPassword: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        clientId: user.clientId ? user.clientId.toString() : '',
      });
      
      // Initialize portal access for client users
      if (user.role === 'Client Admin' || user.role === 'Client Team') {
        setPortalAccess({
          username: user.email, // Default to email as username
          portalPassword: '',
          confirmPortalPassword: '',
          showPortalPassword: false,
          showConfirmPortalPassword: false,
          hasStoredPassword: true // Assume existing users have stored passwords
        });
      }
    } else {
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        role: 'Team',
        clientId: '',
      });
      
      setPortalAccess({
        username: '',
        portalPassword: '',
        confirmPortalPassword: '',
        showPortalPassword: false,
        showConfirmPortalPassword: false,
        hasStoredPassword: false
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear client selection when role changes to non-client roles
    if (name === 'role' && !['Client Admin', 'Client Team'].includes(value)) {
      setFormData(prev => ({
        ...prev,
        clientId: ''
      }));
      setPortalAccess(prev => ({
        ...prev,
        username: '',
        portalPassword: '',
        confirmPortalPassword: '',
        hasStoredPassword: false
      }));
    } else if (name === 'role' && ['Client Admin', 'Client Team'].includes(value)) {
      setPortalAccess(prev => ({
        ...prev,
        username: formData.email || ''
      }));
    }
    
    // Update portal username when email changes for client users
    if (name === 'email' && ['Client Admin', 'Client Team'].includes(formData.role)) {
      setPortalAccess(prev => ({
        ...prev,
        username: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePortalAccessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPortalAccess(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Validate client selection for client roles
    if (['Client Admin', 'Client Team'].includes(formData.role) && !formData.clientId) {
      newErrors.clientId = 'Client selection is required for this role';
    }
    // Validate portal access for client users
    if (['Client Admin', 'Client Team'].includes(formData.role)) {
      if (!portalAccess.username.trim()) {
        newErrors.portalUsername = 'Portal username is required';
      }
      
      if (portalAccess.portalPassword) {
        if (portalAccess.portalPassword.length < 6) {
          newErrors.portalPassword = 'Portal password must be at least 6 characters';
        }
        if (portalAccess.portalPassword !== portalAccess.confirmPortalPassword) {
          newErrors.confirmPortalPassword = 'Portal passwords do not match';
        }
      } else if (!user) {
        // Require portal password for new client users
        newErrors.portalPassword = 'Portal password is required for new client users';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const permissions = getPermissionsByRole(formData.role);
    
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'Active', // Default status for all users
      permissions
    };

    // Include clientId for client roles
    if (['Client Admin', 'Client Team'].includes(formData.role) && formData.clientId) {
      (userData as any).clientId = parseInt(formData.clientId);
    }
    // Include portal access data for client users
    if (['Client Admin', 'Client Team'].includes(formData.role)) {
      (userData as any).portalAccess = {
        username: portalAccess.username,
        password: portalAccess.portalPassword || undefined,
        hasStoredPassword: portalAccess.hasStoredPassword || !!portalAccess.portalPassword
      };
    }
    onSave(userData);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPortalAccess(prev => ({
      ...prev,
      portalPassword: password,
      confirmPortalPassword: password
    }));
  };

  const handleResetPassword = () => {
    setPortalAccess(prev => ({
      ...prev,
      portalPassword: '',
      confirmPortalPassword: '',
      hasStoredPassword: false
    }));
  };

  const getPermissionsByRole = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return ['all'];
      case 'Team':
        return ['clients', 'calendar', 'chat', 'reports', 'dashboard'];
      case 'Client':
        return ['client_dashboard', 'client_profile', 'client_messages'];
      default:
        return [];
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'Team':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'Client Admin':
        return <User className="w-5 h-5 text-green-600" />;
      case 'Client Team':
        return <User className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'Full system access including user management and security settings';
      case 'Team':
        return 'Access to all features except user management and security settings';
      case 'Client Admin':
        return 'Client portal access with administrative privileges for their organization';
      case 'Client Team':
        return 'Limited access to client dashboard, profile, and messages';
      default:
        return '';
    }
  };

  const isClientRole = ['Client Admin', 'Client Team'].includes(formData.role);
  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Role and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Role & Access</h3>
            
            <div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all duration-200"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Team">Team</option>
                    <option value="Client Admin">Client Admin</option>
                    <option value="Client Team">Client Team</option>
                  </select>
                </div>
              </div>
            </div>
              {/* Client Selection - Only show for Client Admin and Client Team roles */}
              {isClientRole && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Associated Client *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all duration-200 ${
                        errors.clientId ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.businessName} ({client.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.clientId && <p className="text-red-600 text-sm mt-1">{errors.clientId}</p>}
                  <p className="text-xs text-slate-500 mt-1">
                    This user will only have access to the selected client's data
                  </p>
                </div>
              )}

            {/* Role Description */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start space-x-3">
                {getRoleIcon(formData.role)}
                <div>
                  <h4 className="font-medium text-slate-900">{formData.role} Permissions</h4>
                  <p className="text-sm text-slate-600 mt-1">{getRoleDescription(formData.role)}</p>
                  {isClientRole && formData.clientId && (
                    <p className="text-sm text-blue-600 mt-2">
                      <strong>Client Access:</strong> {clients.find(c => c.id.toString() === formData.clientId)?.businessName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client Portal Access - Only show for Client roles */}
          {isClientRole && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">Client Portal Access</h3>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-slate-600">
                  Client users automatically have access to the client portal with separate login credentials
                </p>
              </div>
              
              <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Portal Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={portalAccess.username}
                     readOnly
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                       errors.portalUsername ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50'
                      }`}
                      placeholder="Enter portal username"
                    />
                    {errors.portalUsername && <p className="text-red-600 text-sm mt-1">{errors.portalUsername}</p>}
                    <p className="text-xs text-slate-500 mt-1">
                     This reflects the user's email address and will be used to log into the client portal
                    </p>
                  </div>
                  
                  {/* Password Status Display */}
                  {user && portalAccess.hasStoredPassword && !portalAccess.portalPassword && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">Portal password is set</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetPassword}
                          className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          Reset Password
                        </button>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        User can log into the client portal with their existing password
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Portal Password {(!user || !portalAccess.hasStoredPassword) && '*'}
                      </label>
                      <div className="relative">
                        <input
                          type={portalAccess.showPortalPassword ? 'text' : 'password'}
                          name="portalPassword"
                          value={portalAccess.portalPassword}
                          onChange={handlePortalAccessChange}
                          className={`w-full px-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                            errors.portalPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                          }`}
                          placeholder={user && portalAccess.hasStoredPassword ? "Leave blank to keep current" : "Enter portal password"}
                        />
                        <button
                          type="button"
                          onClick={() => setPortalAccess(prev => ({ ...prev, showPortalPassword: !prev.showPortalPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {portalAccess.showPortalPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.portalPassword && <p className="text-red-600 text-sm mt-1">{errors.portalPassword}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm Portal Password {(!user || !portalAccess.hasStoredPassword) && '*'}
                      </label>
                      <div className="relative">
                        <input
                          type={portalAccess.showConfirmPortalPassword ? 'text' : 'password'}
                          name="confirmPortalPassword"
                          value={portalAccess.confirmPortalPassword}
                          onChange={handlePortalAccessChange}
                          className={`w-full px-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                            errors.confirmPortalPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                          }`}
                          placeholder="Confirm portal password"
                        />
                        <button
                          type="button"
                          onClick={() => setPortalAccess(prev => ({ ...prev, showConfirmPortalPassword: !prev.showConfirmPortalPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {portalAccess.showConfirmPortalPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPortalPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPortalPassword}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Generate Secure Password
                    </button>
                    {user && portalAccess.hasStoredPassword && (
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        Clear & Reset
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> Portal credentials are separate from system login credentials. 
                      Clients will use these credentials to access their dedicated portal.
                    </p>
                  </div>
              </div>
            </div>
          )}
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;