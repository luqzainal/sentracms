import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, DollarSign, HelpCircle, Package, Eye, CheckCircle, Phone, Mail, Plus } from 'lucide-react';
import ClientProgressTracker from '../Clients/ClientProgressTracker';
import AddOnServiceModal from '../common/AddOnServiceModal';
import EventPopup from '../common/EventPopup';
import { useAppStore, CalendarEvent } from '../../store/AppStore';

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

  // State untuk kalendar
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);

  const { addOnServices, fetchAddOnServices, addClientServiceRequest } = useAppStore();

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

  // Fetch add-on services on component mount
  useEffect(() => {
    fetchAddOnServices();
  }, [fetchAddOnServices]);

  const { 
    clients, 
    getProgressStepsByClientId, 
    getComponentsByClientId,
    getInvoicesByClientId,
    getPaymentsByClientId,
    calendarEvents,
    fetchClients,
    fetchProgressSteps,
    fetchComponents,
    fetchInvoices,
    fetchPayments,
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
    fetchCalendarEvents();
    
    // Start polling for real-time updates
    if (!isPolling) {
      startPolling();
    }
    
    // Cleanup function to stop polling when component unmounts
    return () => {
      stopPolling();
    };
  }, [fetchClients, fetchProgressSteps, fetchComponents, fetchInvoices, fetchPayments, fetchCalendarEvents, startPolling, stopPolling, isPolling]);

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

  // Filter event appointment untuk client ini sahaja
  const clientAppointments = calendarEvents.filter(e => e.clientId === client.id);

  // Handler klik event
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventPopup(true);
  };

  const closeEventPopup = () => {
    setShowEventPopup(false);
    setSelectedEvent(null);
  };

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
            </div>
          </div>
          {/* Paparan Kalendar Appointment */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button onClick={() => setCalendarView('month')} className={`px-3 py-1 rounded-lg text-sm ${calendarView === 'month' ? 'bg-blue-100 text-blue-700' : ''}`}>Bulan</button>
                <button onClick={() => setCalendarView('week')} className={`px-3 py-1 rounded-lg text-sm ${calendarView === 'week' ? 'bg-blue-100 text-blue-700' : ''}`}>Minggu</button>
                <button onClick={() => setCalendarView('day')} className={`px-3 py-1 rounded-lg text-sm ${calendarView === 'day' ? 'bg-blue-100 text-blue-700' : ''}`}>Hari</button>
              </div>
            </div>
            {/* Paparan grid kalendar ikut view */}
            {/* Untuk ringkas, hanya tunjuk event dalam bentuk list ikut view yang dipilih */}
            {calendarView === 'month' && (
              <div>
                <h3 className="font-semibold mb-2">Senarai Appointment Bulan Ini</h3>
                <ul className="space-y-2">
                  {clientAppointments.filter(e => new Date(e.startDate).getMonth() === new Date().getMonth()).map(e => (
                    <li key={e.id} className="p-3 border rounded cursor-pointer hover:bg-blue-50" onClick={() => handleEventClick(e)}>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-slate-500">{e.startDate} {e.startTime} - {e.endDate} {e.endTime}</div>
                    </li>
                  ))}
                  {clientAppointments.filter(e => new Date(e.startDate).getMonth() === new Date().getMonth()).length === 0 && (
                    <li className="text-slate-400">Tiada appointment bulan ini.</li>
                  )}
                </ul>
              </div>
            )}
            {calendarView === 'week' && (
              <div>
                <h3 className="font-semibold mb-2">Senarai Appointment Minggu Ini</h3>
                <ul className="space-y-2">
                  {clientAppointments.filter(e => {
                    const now = new Date();
                    const start = new Date(e.startDate);
                    const end = new Date(e.endDate);
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return (start >= weekStart && start <= weekEnd) || (end >= weekStart && end <= weekEnd);
                  }).map(e => (
                    <li key={e.id} className="p-3 border rounded cursor-pointer hover:bg-blue-50" onClick={() => handleEventClick(e)}>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-slate-500">{e.startDate} {e.startTime} - {e.endDate} {e.endTime}</div>
                    </li>
                  ))}
                  {clientAppointments.filter(e => {
                    const now = new Date();
                    const start = new Date(e.startDate);
                    const end = new Date(e.endDate);
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return (start >= weekStart && start <= weekEnd) || (end >= weekStart && end <= weekEnd);
                  }).length === 0 && (
                    <li className="text-slate-400">Tiada appointment minggu ini.</li>
                  )}
                </ul>
              </div>
            )}
            {calendarView === 'day' && (
              <div>
                <h3 className="font-semibold mb-2">Senarai Appointment Hari Ini</h3>
                <ul className="space-y-2">
                  {clientAppointments.filter(e => {
                    const now = new Date();
                    const start = new Date(e.startDate);
                    const end = new Date(e.endDate);
                    return (start.toDateString() === now.toDateString()) || (end.toDateString() === now.toDateString());
                  }).map(e => (
                    <li key={e.id} className="p-3 border rounded cursor-pointer hover:bg-blue-50" onClick={() => handleEventClick(e)}>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-slate-500">{e.startDate} {e.startTime} - {e.endDate} {e.endTime}</div>
                    </li>
                  ))}
                  {clientAppointments.filter(e => {
                    const now = new Date();
                    const start = new Date(e.startDate);
                    const end = new Date(e.endDate);
                    return (start.toDateString() === now.toDateString()) || (end.toDateString() === now.toDateString());
                  }).length === 0 && (
                    <li className="text-slate-400">Tiada appointment hari ini.</li>
                  )}
                </ul>
              </div>
            )}
            {/* Popup info appointment */}
            {showEventPopup && selectedEvent && (
              <EventPopup event={selectedEvent} clients={clients} onClose={closeEventPopup} onEdit={() => {}} onDelete={() => {}} />
            )}
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