import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Package, DollarSign, Phone, Mail, Send } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { useToast } from '../../hooks/useToast';

interface ClientPortalDashboardProps {
  user: any;
  onBack: () => void;
}

// Helper function to get file icon
function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>;
  }
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>;
}

// Helper function to format file size
function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const ClientPortalDashboard: React.FC<ClientPortalDashboardProps> = ({ user, onBack }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Tambah loading state ringan
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch add-on services and client service requests on component mount (background)
  useEffect(() => {
    // Tunda fetch supaya tidak block paparan utama
    setTimeout(() => {
      fetchAddOnServices();
      fetchClientServiceRequests();
    }, 500);
  }, [fetchAddOnServices, fetchClientServiceRequests]);

  const { 
    clients, 
    chats,
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
    getClientRole,
    getProgressStepsByClientId,
    getComponentsByClientId,
    getInvoicesByClientId
  } = useAppStore();

  const client = clients.length > 0 ? clients[0] : null;

  // Effect to manage user's online status
  useEffect(() => {
    const chat = chats.find(c => c.clientId === client?.id);
    if (chat) {
      updateChatOnlineStatus(chat.id, true);

      // Set to offline on component unmount
      return () => {
        updateChatOnlineStatus(chat.id, false);
      };
    }
  }, [client, chats, updateChatOnlineStatus]);

  // Fetch data when component mounts to ensure sync with admin
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load essential data first (client info and basic progress)
        await Promise.all([
          fetchClients(),
          fetchProgressSteps(),
          fetchComponents(),
          fetchInvoices(),
          fetchPayments()
        ]);
        setIsLoading(false); // Paparan utama boleh render
        // Load non-critical data in background
        setTimeout(() => {
          fetchChats();
          fetchCalendarEvents();
        }, 500);
      } catch (error) {
        setIsLoading(false);
        console.error("Failed to fetch essential client portal data:", error);
      }
    };
    fetchData();
  }, [fetchClients, fetchProgressSteps, fetchComponents, fetchInvoices, fetchPayments, fetchChats, fetchCalendarEvents]);

  // If a client is logged in, the clients array should contain exactly one client.
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
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
  const clientChat = chats.find(chat => chat.clientId === client.id);

  // Calculate progress using consistent calculation from store
  const progressStatus = calculateClientProgressStatus(client.id);
  const { percentage: progressPercentage } = progressStatus;

  // Calculate billing summary
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paid, 0);
  const dueAmount = invoices.reduce((sum, inv) => sum + inv.due, 0);

  // Get the actual package name from invoices if available
  const actualPackageName = invoices.length > 0 ? invoices[0].packageName : 'No Package Assigned';
  const activeComponents = components.filter(c => c.active);

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !client || isSending) return;

    setIsSending(true);
    setIsUploading(true);
    
    try {
      let currentChat = chats.find(chat => chat.clientId === client.id);
      
        // If no chat exists, create one
        if (!currentChat) {
          await createChatForClient(client.id);
          // Re-fetch chats to get the new chat ID
          const newChats = useAppStore.getState().chats;
          currentChat = newChats.find(chat => chat.clientId === client.id);
        }

        if (currentChat) {
        let attachmentUrl: string | undefined;
        let messageType: 'text' | 'file' | 'image' = 'text';
        let attachmentName: string | undefined;
        let attachmentType: string | undefined;
        let attachmentSize: number | undefined;

        // Upload file if selected
        if (selectedFile) {
          attachmentUrl = await uploadFile(selectedFile);
          attachmentName = selectedFile.name;
          attachmentType = selectedFile.type;
          attachmentSize = selectedFile.size;
          
          // Determine message type
          if (selectedFile.type.startsWith('image/')) {
            messageType = 'image';
          } else {
            messageType = 'file';
          }
        }

        // Send message with attachment
        await sendMessage(currentChat.id, message.trim() || (selectedFile ? `Sent ${selectedFile.name}` : ''), 'client', {
          messageType,
          attachmentUrl,
          attachmentName,
          attachmentType,
          attachmentSize
        });

        // Clear input and file
        setMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

          // Reload messages for the chat to show the new one
          await loadChatMessages(currentChat.id);
        } else {
          console.error("Failed to create or find chat for the client.");
        }
      } catch (error) {
        console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      // Generate upload URL
      const response = await fetch('/api/generate-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate upload URL');
      }

      const { uploadUrl, publicUrl } = await response.json();

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleFileDownload = (attachmentUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddOnServiceSubmit = async (selectedServices: string[]) => {
    console.log('Selected add-on services:', selectedServices);
    
    if (!client) {
      error('Client Error', 'Client information not available. Please contact support.');
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
      
      success(
        'Add-on Services Requested!',
        `Services: ${selectedServiceDetails.map(s => s.name).join(', ')}\nTotal Cost: RM ${totalCost.toFixed(2)}\n\nOur team will review your request and contact you shortly.`
      );
      
      // Refresh client service requests to show the new request
      await fetchClientServiceRequests();
      
    } catch (err) {
      console.error('Error submitting add-on services:', err);
      error('Request Failed', 'Failed to submit add-on services. Please try again or contact support.');
    }
  };

  // Show Progress Tracker
  // if (showProgressTracker) { // This state was removed
  //   return (
  //     <ClientProgressTracker
  //       clientId={client.id.toString()}
  //       onBack={() => setShowProgressTracker(false)}
  //     />
  //   );
  // }

  // Show Package Components
  // if (showPackageComponents) { // This state was removed
  //   return (
  //     <div className="min-h-screen bg-slate-50">
  //       <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
  //         <div className="max-w-7xl mx-auto flex items-center justify-between">
  //           <div className="flex items-center space-x-4">
  //             <button
  //               onClick={() => setShowPackageComponents(false)}
  //               className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
  //             >
  //               <ArrowLeft className="w-5 h-5" />
  //               <span className="font-medium">Back</span>
  //             </button>
  //             <div>
  //               <h1 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center space-x-2">
  //                 <Package className="w-6 h-6 text-orange-600" />
  //                 <span>My Packages</span>
  //               </h1>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="max-w-4xl mx-auto p-4 lg:p-8">
  //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  //           <div className="mb-6">
  //             <p className="text-slate-600 mb-2">Current Package :</p>
  //             <h2 className="text-2xl font-bold text-slate-900">{actualPackageName}</h2>
  //           </div>

  //           <div className="mb-6">
  //             <h3 className="text-lg font-semibold text-slate-900 mb-4">List of Components</h3>
  //             <div className="space-y-3">
  //               {components.map((component, index) => (
  //                 <div key={component.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
  //                   <div className="flex items-center space-x-3">
  //                     <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
  //                       <span className="text-xs font-bold text-blue-600">{index + 1}</span>
  //                     </div>
  //                     <Package className="w-5 h-5 text-slate-600" />
  //                     <div>
  //                       <span className="font-medium text-slate-900">No. {index + 1} - {component.name}</span>
  //                       <p className="text-sm text-slate-600">{component.price}</p>
  //                     </div>
  //                     {component.active && (
  //                       <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
  //                         Completed
  //                       </span>
  //                     )}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Show Billing
  // if (showBilling) { // This state was removed
  //   return (
  //     <div className="min-h-screen bg-slate-50">
  //       <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
  //         <div className="max-w-7xl mx-auto flex items-center justify-between">
  //           <div className="flex items-center space-x-4">
  //             <button
  //               onClick={() => setShowBilling(false)}
  //               className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
  //             >
  //               <ArrowLeft className="w-5 h-5" />
  //               <span className="font-medium">Back</span>
  //             </button>
  //             <div>
  //               <h1 className="text-xl lg:text-2xl font-bold text-slate-900">My Account & Billing</h1>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
  //         {/* Account Information */}
  //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  //           <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
  //           <div className="space-y-3">
  //             <div>
  //               <span className="font-medium text-slate-700">Name: </span>
  //               <span className="text-slate-900">{client.name}</span>
  //             </div>
  //             <div>
  //               <span className="font-medium text-slate-700">Email: </span>
  //               <span className="text-slate-900">{client.email}</span>
  //             </div>
  //             <div>
  //               <span className="font-medium text-slate-700">Phone: </span>
  //               <span className="text-slate-900">{client.phone || 'Not provided'}</span>
  //             </div>
  //             <div>
  //               <span className="font-medium text-slate-700">Business: </span>
  //               <span className="text-slate-900">{client.businessName}</span>
  //             </div>
  //             <div>
  //               <span className="font-medium text-slate-700">Registered Package: </span>
  //               <span className="text-slate-900">{actualPackageName}</span>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Payment Summary */}
  //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  //           <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Summary</h3>
  //           <div className="space-y-3">
  //             <div>
  //               <span className="font-medium text-slate-700">Total Invoiced: </span>
  //               <span className="text-slate-900">RM {totalAmount.toLocaleString()}</span>
  //             </div>
  //             <div>
  //               <span className="font-medium text-slate-700">Total Paid: </span>
  //               <span className="text-green-600">RM {paidAmount.toLocaleString()}</span>
  //             </div>
  //             <div>
  //               <span className="font-medium text-slate-700">Balance: </span>
  //               <span className="text-red-600">RM {dueAmount.toLocaleString()}</span>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Invoice & Payment History */}
  //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  //           <h3 className="text-lg font-semibold text-slate-900 mb-4">Invoice & Payment History</h3>
  //           <div className="overflow-x-auto">
  //             <table className="w-full">
  //               <thead className="bg-slate-50 border-b border-slate-200">
  //                 <tr>
  //                   <th className="text-left py-3 px-4 font-medium text-slate-900">Invoice</th>
  //                   <th className="text-left py-3 px-4 font-medium text-slate-900">Amount</th>
  //                   <th className="text-left py-3 px-4 font-medium text-slate-900">Date</th>
  //                   <th className="text-left py-3 px-4 font-medium text-slate-900">Payment</th>
  //                   <th className="text-left py-3 px-4 font-medium text-slate-900">Receipt</th>
  //                   <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
  //                 </tr>
  //               </thead>
  //               <tbody className="divide-y divide-slate-200">
  //                 {invoices.map((invoice) => (
  //                   <tr key={invoice.id}>
  //                     <td className="py-3 px-4 text-slate-900">{invoice.packageName || 'Package Invoice'}</td>
  //                     <td className="py-3 px-4 text-slate-900">RM {invoice.amount.toLocaleString()}</td>
  //                     <td className="py-3 px-4 text-slate-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
  //                     <td className="py-3 px-4 text-slate-900">RM {invoice.paid.toLocaleString()}</td>
  //                     <td className="py-3 px-4 text-slate-600">-</td>
  //                     <td className="py-3 px-4">
  //                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
  //                         invoice.paid >= invoice.amount ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
  //                       }`}>
  //                         {invoice.paid >= invoice.amount ? 'Paid' : 'Partial'}
  //                       </span>
  //                     </td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Show View Appointments
  // if (showViewAppointments) { // This state was removed
  //   const clientEvents = calendarEvents.filter(event => event.clientId === client.id);
    
  //   return (
  //     <div className="min-h-screen bg-slate-50">
  //       <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
  //         <div className="max-w-7xl mx-auto flex items-center justify-between">
  //           <div className="flex items-center space-x-4">
  //             <button
  //               onClick={() => setShowViewAppointments(false)}
  //               className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
  //             >
  //               <ArrowLeft className="w-5 h-5" />
  //               <span className="font-medium">Back</span>
  //             </button>
  //             <div>
  //               <h1 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center space-x-2">
  //                 <Package className="w-6 h-6 text-orange-600" />
  //                 <span>View Appointments</span>
  //               </h1>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="max-w-4xl mx-auto p-4 lg:p-8">
  //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  //           <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Appointments</h3>
  //           {clientEvents.length > 0 ? (
  //             <div className="overflow-x-auto">
  //               <table className="w-full">
  //                 <thead className="bg-slate-50 border-b border-slate-200">
  //                   <tr>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Title</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Date</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Time</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Description</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Type</th>
  //                   </tr>
  //                 </thead>
  //                 <tbody className="divide-y divide-slate-200">
  //                   {clientEvents.map((event) => (
  //                     <tr key={event.id}>
  //                       <td className="py-3 px-4 text-slate-900">{event.title}</td>
  //                       <td className="py-3 px-4 text-slate-600">{new Date(event.startDate).toLocaleDateString()}</td>
  //                       <td className="py-3 px-4 text-slate-600">{event.startTime} - {event.endTime}</td>
  //                       <td className="py-3 px-4 text-slate-600">{event.description || '-'}</td>
  //                       <td className="py-3 px-4">
  //                         <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
  //                           {event.type}
  //                         </span>
  //                       </td>
  //                     </tr>
  //                   ))}
  //                 </tbody>
  //               </table>
  //             </div>
  //           ) : (
  //             <div className="text-center py-8 text-slate-500">
  //               <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
  //               <p>No appointments scheduled</p>
  //               <p className="text-sm">Contact support to schedule an appointment</p>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Show My Requests
  // if (showMyRequests) { // This state was removed
  //   const clientRequests = getClientServiceRequestsByClientId(client.id);
    
  //   return (
  //     <div className="min-h-screen bg-slate-50">
  //       <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
  //         <div className="max-w-7xl mx-auto flex items-center justify-between">
  //           <div className="flex items-center space-x-4">
  //             <button
  //               onClick={() => setShowMyRequests(false)}
  //               className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
  //             >
  //               <ArrowLeft className="w-5 h-5" />
  //               <span className="font-medium">Back</span>
  //             </button>
  //             <div>
  //               <h1 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center space-x-2">
  //                 <Clock className="w-6 h-6 text-indigo-600" />
  //                 <span>My Add-On Service Requests</span>
  //               </h1>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="max-w-4xl mx-auto p-4 lg:p-8">
  //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  //           <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Service Requests</h3>
  //           {clientRequests.length > 0 ? (
  //             <div className="overflow-x-auto">
  //               <table className="w-full">
  //                 <thead className="bg-slate-50 border-b border-slate-200">
  //                   <tr>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Service</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Category</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Price</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Request Date</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
  //                     <th className="text-left py-3 px-4 font-medium text-slate-900">Notes</th>
  //                   </tr>
  //                 </thead>
  //                 <tbody className="divide-y divide-slate-200">
  //                   {clientRequests.map((request) => {
  //                     const service = addOnServices.find(s => s.id === request.service_id);
  //                     return (
  //                       <tr key={request.id}>
  //                         <td className="py-3 px-4 text-slate-900">
  //                           <div>
  //                             <div className="font-medium">{service?.name || 'Unknown Service'}</div>
  //                             <div className="text-sm text-slate-600">{service?.description || ''}</div>
  //                           </div>
  //                         </td>
  //                         <td className="py-3 px-4 text-slate-600">{service?.category || '-'}</td>
  //                         <td className="py-3 px-4 text-slate-900">RM {service?.price?.toLocaleString() || '0'}</td>
  //                         <td className="py-3 px-4 text-slate-600">
  //                           {new Date(request.request_date).toLocaleDateString()}
  //                         </td>
  //                         <td className="py-3 px-4">
  //                           <span className={`px-2 py-1 text-xs font-medium rounded-full ${
  //                             request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
  //                             request.status === 'Approved' ? 'bg-green-100 text-green-700' :
  //                             request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
  //                             request.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
  //                             'bg-slate-100 text-slate-700'
  //                           }`}>
  //                             {request.status}
  //                           </span>
  //                         </td>
  //                         <td className="py-3 px-4 text-slate-600">
  //                           {request.admin_notes || request.rejection_reason || '-'}
  //                         </td>
  //                       </tr>
  //                     );
  //                   })}
  //                 </tbody>
  //               </table>
  //             </div>
  //           ) : (
  //             <div className="text-center py-8 text-slate-500">
  //               <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
  //               <p>No service requests found</p>
  //               <p className="text-sm">You haven't requested any add-on services yet</p>
  //               <button
  //                 onClick={() => {
  //                   setShowMyRequests(false);
  //                   setShowAddOnModal(true);
  //                 }}
  //                 className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
  //               >
  //                 Request Add-On Services
  //               </button>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                Hai, {client?.name || 'Client'} 👋
              </h1>
              <p className="text-slate-600 mt-1 lg:mt-2 text-sm lg:text-base">Welcome to your client portal</p>
            </div>
        </div>
            </div>
          </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Your Client Portal</h2>
            <p className="text-slate-600">Manage your project progress, view packages, and stay connected with our team.</p>
            </div>
          </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Progress</h3>
                <p className="text-sm text-slate-600">{progressPercentage}% Complete</p>
            </div>
          </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Packages</h3>
                <p className="text-sm text-slate-600">{activeComponents.length} Active</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-slate-900">{actualPackageName}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Billing</h3>
                <p className="text-sm text-slate-600">Outstanding</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-red-600">RM {dueAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
                <div>
                <p className="font-medium text-slate-900">Phone Support</p>
                <p className="text-sm text-slate-600">03 9388 0531</p>
                </div>
              </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
                <div>
                <p className="font-medium text-slate-900">Email Support</p>
                <p className="text-sm text-slate-600">evodagang.malaysia@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

        {/* Chat Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                SA
                </div>
                <div>
                <h3 className="font-semibold text-slate-900">Sambal King</h3>
                <p className="text-sm text-green-600">Online</p>
                </div>
              </div>
            </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
              {clientChat && clientChat.messages && clientChat.messages.length > 0 ? (
              <div className="space-y-3">
                {clientChat.messages.slice(-3).map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.sender === 'client' 
                          ? 'bg-blue-500 text-white'
                        : 'bg-white text-slate-900 border border-slate-200'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      {message.attachment_url && (
                        <div className="mt-2">
                          {message.message_type === 'image' ? (
                            <img 
                              src={message.attachment_url} 
                              alt="Attachment" 
                              className="w-20 h-20 object-cover rounded"
                            />
                          ) : (
                            <button
                              onClick={() => handleFileDownload(message.attachment_url!, message.attachment_name || 'file')}
                              className="text-xs underline hover:no-underline"
                            >
                              📎 {message.attachment_name || 'Download File'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
            ) : (
              <p className="text-slate-500 text-sm">No messages yet. Start a conversation!</p>
              )}
            </div>

              <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                <button
                  onClick={handleSendMessage}
              disabled={isSending || (!message.trim() && !selectedFile)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
              {isSending ? 'Sending...' : 'Send'}
                </button>
          </div>
        </div>
      </div>

      {/* Admin Links Modal */}


      {/* Add-On Service Modal */}
      {/* <AddOnServiceModal // This component was removed
        isOpen={showAddOnModal}
        onClose={() => setShowAddOnModal(false)}
        onSubmit={handleAddOnServiceSubmit}
        availableServices={availableAddOnServices}
      /> */}
    </div>
  );
};

export default ClientPortalDashboard;