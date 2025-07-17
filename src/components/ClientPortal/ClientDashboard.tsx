import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MessageSquare, DollarSign, HelpCircle, Package, Eye, Clock, CheckCircle, AlertCircle, User, Phone, Mail, MapPin, ChevronLeft, ChevronRight, X, Send, Plus } from 'lucide-react';
import ClientProgressTracker from '../Clients/ClientProgressTracker';
import AddOnServiceModal from '../common/AddOnServiceModal';
import { useAppStore } from '../../store/AppStore';

interface ClientDashboardProps {
  user: any;
  onBack: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onBack }) => {
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showPackageComponents, setShowPackageComponents] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showViewAppointments, setShowViewAppointments] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [message, setMessage] = useState('');

  // Sample add-on services data
  const availableAddOnServices = [
    {
      id: '1',
      name: 'Premium Support',
      description: '24/7 priority support with dedicated account manager',
      price: 'RM 299',
      category: 'Support Services',
      available: true
    },
    {
      id: '2',
      name: 'Advanced Analytics',
      description: 'Detailed reporting and analytics dashboard',
      price: 'RM 199',
      category: 'Analytics',
      available: true
    },
    {
      id: '3',
      name: 'Custom Domain',
      description: 'Use your own domain name with SSL certificate',
      price: 'RM 99',
      category: 'Domain Services',
      available: true
    },
    {
      id: '4',
      name: 'API Integration',
      description: 'Connect with third-party services via API',
      price: 'RM 399',
      category: 'Integration',
      available: true
    },
    {
      id: '5',
      name: 'Mobile App',
      description: 'Native mobile application for iOS and Android',
      price: 'RM 999',
      category: 'Mobile',
      available: false
    },
    {
      id: '6',
      name: 'Advanced Security',
      description: 'Enhanced security features and monitoring',
      price: 'RM 149',
      category: 'Security',
      available: true
    }
  ];

  const { 
    clients, 
    getProgressStepsByClientId, 
    getComponentsByClientId,
    getInvoicesByClientId,
    getPaymentsByClientId,
    chats,
    calendarEvents,
    fetchClients,
    fetchProgressSteps,
    fetchComponents,
    fetchInvoices,
    fetchPayments,
    fetchChats,
    fetchCalendarEvents,
    startPolling,
    stopPolling,
    isPolling,
    calculateClientProgressStatus,
    getClientRole
  } = useAppStore();

  // Fetch data when component mounts to ensure sync with admin
  useEffect(() => {
    fetchClients();
    fetchProgressSteps();
    fetchComponents();
    fetchInvoices();
    fetchPayments();
    fetchChats();
    fetchCalendarEvents();
    
    // Start polling for real-time updates
    if (!isPolling) {
      startPolling();
    }
    
    // Cleanup function to stop polling when component unmounts
    return () => {
      stopPolling();
    };
  }, [fetchClients, fetchProgressSteps, fetchComponents, fetchInvoices, fetchPayments, fetchChats, fetchCalendarEvents, startPolling, stopPolling, isPolling]);

  // Find the client data based on the user email or create demo client for demo users
  let client = clients.find(c => c.email === user.email);
  
  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Client data not found</h2>
          <p className="text-slate-600 mb-4">Unable to load client information</p>
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const progressSteps = getProgressStepsByClientId(client.id);
  const components = getComponentsByClientId(client.id);
  const invoices = getInvoicesByClientId(client.id);
  const payments = getPaymentsByClientId(client.id);
  const clientChat = chats.find(chat => chat.clientId === client.id);
  const clientEvents = calendarEvents.filter(event => event.clientId === client.id);

  // Calculate progress using consistent calculation from store
  const progressStatus = calculateClientProgressStatus(client.id);
  const { percentage: progressPercentage } = progressStatus;

  // Calculate billing summary
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paid, 0);
  const dueAmount = invoices.reduce((sum, inv) => sum + inv.due, 0);

  // Get the actual package name from invoices if available
  const actualPackageName = invoices.length > 0 ? invoices[0].packageName : 'No Package Assigned';

  const handleSendMessage = async () => {
    if (message.trim() && client) {
      const messageContent = message.trim();
      setMessage(''); // Clear input immediately for better UX
      
      let currentChat = chats.find(chat => chat.clientId === client.id);
      
      try {
        // If no chat exists, create one
        if (!currentChat) {
          const { createChatForClient } = useAppStore.getState();
          await createChatForClient(client.id);
          // Re-fetch chats to get the new chat ID
          const newChats = useAppStore.getState().chats;
          currentChat = newChats.find(chat => chat.clientId === client.id);
        }

        if (currentChat) {
          // Optimistic update - add message to UI immediately
          const optimisticMessage = {
            id: Date.now(),
            chat_id: currentChat.id,
            sender: 'client' as const,
            content: messageContent,
            message_type: 'text',
            created_at: new Date().toISOString()
          };
          
          // Update local state immediately
          const { chats } = useAppStore.getState();
          const updatedChats = chats.map(chat => 
            chat.id === currentChat!.id 
              ? {
                  ...chat,
                  messages: [...chat.messages, optimisticMessage],
                  lastMessage: messageContent,
                  lastMessageAt: optimisticMessage.created_at,
                  updatedAt: new Date().toISOString()
                }
              : chat
          );
          useAppStore.setState({ chats: updatedChats });
          
          // Send to server in background
        const { sendMessage } = useAppStore.getState();
          sendMessage(currentChat.id, messageContent, 'client').catch(error => {
            console.error('Error sending message:', error);
            // Optionally show error toast to user
          });
        } else {
          console.error("Failed to create or find chat for the client.");
        }
      } catch (error) {
        console.error('Error sending message:', error);
        // Optionally show error toast to user
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddOnServiceSubmit = async (selectedServices: string[]) => {
    console.log('Selected add-on services:', selectedServices);
    
    // Find the selected services
    const selectedServiceDetails = availableAddOnServices.filter(service => 
      selectedServices.includes(service.id)
    );
    
    const totalCost = selectedServiceDetails.reduce((total, service) => 
      total + parseFloat(service.price.replace('RM ', '')), 0
    );
    
    // Here you would typically send this data to your backend
    // For now, we'll just show a success message
    alert(`Add-on services requested successfully!\n\nServices: ${selectedServiceDetails.map(s => s.name).join(', ')}\nTotal Cost: RM ${totalCost.toFixed(2)}\n\nOur team will contact you shortly to process your request.`);
    
    // You could also create a new invoice or request record here
    // await createAddOnRequest(selectedServiceDetails);
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

  // Show Progress Tracker
  if (showProgressTracker) {
    return (
      <ClientProgressTracker
        clientId={client.id.toString()}
        onBack={() => setShowProgressTracker(false)}
      />
    );
  }

  // Show Package Components
  if (showPackageComponents) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPackageComponents(false)}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                  <Package className="w-6 h-6 text-orange-600" />
                  <span>Package Components</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
              <p className="text-slate-600 mb-2">Current Package:</p>
              <h2 className="text-2xl font-bold text-slate-900">{actualPackageName}</h2>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">List of modules you have access to</h3>
              <div className="space-y-3">
                {components.map((component, index) => (
                  <div key={component.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <Package className="w-5 h-5 text-slate-600" />
                      <div>
                        <span className="font-medium text-slate-900">No. {index + 1} - {component.name}</span>
                        <p className="text-sm text-slate-600">{component.price}</p>
                      </div>
                    </div>
                    {component.active && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                ))}
                {components.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No components assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Billing
  if (showBilling) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBilling(false)}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">My Billing</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-slate-700">Name: </span>
                <span className="text-slate-900">{client.name}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Email: </span>
                <span className="text-slate-900">evodagang.malaysia@gmail.com</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Phone: </span>
                <span className="text-slate-900">0393880531</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Registered Package: </span>
                <span className="text-slate-900">{actualPackageName}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Check your invoices & payment status</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-slate-700">Total Invoiced: </span>
                <span className="text-slate-900">RM {totalAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Total Paid: </span>
                <span className="text-green-600">RM {paidAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Balance: </span>
                <span className="text-red-600">RM {dueAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Invoice & Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Invoice & Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Package</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Paid</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Due</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 px-4 text-slate-900">{invoice.packageName}</td>
                      <td className="py-3 px-4 text-slate-900">RM {invoice.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-green-600">RM {invoice.paid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-red-600">RM {invoice.due.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Payment Details */}
            {payments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-slate-900 mb-3">Payment Details</h4>
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">RM {payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-600">{payment.paymentSource} • {new Date(payment.paidAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Need help? Contact us
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show View Appointments
  if (showViewAppointments) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowViewAppointments(false)}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  <span>View Appointments</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Appointments</h3>
            {clientEvents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Time</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {clientEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="py-3 px-4 text-slate-900">{event.title}</td>
                        <td className="py-3 px-4 text-slate-600">{new Date(event.startDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-slate-600">{event.startTime} - {event.endTime}</td>
                        <td className="py-3 px-4 text-slate-600">{event.description || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {event.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No appointments scheduled</p>
                <p className="text-sm">Contact support to schedule an appointment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                Hai, {client.name} 👋
              </h1>
              <p className="text-slate-600 text-sm lg:text-base">Welcome to your client portal</p>
          </div>
          <button 
            onClick={onBack}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Progress Tracking */}
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowProgressTracker(true)}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Progress Tracking</h3>
              <p className="text-sm text-slate-600 mb-3">View your onboarding journey</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{progressPercentage}% Complete</p>
            </div>
          </div>

          {/* Package Component */}
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowPackageComponents(true)}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Package Components</h3>
              <p className="text-sm text-slate-600 mb-3">List of modules you have access to</p>
              <div className="text-lg font-bold text-green-600">{components.length}</div>
              <p className="text-xs text-slate-500">Active Components</p>
            </div>
          </div>

          {/* My Billing */}
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowBilling(true)}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">My Billing</h3>
              <p className="text-sm text-slate-600 mb-3">Check your invoices & payment status</p>
              <div className="text-lg font-bold text-purple-600">RM {Number(dueAmount).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-slate-500">Outstanding</p>
            </div>
          </div>

          {/* View Appointments */}
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowViewAppointments(true)}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">View Appointments</h3>
              <p className="text-sm text-slate-600 mb-3">View your scheduled appointments</p>
              <div className="flex items-center justify-center text-orange-600">
                <Eye className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">View Appointments</span>
              </div>
            </div>
          </div>

          {/* Add-On Services */}
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowAddOnModal(true)}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Add-On Services</h3>
              <p className="text-sm text-slate-600 mb-3">Enhance your package with additional services</p>
              <div className="flex items-center justify-center text-purple-600">
                <Plus className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Browse Services</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Need Help */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-600">Contact us for assistance</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Phone Support</p>
                  <p className="text-xs text-slate-600">03 9388 0531</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email Support</p>
                  <p className="text-xs text-slate-600">evodagang.malaysia@gmail.com</p>
                </div>
              </div>
              
              {clientChat && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Live Chat</p>
                    <p className="text-xs text-blue-700">
                      {clientChat.unread_count > 0 ? `${clientChat.unread_count} new messages` : 'No new messages'}
                    </p>
                  </div>
                  {clientChat.unread_count > 0 && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{clientChat.unread_count}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-96">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  AT
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Ahmad Tech Solutions</h3>
                  <p className="text-sm text-slate-500">Online</p>
                </div>
              </div>
              {/* Chat action buttons removed - keeping only essential functional elements */}
            </div>

            {/* Messages */}
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
              <div className="flex items-center space-x-2">
                {/* Removed non-functional attachment and emoji buttons */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={!clientChat}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !clientChat}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default ClientDashboard;