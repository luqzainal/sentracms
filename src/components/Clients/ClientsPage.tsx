import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import ClientModal from './ClientModal';
import ClientProfile from './ClientProfile';
import ClientProgressTracker from './ClientProgressTracker';
import { useAppStore } from '../../store/AppStore';

interface ClientsPageProps {
  setActiveTab?: (tab: string) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [picFilter, setPicFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileClientId, setProfileClientId] = useState<string>('');
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [progressClientId, setProgressClientId] = useState<string>('');

  const { 
    clients, 
    progressSteps, 
    addClient, 
    updateClient, 
    deleteClient,
    addUser
  } = useAppStore();

  // Helper function to check if a step is overdue
  const isStepOverdue = (step: any) => {
    if (step.completed) return false;
    const now = new Date();
    const deadline = new Date(step.deadline);
    return now > deadline;
  };

  // Helper function to get client progress status
  const getClientProgressStatus = (clientId: number) => {
    const steps = progressSteps.filter(step => step.clientId === clientId);
    const hasOverdueSteps = steps.some(step => isStepOverdue(step));
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    return {
      hasOverdue: hasOverdueSteps,
      percentage: progressPercentage,
      overdueCount: steps.filter(step => isStepOverdue(step)).length
    };
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPic = picFilter === 'all' || client.pic === picFilter;
    return matchesSearch && matchesStatus && matchesPic;
  });

  const uniquePics = [...new Set(clients.map(client => client.pic))];

  const handleAddClient = () => {
    setSelectedClient(null);
    setShowModal(true);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleViewProfile = (clientId: string) => {
    setProfileClientId(clientId);
    setShowProfile(true);
  };

  const handleTrackProgress = (clientId: string) => {
    setProgressClientId(clientId);
    setShowProgressTracker(true);
  };

  const handleBackFromProfile = () => {
    setShowProfile(false);
    setProfileClientId('');
  };

  const handleBackFromProgress = () => {
    setShowProgressTracker(false);
    setProgressClientId('');
  };

  const handleEditFromProfile = (client: any) => {
    setSelectedClient(client);
    setShowModal(true);
    setShowProfile(false);
  };

  const handleSaveClient = (clientData: any) => {
    if (selectedClient) {
      // Update existing client
      updateClient(selectedClient.id, clientData);
    } else {
      // Add new client
      const newClient = {
        ...clientData,
        totalSales: 0,
        totalCollection: 0,
        balance: 0,
        lastActivity: new Date().toISOString().split('T')[0],
        invoiceCount: 0,
        registeredAt: new Date().toISOString(),
        company: clientData.businessName,
        address: 'Kuala Lumpur, Malaysia',
        notes: 'New client'
      };
      addClient(newClient);

      // Auto-create client user account
      if (clientData.password) {
        addUser({
          name: clientData.name,
          email: clientData.email,
          role: 'Client',
          status: 'Active',
          lastLogin: 'Never',
          createdAt: new Date().toISOString(),
          permissions: ['client_dashboard', 'client_profile', 'client_messages']
        });
      }
      
      // Auto-copy any existing components to progress steps for new clients
      setTimeout(() => {
        copyComponentsToProgressSteps(newClient.id);
      }, 100);
    }
    setShowModal(false);
  };

  const handleDeleteClient = (clientId: number) => {
    if (confirm('Are you sure you want to delete this client? This will also delete all related data.')) {
      deleteClient(clientId);
    }
  };

  if (showProfile) {
    return (
      <ClientProfile
        clientId={profileClientId}
        onBack={handleBackFromProfile}
        onEdit={handleEditFromProfile}
      />
    );
  }

  if (showProgressTracker) {
    return (
      <ClientProgressTracker
        clientId={progressClientId}
        onBack={handleBackFromProgress}
      />
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-600 mt-2">Manage your client relationships and projects</p>
        </div>
        <button
          onClick={handleAddClient}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wide">Complete Clients</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {clients.filter(c => c.status === 'Complete').length}
              </p>
            </div>
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">
                {clients.filter(c => c.status === 'Complete').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 font-semibold text-sm uppercase tracking-wide">Pending Clients</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">
                {clients.filter(c => c.status === 'Pending').length}
              </p>
            </div>
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">
                {clients.filter(c => c.status === 'Pending').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-semibold text-sm uppercase tracking-wide">Inactive Clients</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {clients.filter(c => c.status === 'Inactive').length}
              </p>
            </div>
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">
                {clients.filter(c => c.status === 'Inactive').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[140px] transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={picFilter}
              onChange={(e) => setPicFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[140px] transition-all duration-200"
            >
              <option value="all">All PICs</option>
              {uniquePics.map((pic) => (
                <option key={pic} value={pic}>{pic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Client</th>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Contact</th>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Status</th>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Progress</th>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Total<br/>Sales</th>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Total<br/>Collection</th>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Balance</th>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Invoices</th>
                <th className="text-center py-4 px-6 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => {
                const progressStatus = getClientProgressStatus(client.id);
                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-4 px-6 text-center">
                      <div>
                        <h4 className="font-medium text-slate-900">{client.businessName}</h4>
                        <p className="text-sm text-slate-600">{client.name}</p>
                        <p className="text-sm text-slate-500">PIC: {client.pic}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div>
                        <p className="text-sm text-slate-900">{client.email}</p>
                        <p className="text-sm text-slate-600">{client.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progressStatus.hasOverdue 
                                  ? 'bg-red-500' 
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${progressStatus.percentage}%` }}
                            />
                          </div>
                          <span className={`text-sm min-w-[35px] font-medium ${
                            progressStatus.hasOverdue 
                              ? 'text-red-600' 
                              : 'text-slate-600'
                          }`}>
                            {progressStatus.percentage}%
                          </span>
                        </div>
                        {progressStatus.hasOverdue && (
                          <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            <span>{progressStatus.overdueCount} Overdue</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="text-sm font-medium text-slate-900 min-w-[80px]">
                        {formatCurrency(client.totalSales)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="text-sm font-medium text-green-600 min-w-[80px]">
                        {formatCurrency(client.totalCollection)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="text-sm font-medium text-orange-600 min-w-[80px]">
                        {formatCurrency(client.balance)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-medium text-slate-900">{client.invoiceCount}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleViewProfile(client.id.toString())}
                          className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleTrackProgress(client.id.toString())}
                          className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200"
                        >
                          Track
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ClientModal
          client={selectedClient}
          onClose={() => setShowModal(false)}
          onSave={handleSaveClient}
        />
      )}
    </div>
  );
};

export default ClientsPage;