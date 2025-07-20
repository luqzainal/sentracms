import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Trash2, Menu, Eye, TrendingUp, Edit } from 'lucide-react';
import ClientModal from './ClientModal';
import ClientProfile from './ClientProfile';
import ClientProgressTracker from './ClientProgressTracker';
import { useAppStore } from '../../store/AppStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmationModal from '../common/ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';

interface ClientsPageProps {
  setActiveTab?: (tab: string) => void;
  onToggleSidebar?: () => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ setActiveTab, onToggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileClientId, setProfileClientId] = useState<string>('');
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [progressClientId, setProgressClientId] = useState<string>('');

  const { 
    clients, 
    loading,
    tags,
    users,
    fetchClients,
    fetchTags,
    fetchProgressSteps,
    progressSteps, 
    addClient, 
    updateClient, 
    deleteClient,
    addUser,
    calculateClientProgressStatus,
    addClientPic,
    deleteClientPic,
    reorderClientPics,
    getClientPicsByClientId
  } = useAppStore();

  // Custom confirmation modal
  const { confirmation, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial data
    fetchClients();
    fetchTags();
    fetchProgressSteps();
  }, [fetchClients, fetchTags, fetchProgressSteps]);

  // Helper function to check if a step is overdue
  const isStepOverdue = (step: any) => {
    if (step.completed) return false;
    const now = new Date();
    const deadline = new Date(step.deadline);
    return now > deadline;
  };

  // Helper function to get client progress status - use consistent calculation from store
  const getClientProgressStatus = (clientId: number) => {
    return calculateClientProgressStatus(clientId);
  };

  // Helper function to get deadline data for a client
  const getClientDeadlines = (clientId: number) => {
    const clientSteps = progressSteps.filter(step => step.clientId === clientId);
    const packageStep = clientSteps.find(step => step.title.includes(' - Package Setup'));
    
    if (!packageStep) {
      return {
        onboarding: null,
        firstDraft: null,
        secondDraft: null,
        onboardingCompleted: false,
        firstDraftCompleted: false,
        secondDraftCompleted: false
      };
    }

    return {
      onboarding: packageStep.onboardingDeadline,
      firstDraft: packageStep.firstDraftDeadline,
      secondDraft: packageStep.secondDraftDeadline,
      onboardingCompleted: packageStep.onboardingCompleted || false,
      firstDraftCompleted: packageStep.firstDraftCompleted || false,
      secondDraftCompleted: packageStep.secondDraftCompleted || false
    };
  };

  // Helper function to format deadline date
  const formatDeadline = (deadline: string | null | undefined) => {
    if (!deadline) return 'Not set';
    const date = new Date(deadline);
    return date.toLocaleDateString('en-MY', { 
      day: '2-digit', 
      month: 'short',
      year: '2-digit'
    });
  };

  // Helper function to check if deadline is overdue
  const isDeadlineOverdue = (deadline: string | null | undefined, completed: boolean) => {
    if (!deadline || completed) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now > deadlineDate;
  };

  // Helper function to get deadline status color
  const getDeadlineStatusColor = (deadline: string | null | undefined, completed: boolean) => {
    if (!deadline) return 'text-gray-400';
    if (completed) return 'text-green-600';
    if (isDeadlineOverdue(deadline, completed)) return 'text-red-600';
    return 'text-blue-600';
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
    
    // Tag filtering
    let matchesTag = true;
    if (tagFilter !== 'all') {
      matchesTag = Boolean(client.tags && client.tags.includes(tagFilter));
    }
    
    return matchesSearch && matchesStatus && matchesTag;
  });

  const uniqueTags = tags.map(tag => tag.name);

  const handleAddClient = () => {
    setSelectedClient(null);
    setShowModal(true);
  };

  const handleViewClient = (clientId: number) => {
    navigate(`/clients/${clientId}`);
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

  const handleSaveClient = async (clientData: any) => {
    if (selectedClient) {
      // Update existing client
      try {
        await updateClient(selectedClient.id, clientData);
        
        // Handle additional PICs for existing client
        if (clientData.additionalPics) {
          // Get existing PICs from database
          const existingPics = getClientPicsByClientId(selectedClient.id);
          
          // Delete all existing additional PICs
          for (const pic of existingPics) {
            await deleteClientPic(pic.id);
          }
          
          // Add new additional PICs
          for (const pic of clientData.additionalPics) {
            if (pic.name) {
              const user = users.find((u: any) => u.name === pic.name);
              if (user) {
                await addClientPic({
                  clientId: selectedClient.id,
                  picId: user.id,
                  position: pic.position
                });
              }
            }
          }
          
          // Reorder positions
          await reorderClientPics(selectedClient.id);
        }
        
        // Refresh data from database to get updated tags
        await Promise.all([
          fetchClients(),
          fetchTags()
        ]);
        
        toast.success('Client updated successfully!');
      } catch (error) {
        console.error('Error updating client:', error);
        toast.error('Failed to update client');
      }
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
      
      const promise = addClient(newClient).then(async (createdClient) => {
        // Handle additional PICs for new client
        if (clientData.additionalPics) {
          for (const pic of clientData.additionalPics) {
            if (pic.name) {
              const user = users.find(u => u.name === pic.name);
              if (user) {
                await addClientPic({
                  clientId: createdClient.id,
                  picId: user.id,
                  position: pic.position
                });
              }
            }
          }
          
          // Reorder positions
          await reorderClientPics(createdClient.id);
        }
        
        return createdClient;
      });

      toast.promise(promise, {
        loading: 'Saving client...',
        success: <b>Client saved successfully!</b>,
        error: <b>Could not save client.</b>,
      });
    }
    setShowModal(false);
  };

  const handleDeleteClient = (clientId: number) => {
    showConfirmation(
      () => deleteClient(clientId),
      {
        title: 'Delete Client',
        message: 'Are you sure you want to delete this client? This will also delete all related data.',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  if (showProgressTracker) {
    return (
      <ClientProgressTracker
        clientId={progressClientId}
        onBack={handleBackFromProgress}
      />
    );
  }

  if (loading.clients) {
    return (
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading clients...</p>
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Clients</h1>
            <p className="text-slate-600 mt-1 lg:mt-2 text-sm lg:text-base">Manage your client relationships and projects</p>
        </div>
        </div>
        <button
          onClick={handleAddClient}
          className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm text-sm lg:text-base"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 lg:p-8 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Complete Clients</p>
              <p className="text-2xl lg:text-3xl font-bold text-green-900 mt-1 lg:mt-2">
                {clients.filter(c => c.status === 'Complete').length}
              </p>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg lg:text-xl">
                {clients.filter(c => c.status === 'Complete').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 lg:p-8 border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Pending Clients</p>
              <p className="text-2xl lg:text-3xl font-bold text-yellow-900 mt-1 lg:mt-2">
                {clients.filter(c => c.status === 'Pending').length}
              </p>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg lg:text-xl">
                {clients.filter(c => c.status === 'Pending').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 lg:p-8 border border-red-200 shadow-sm md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Inactive Clients</p>
              <p className="text-2xl lg:text-3xl font-bold text-red-900 mt-1 lg:mt-2">
                {clients.filter(c => c.status === 'Inactive').length}
              </p>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg lg:text-xl">
                {clients.filter(c => c.status === 'Inactive').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row lg:flex-row gap-4 lg:gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm lg:text-base"
            />
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[120px] lg:min-w-[140px] transition-all duration-200 text-sm lg:text-base"
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 lg:px-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[120px] lg:min-w-[140px] transition-all duration-200 text-sm lg:text-base"
            >
              <option value="all">All Tags</option>
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto lg:overflow-x-hidden -mx-4 lg:mx-0">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-4 font-semibold text-slate-900 text-xs lg:text-sm w-[160px]">Client</th>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-3 font-semibold text-slate-900 text-xs lg:text-sm w-[120px] hidden lg:table-cell">Contact</th>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-3 font-semibold text-slate-900 text-xs lg:text-sm w-[80px]">Status</th>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-3 font-semibold text-slate-900 text-xs lg:text-sm w-[100px]">Progress</th>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-3 font-semibold text-slate-900 text-xs lg:text-sm w-[100px]">Onboarding</th>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-3 font-semibold text-slate-900 text-xs lg:text-sm w-[100px]">First Draft</th>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-3 font-semibold text-slate-900 text-xs lg:text-sm w-[100px]">Second Draft</th>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-3 font-semibold text-slate-900 text-xs lg:text-sm w-[100px]">Tags</th>
                <th className="text-center py-3 lg:py-4 px-2 lg:px-3 font-semibold text-slate-900 text-xs lg:text-sm w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => {
                const progressStatus = getClientProgressStatus(client.id);
                const deadlines = getClientDeadlines(client.id);
                const tagObjects = client.tags ? client.tags.map(tagName => {
                  const globalTag = tags.find(t => t.name === tagName);
                  return globalTag || { name: tagName, color: '#3B82F6' };
                }) : [];
                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100">
                    <td className="py-3 lg:py-4 px-2 lg:px-4 text-center">
                      <div>
                        <div className="px-2 py-1">
                          <h4 className="font-medium text-slate-900 text-xs lg:text-sm">{client.businessName}</h4>
                          <p className="text-xs lg:text-sm text-slate-600 mt-1">{client.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-3 text-center hidden lg:table-cell">
                      <div>
                        <p className="text-xs lg:text-sm text-slate-900">{client.email}</p>
                        <p className="text-xs lg:text-sm text-slate-600">{client.phone}</p>
                        {client.pic && (
                          <p className="text-xs text-blue-600 font-medium">
                            {(() => {
                              const pic1 = client.pic.split(' - ')[0];
                              const additionalPics = getClientPicsByClientId(client.id);
                              const totalPics = 1 + (client.pic.includes(' - ') ? 1 : 0) + additionalPics.length;
                              
                              if (totalPics === 1) {
                                return `PIC 1: ${pic1}`;
                              } else if (totalPics === 2) {
                                return `PIC 1: ${pic1} & 1 other`;
                              } else {
                                return `PIC 1: ${pic1} & ${totalPics - 1} others`;
                              }
                            })()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-3 text-center">
                      <span className={`px-1.5 lg:px-2 py-1 rounded text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-3 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 lg:w-12 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progressStatus.hasOverdue 
                                  ? 'bg-red-500' 
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${progressStatus.percentage}%` }}
                            />
                          </div>
                          <span className={`text-xs lg:text-sm min-w-[20px] lg:min-w-[25px] font-medium ${
                            progressStatus.hasOverdue 
                              ? 'text-red-600' 
                              : 'text-slate-600'
                          }`}>
                            {progressStatus.percentage}%
                          </span>
                        </div>
                        {progressStatus.hasOverdue && (
                          <div className="px-1.5 lg:px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            <span>{progressStatus.overdueCount} Overdue</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-3 text-center">
                      <span className={`text-xs lg:text-sm font-medium ${getDeadlineStatusColor(deadlines.onboarding, deadlines.onboardingCompleted)}`}>
                        {formatDeadline(deadlines.onboarding)}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-3 text-center">
                      <span className={`text-xs lg:text-sm font-medium ${getDeadlineStatusColor(deadlines.firstDraft, deadlines.firstDraftCompleted)}`}>
                        {formatDeadline(deadlines.firstDraft)}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-3 text-center">
                      <span className={`text-xs lg:text-sm font-medium ${getDeadlineStatusColor(deadlines.secondDraft, deadlines.secondDraftCompleted)}`}>
                        {formatDeadline(deadlines.secondDraft)}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-3 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {tagObjects.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full border"
                            style={{ 
                              backgroundColor: `${tag.color}20`, 
                              color: tag.color, 
                              borderColor: `${tag.color}40` 
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {tagObjects.length > 3 && (
                          <span className="text-xs text-slate-500">+{tagObjects.length - 3}</span>
                        )}
                        {tagObjects.length === 0 && (
                          <span className="text-xs text-slate-400">No tags</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-3 text-center">
                      <div className="flex flex-col lg:flex-row items-center justify-center space-y-2 lg:space-y-0 lg:space-x-2 px-2 py-1">
                        <button 
                          onClick={() => handleViewClient(client.id)}
                          className="p-1 lg:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                        <button
                          onClick={() => handleTrackProgress(client.id.toString())}
                          className="p-1 lg:p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                          title="Track Progress"
                        >
                          <TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-1 lg:p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                          title="Edit Client"
                        >
                          <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1 lg:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
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

export default ClientsPage;