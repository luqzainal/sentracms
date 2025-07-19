import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  FileText, 
  DollarSign, 
  Plus, 
  Send, 
  UploadCloud, 
  X 
} from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { useToast } from '../../hooks/useToast';
import AddOnServiceModal from '../common/AddOnServiceModal';

interface ClientPortalDashboardProps {
  user: any;
  onBack: () => void;
}

const ClientPortalDashboard: React.FC<ClientPortalDashboardProps> = ({ user, onBack }) => {
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showPackageComponents, setShowPackageComponents] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showViewAppointments, setShowViewAppointments] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addOnServices, fetchAddOnServices, addClientServiceRequest, getClientServiceRequestsByClientId, fetchClientServiceRequests } = useAppStore();
  const { success, error } = useToast();

  // Convert database services to modal format
  const availableAddOnServices = addOnServices
    .filter(service => service.status === 'Available')
    .map(service => ({
      id: service.id.toString(),
      name: service.name,
      description: service.description,
      price: `RM ${service.price.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      category: service.category,
      available: service.status === 'Available'
    }));

  // Fetch add-on services and client service requests on component mount
  useEffect(() => {
    fetchAddOnServices();
    fetchClientServiceRequests();
  }, [fetchAddOnServices, fetchClientServiceRequests]);

  const { 
    clients, 
    getProgressStepsByClientId, 
    getComponentsByClientId,
    getInvoicesByClientId,
    chats,
    calendarEvents,
    fetchClients,
    fetchProgressSteps,
    fetchComponents,
    fetchInvoices,
    fetchPayments,
    fetchChats,
    fetchCalendarEvents,
    sendMessage,
    createChatForClient,
    loadChatMessages,
    updateChatOnlineStatus,
    calculateClientProgressStatus,
    getClientRole
  } = useAppStore();

  // Find the client data based on the user email
  const client = clients.find(c => c.email === user.email);
  const clientChat = chats.find(chat => chat.clientId === client?.id);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchClients(),
          fetchProgressSteps(),
          fetchComponents(),
          fetchInvoices(),
          fetchPayments(),
          fetchChats(),
          fetchCalendarEvents()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchClients, fetchProgressSteps, fetchComponents, fetchInvoices, fetchPayments, fetchChats, fetchCalendarEvents]);

  // Load messages when chat is available
  useEffect(() => {
    if (clientChat) {
      loadChatMessages(clientChat.id);
    }
  }, [clientChat?.id, loadChatMessages]);

  const handleSendMessage = async () => {
    if ((message.trim() || attachment) && client) {
      try {
        let attachmentUrl = '';
        
        // Upload attachment if present
        if (attachment) {
          console.log('🔄 Uploading chat attachment:', attachment.name);
          
          // 1. Get pre-signed URL from our API
          const res = await fetch('/api/generate-upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              fileName: attachment.name, 
              fileType: attachment.type 
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ API Error:', errorText);
            throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
          }

          const responseData = await res.json();
          const { uploadUrl, fileUrl } = responseData;
          
          if (!uploadUrl || !fileUrl) {
            throw new Error('Invalid response: missing uploadUrl or fileUrl');
          }

          // 2. Upload file to DigitalOcean Spaces
          console.log('📤 Starting file upload to DigitalOcean Spaces...');
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl, true);
            
            xhr.onload = async () => {
              console.log('📡 Upload response status:', xhr.status);
              if (xhr.status === 200) {
                console.log('✅ File uploaded successfully!');
                attachmentUrl = fileUrl;
                resolve();
              } else {
                console.error('❌ Upload failed with status:', xhr.status);
                console.error('❌ Upload response:', xhr.responseText);
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            };

            xhr.onerror = (error) => {
              console.error('❌ Network error during upload:', error);
              reject(new Error('Network error during upload.'));
            };
            
            console.log('📤 Sending file to DigitalOcean Spaces...');
            xhr.send(attachment);
          });
        }
        
        let currentChat = chats.find(chat => chat.clientId === client.id);
        
        try {
          // If no chat exists, create one
          if (!currentChat) {
            await createChatForClient(client.id);
            // Re-fetch chats to get the new chat ID
            const newChats = useAppStore.getState().chats;
            currentChat = newChats.find(chat => chat.clientId === client.id);
          }

          if (currentChat) {
            await sendMessage(currentChat.id, message.trim() || 'Sent an attachment', 'client', attachmentUrl);
            setMessage('');
            setAttachment(null);
            // Reload messages for the chat to show the new one
            await loadChatMessages(currentChat.id);
          } else {
            console.error("Failed to create or find chat for the client.");
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddOnServiceSubmit = async (selectedServices: string[]) => {
    console.log('Selected add-on services:', selectedServices);
    
    if (!client) {
      alert('Client information not available. Please contact support.');
      return;
    }

    try {
      // Create service requests for each selected service
      for (const serviceId of selectedServices) {
        await addClientServiceRequest({
          client_id: client.id,
          service_id: parseInt(serviceId),
          status: 'Pending'
        });
      }

      // Find the selected services for display
      const selectedServiceDetails = availableAddOnServices.filter(service => 
        selectedServices.includes(service.id)
      );
      
      const totalCost = selectedServiceDetails.reduce((total, service) => 
        total + parseFloat(service.price.replace('RM ', '')), 0
      );
      
      alert(`Add-on services requested successfully!\n\nServices: ${selectedServiceDetails.map(s => s.name).join(', ')}\nTotal Cost: RM ${totalCost.toFixed(2)}\n\nOur team will review your request and contact you shortly.`);
      
    } catch (error) {
      console.error('Error submitting add-on services:', error);
      alert('Failed to submit add-on services. Please try again or contact support.');
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [clientChat?.messages]);

  // Update clientChat reference when chats change
  useEffect(() => {
    if (client && chats.length > 0) {
      const updatedClientChat = chats.find(chat => chat.clientId === client.id);
      if (updatedClientChat && !clientChat) {
        // Load messages for the chat
        const { loadChatMessages } = useAppStore.getState();
        loadChatMessages(updatedClientChat.id);
      }
    }
  }, [chats, client, clientChat]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Client information not found.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get client data
  const progressSteps = getProgressStepsByClientId(client.id);
  const components = getComponentsByClientId(client.id);
  const invoices = getInvoicesByClientId(client.id);
  const clientEvents = calendarEvents.filter(event => event.clientId === client.id);

  // Calculate progress
  const totalSteps = progressSteps.length;
  const completedSteps = progressSteps.filter(step => step.status === 'Completed').length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const progressStatusData = calculateClientProgressStatus(client.id);
  const progressStatus = progressStatusData.hasOverdue ? 'Behind' : progressStatusData.percentage >= 80 ? 'On Track' : 'Behind';

  // Calculate billing summary
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paid, 0);
  const dueAmount = invoices.reduce((sum, inv) => sum + inv.due, 0);

  // Get the actual package name from invoices if available
  const actualPackageName = invoices.length > 0 ? invoices[0].packageName : 'No Package Assigned';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Welcome back, {client.name}!</h1>
                <p className="text-slate-600">Here's your project overview</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Package:</span>
              <span className="text-sm font-medium text-slate-900">{actualPackageName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Dashboard */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Project Progress</h2>
                <button
                  onClick={() => setShowProgressTracker(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Overall Progress</span>
                  <span className="text-sm font-medium text-slate-900">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{completedSteps} of {totalSteps} steps completed</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    progressStatus === 'On Track' ? 'bg-green-100 text-green-800' :
                    progressStatus === 'Behind' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {progressStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowPackageComponents(true)}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-slate-900">View Components</span>
                </button>
                
                <button
                  onClick={() => setShowBilling(true)}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-slate-900">Billing</span>
                </button>
                
                <button
                  onClick={() => setShowViewAppointments(true)}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-slate-900">Appointments</span>
                </button>
                
                <button
                  onClick={() => setShowAddOnModal(true)}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <Plus className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-slate-900">Add Services</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
                <button
                  onClick={() => setShowMyRequests(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {clientEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{event.title}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(event.startDate).toLocaleDateString()} at {event.startTime}
                      </p>
                    </div>
                  </div>
                ))}
                
                {clientEvents.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Chat with Support</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
                {clientChat && clientChat.messages && clientChat.messages.length > 0 ? (
                  clientChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'client'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        {/* Show sender info for all messages */}
                        {msg.sender === 'admin' && (
                          <div className="text-xs font-medium mb-1 text-slate-600">
                            Admin Team - Support
                          </div>
                        )}
                        {msg.sender === 'client' && (
                          <div className="text-xs font-medium mb-1 text-blue-100">
                            {getClientRole(client.id)} - {client.name}
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        
                        {/* Show attachment if exists */}
                        {msg.attachmentUrl && (
                          <div className="mt-2">
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs flex items-center space-x-1 ${
                                msg.sender === 'client' 
                                  ? 'text-blue-100 hover:text-blue-200' 
                                  : 'text-blue-600 hover:text-blue-800'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              <span>View attachment</span>
                            </a>
                          </div>
                        )}
                        
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'client' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start a conversation with your team</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200">
                {/* Show attachment if selected */}
                {attachment && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-700">{attachment.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {/* File upload button */}
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      id="dashboard-chat-attachment"
                    />
                    <label htmlFor="dashboard-chat-attachment" className="cursor-pointer p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <UploadCloud className="w-4 h-4" />
                    </label>
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      disabled={!clientChat}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={(!message.trim() && !attachment) || !clientChat}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Links Modal */}

      {/* Add-On Service Modal */}
      <AddOnServiceModal
        isOpen={showAddOnModal}
        onClose={() => setShowAddOnModal(false)}
        onSubmit={handleAddOnServiceSubmit}
        availableServices={availableAddOnServices}
      />
    </div>
  );
};

export default ClientPortalDashboard;