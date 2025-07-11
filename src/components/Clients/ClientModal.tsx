import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, DollarSign, Lock, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface ClientModalProps {
  client?: any;
  onClose: () => void;
  onSave: (clientData: any) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    status: 'Complete',
    pic: '',
    username: '',
    password: '',
    hasExistingCredentials: false,
    showPassword: false,
    storedPassword: '' // Store the actual password for existing clients
  });

  useEffect(() => {
    if (client) {
      // For existing clients, show dots if they have a password
      const hasPassword = !!(client.password || client.storedPassword);
      setFormData({
        name: client.name || '',
        businessName: client.businessName || '',
        email: client.email || '',
        phone: client.phone || '',
        status: client.status || 'Complete',
        pic: client.pic || '',
        username: client.username || '',
        password: hasPassword ? '••••••••' : '',
        hasExistingCredentials: hasPassword,
        showPassword: false,
        storedPassword: client.password || client.storedPassword || ''
      });
    } else {
      // Set default values for new client
      setFormData({
        name: 'Ahmad Bin Abdullah',
        businessName: 'Ahmad Tech Solutions',
        email: 'ahmad.abdullah@gmail.com',
        phone: '+60 12-345 6789',
        status: 'Complete',
        pic: 'Nisha KB',
        username: 'ahmad.abdullah@gmail.com',
        password: '',
        hasExistingCredentials: false,
        showPassword: false,
        storedPassword: ''
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-create client user account when adding new client
    if (!client) {
      // This would typically create a user account in the backend
      console.log('Auto-creating client user account:', {
        name: formData.name,
        email: formData.email,
        username: formData.email,
        password: formData.password,
        role: 'Client',
        status: 'Active'
      });
    }
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      username: formData.email,
      // If password is dots, keep the stored password; otherwise use the new password
      password: formData.password === '••••••••' ? formData.storedPassword : formData.password,
      // Flag to indicate if password was changed
      passwordChanged: formData.password !== '••••••••' && formData.password !== ''
    };
    
    onSave(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      if (name === 'email') {
        updated.username = value;
      }
      
      return updated;
    });
  };

  const handleResetCredentials = () => {
    setFormData(prev => ({
      ...prev,
      username: prev.email,
      password: '',
      hasExistingCredentials: false,
      showPassword: false,
      storedPassword: ''
    }));
  };

  const togglePasswordVisibility = () => {
    setFormData(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If the current password is dots and user starts typing, clear it
    if (formData.password === '••••••••' && value !== '••••••••') {
      setFormData(prev => ({
        ...prev,
        password: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        password: value
      }));
    }
  };

  const handlePasswordFocus = () => {
    // Clear dots when user focuses on password field
    if (formData.password === '••••••••') {
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {client ? 'Edit Client' : 'Add New Client'}
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
                  Client Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter client name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ahmad Tech Solutions"
                  />
                </div>
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
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number (Malaysia)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="+60 12-345 6789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="Complete">Complete</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PIC (Person in Charge) - Department
                </label>
                <div className="relative">
                  <select
                    name="pic"
                    value={formData.pic}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select PIC</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Marketing Automation">Marketing Automation</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Client Portal Access */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">Client Portal Access</h3>
              {formData.hasExistingCredentials && (
                <button
                  type="button"
                  onClick={handleResetCredentials}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Password</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username (Email)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="username"
                    value={formData.username}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                    placeholder="ahmad.abdullah@gmail.com"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Username automatically syncs with email address</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  {formData.hasExistingCredentials && (
                    <button
                      type="button"
                      onClick={handleResetCredentials}
                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Update Password</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={formData.showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    onFocus={handlePasswordFocus}
                    className="w-full pl-10 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder={formData.hasExistingCredentials ? "Enter new password to update" : "Enter password"}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {formData.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.hasExistingCredentials && !formData.password && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>No password set - field is empty</span>
                  </p>
                )}
                {formData.hasExistingCredentials && formData.password === '••••••••' && (
                  <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Password is stored securely (click to update)</span>
                  </p>
                )}
                {formData.password && formData.password !== '••••••••' && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>{formData.hasExistingCredentials ? 'Password will be updated' : 'New password will be stored securely'}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {client ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;