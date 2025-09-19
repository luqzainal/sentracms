import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/AppStore';
import { Client, Invoice, Payment, Component, CalendarEvent } from '../../store/AppStore';
import { Edit, Calendar, FileText, Package, Plus, Trash2, ArrowLeft, Download, X } from 'lucide-react';
import AddInvoiceModal from './AddInvoiceModal';
import AddPaymentModal from './AddPaymentModal';
import AddComponentModal from './AddComponentModal';
import ClientModal from './ClientModal';
import AddEventModal from './AddEventModal';
import EditInvoiceModal from './EditInvoiceModal';
import EditComponentModal from './EditComponentModal';
import EditEventModal from './EditEventModal';
import EditPaymentModal from './EditPaymentModal';
import ConfirmationModal from '../common/ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';

interface ClientProfileProps {
  clientId: string;
  onBack: () => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ clientId, onBack }) => {
  const {
    invoices,
    payments,
    components,
    calendarEvents,
    users,
    user,
    addInvoice,
    addPayment,
    addComponent,
    addComponents,
    updateClient,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getComponentsByInvoiceId,
    deleteInvoice,
    updateInvoice,
    deleteComponent,
    updateComponent,
    deletePayment,
    updatePayment,
    fetchClients,
    fetchInvoices,
    fetchPayments,
    fetchComponents,
    fetchCalendarEvents,
    fetchProgressSteps,
    fetchTags,
    fetchUsers

  } = useAppStore();

  // Custom confirmation modal
  const { confirmation, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  // All React hooks must be at the top level
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [showEditComponentModal, setShowEditComponentModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);

  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');


  // Memoize components by invoice to avoid repeated calls - must be before any conditional returns
  const componentsByInvoice = useMemo(() => {
    if (!client) return {};

    const result: { [invoiceId: string]: Component[] } = {};
    const clientInvoices = invoices.filter(invoice => invoice.clientId === client.id);

    clientInvoices.forEach(invoice => {
      result[invoice.id] = getComponentsByInvoiceId(invoice.id);
    });
    return result;
  }, [client, invoices, components, getComponentsByInvoiceId]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching clients...");
        await fetchClients();
        console.log("Fetching invoices...");
        await fetchInvoices();
        console.log("Fetching payments...");
        await fetchPayments();
        console.log("Fetching components...");
        await fetchComponents();
        console.log("Fetching calendar events...");
        await fetchCalendarEvents();
        console.log("Fetching progress steps...");
        await fetchProgressSteps();
        console.log("Fetching users...");
        await fetchUsers();
        console.log("All data fetched.");

        // After all data is fetched, find the client
        const foundClient = useAppStore.getState().clients.find(c => c.id === parseInt(clientId));
        setClient(foundClient || null);
      } catch (error) {
        console.error("Failed to load client profile data:", error);
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (clientId) {
      loadData();
    }
  }, [clientId, fetchClients, fetchInvoices, fetchPayments, fetchComponents, fetchCalendarEvents, fetchProgressSteps, fetchUsers]);


  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle case where client is not found AFTER loading
  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h1>
          <p className="text-gray-600 mb-4">The requested client could not be found.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }



  const clientInvoices = invoices.filter(invoice => invoice.clientId === client.id);
  const clientPayments = payments.filter(payment => payment.clientId === client.id);
  const clientEvents = calendarEvents.filter(event => event.clientId === client.id);

  // Get all package names from invoices
  const packageNames = clientInvoices.map(invoice => invoice.packageName).filter(Boolean);
  const displayPackageName = packageNames.length > 0 ? packageNames.join(', ') : 'No package assigned yet';

  const handleSaveInvoice = async (invoiceData: Partial<Invoice> & { invoiceDate?: string }) => {
    try {
      await addInvoice({
        clientId: client.id,
        packageName: invoiceData.packageName || '',
        amount: invoiceData.amount || 0,
        invoiceDate: invoiceData.invoiceDate || new Date().toISOString()
      });
      setShowInvoiceModal(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleSavePayment = async (paymentData: Partial<Payment>) => {
    if (selectedInvoiceForPayment) {
      try {
        await addPayment({
          ...paymentData,
          clientId: client.id,
          invoiceId: selectedInvoiceForPayment.id,
        } as Payment);
        setShowPaymentModal(false);
        setSelectedInvoiceForPayment(null);
      } catch (error) {
        console.error('Error saving payment:', error);
      }
    }
  };

  const handleSaveComponent = (componentData: Partial<Component>) => {
    if (showComponentModal && componentData) {
      // Check if componentData is an array (bulk add) or single component
      if (Array.isArray(componentData)) {
        // Bulk add components
        const componentsWithClientAndInvoice = componentData.map(comp => ({
          ...comp,
          clientId: client.id,
          invoiceId: showComponentModal,
        }));
        addComponents(componentsWithClientAndInvoice);
      } else {
        // Single component add
        addComponent({
          ...componentData,
          clientId: client.id,
          invoiceId: showComponentModal,
        } as Component);
      }
      setShowComponentModal(null);
    }
  };

  const handleSaveProfile = async (clientData: Partial<Client>) => {
    try {
      await updateClient(client.id, clientData);

      // Refresh client data and tags from database
      await Promise.all([
        fetchClients(),
        fetchTags()
      ]);

      // Update local client state with fresh data from database
      const updatedClient = useAppStore.getState().clients.find(c => c.id === parseInt(clientId));
      if (updatedClient) {
        setClient(updatedClient);
      }

      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    addCalendarEvent({
      ...eventData,
      clientId: client.id,
    } as CalendarEvent);
    setShowEventModal(false);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowEditInvoiceModal(true);
  };

  const handleSaveEditedInvoice = (invoiceData: Partial<Invoice>) => {
    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData);
      setShowEditInvoiceModal(false);
      setEditingInvoice(null);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    showConfirmation(
      () => deleteInvoice(invoiceId),
      {
        title: 'Delete Invoice',
        message: 'Are you sure you want to delete this invoice? This will also delete all related components.',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleEditComponent = (component: Component) => {
    setEditingComponent(component);
    setShowEditComponentModal(true);
  };

  const handleSaveEditedComponent = (componentData: Partial<Component>) => {
    if (editingComponent) {
      updateComponent(editingComponent.id, componentData);
      setShowEditComponentModal(false);
      setEditingComponent(null);
    }
  };

  const handleDeleteComponent = (componentId: string) => {
    showConfirmation(
      () => deleteComponent(componentId),
      {
        title: 'Delete Component',
        message: 'Are you sure you want to delete this component?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEditEventModal(true);
  };

  const handleSaveEditedEvent = (eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, eventData);
      setShowEditEventModal(false);
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    showConfirmation(
      () => deleteCalendarEvent(eventId),
      {
        title: 'Delete Event',
        message: 'Are you sure you want to delete this event?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowEditPaymentModal(true);
  };

  const handleSaveEditedPayment = (paymentData: Partial<Payment>) => {
    if (editingPayment) {
      updatePayment(editingPayment.id, paymentData);
      setShowEditPaymentModal(false);
      setEditingPayment(null);
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    showConfirmation(
      () => deletePayment(paymentId),
      {
        title: 'Delete Payment',
        message: 'Are you sure you want to delete this payment?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setShowReceiptViewer(true);
  };

  const handleDownloadReceipt = (receiptUrl: string, paymentId: string) => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `receipt-${paymentId}.pdf`;
    link.click();
  };

  //handle new package
  const handleCreatePackage = async () => {
    const packageName = prompt("Enter package name:");
    if (!packageName) return; // user cancelled or empty

    try {
      const newInvoice: Partial<Invoice> = {
        clientId: client.id,
        packageName,
        amount: 0, // default 0
        invoiceDate: new Date().toISOString(),
      };

      await addInvoice(newInvoice);
      await fetchInvoices(); // refresh
    } catch (error) {
      console.error("Error creating package:", error);
    }
  };


  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-gray-600">{client.businessName}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Client Name:</label>
                <p className="text-gray-900">{client.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Business Name:</label>
                <p className="text-gray-900">{client.businessName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address:</label>
                <p className="text-gray-900">{client.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone:</label>
                <p className="text-gray-900">{client.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status:</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${client.status === 'Complete' ? 'bg-green-100 text-green-800' :
                  client.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {client.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Package Name:</label>
                <p className="text-gray-900">{displayPackageName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">PIC:</label>
                <p className="text-gray-900">{client.pic || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tags:</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {client.tags && client.tags.length > 0 ? (
                    client.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No tags assigned</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Registered At:</label>
                <p className="text-gray-900">
                  {client.registeredAt ? new Date(client.registeredAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Components */}
          <div className="lg:col-span-2 space-y-6">
            {/* Component Package */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Component Package</h2>
                {clientInvoices.length !== 0 && (
                  <button
                    onClick={() => setShowAddPackageModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Package</span>
                  </button>
                )}
              </div>


              <div className="space-y-6">
                {clientInvoices.map((invoice) => (
                  <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                    {/* Package Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{invoice.packageName}</h3>
                        <p className="text-sm text-gray-500">Main Package</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowComponentModal(invoice.id)}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Component</span>
                    </button>

                    {/* Components List */}
                    <div className="space-y-2">
                      {(componentsByInvoice[invoice.id] || []).map((component) => (
                        <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{component.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditComponent(component)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComponent(component.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* modal package */}
                {showAddPackageModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Create Package</h2>
                        <button onClick={() => setShowAddPackageModal(false)}>
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={newPackageName}
                          onChange={(e) => setNewPackageName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          placeholder="Enter package name"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowAddPackageModal(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (!newPackageName.trim()) return;
                            try {
                              await addInvoice({
                                clientId: client.id,
                                packageName: newPackageName.trim(),
                                amount: 0,
                                invoiceDate: new Date().toISOString(),
                              });
                              await fetchInvoices();
                              setNewPackageName('');
                              setShowAddPackageModal(false);
                            } catch (error) {
                              console.error("Error creating package:", error);
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                {clientInvoices.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">No packages available.</p>
                    <button
                      onClick={() => setShowAddPackageModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Package</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Calendar Events */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Calendar Events
                </h3>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Event</span>
                </button>
              </div>

              {clientEvents.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clientEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No events yet.</p>
              )}
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Invoices
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Invoice</span>
                </button>
              </div>

              {clientInvoices.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clientInvoices.map((invoice) => (
                    <div key={invoice.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{invoice.packageName}</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-medium">RM {Number(invoice.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid:</span>
                          <span className="text-green-600">RM {Number(invoice.paid).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due:</span>
                          <span className="text-red-600">RM {Number(invoice.due).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">Payment Details</p>
                          <button
                            onClick={() => {
                              setSelectedInvoiceForPayment(invoice);
                              setShowPaymentModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            + Add Payment
                          </button>
                        </div>

                        {/* Payment Transactions */}
                        <div className="space-y-1">
                          {clientPayments
                            .filter(payment => payment.invoiceId === invoice.id)
                            .map((payment) => (
                              <div key={payment.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-green-800">
                                      RM {payment.amount.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-green-600">
                                      {new Date(payment.paidAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="text-xs text-green-600">
                                    {payment.paymentSource} • {payment.status}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {/* Receipt buttons */}
                                  {(payment.receiptFileUrl || payment.receiptUrl) && (
                                    <>
                                      <button
                                        onClick={() => handleViewReceipt(payment.receiptFileUrl || payment.receiptUrl || '')}
                                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded border border-green-200 hover:bg-green-200 transition-colors"
                                        title="View Receipt"
                                      >
                                        View Attachment
                                      </button>
                                      <button
                                        onClick={() => handleDownloadReceipt(payment.receiptFileUrl || payment.receiptUrl || '', payment.id)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Download Receipt"
                                      >
                                        <Download className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleEditPayment(payment)}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Edit Payment"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePayment(payment.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Delete Payment"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>

                        {clientPayments.filter(payment => payment.invoiceId === invoice.id).length === 0 && (
                          <p className="text-xs text-gray-400 italic">No payments recorded</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No invoices yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInvoiceModal && (
        <AddInvoiceModal
          onClose={() => setShowInvoiceModal(false)}
          onSave={handleSaveInvoice}
        />
      )}

      {showPaymentModal && (
        <AddPaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSave={handleSavePayment}
          selectedInvoice={selectedInvoiceForPayment || undefined}
        />
      )}

      {showComponentModal && (
        <AddComponentModal
          onClose={() => setShowComponentModal(null)}
          onSave={(componentData: ComponentData) => handleSaveComponent(componentData)}
          clientId={client.id}
          invoiceId={showComponentModal}
        />
      )}

      {showEditModal && (
        <ClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showEventModal && (
        <AddEventModal
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
        />
      )}

      {showEditInvoiceModal && editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          onClose={() => setShowEditInvoiceModal(false)}
          onSave={handleSaveEditedInvoice}
        />
      )}

      {showEditComponentModal && editingComponent && (
        <EditComponentModal
          component={editingComponent}
          onClose={() => setShowEditComponentModal(false)}
          onSave={handleSaveEditedComponent}
        />
      )}

      {showEditEventModal && editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setShowEditEventModal(false)}
          onSave={handleSaveEditedEvent}
        />
      )}

      {showEditPaymentModal && editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          onClose={() => setShowEditPaymentModal(false)}
          onSave={handleSaveEditedPayment}
        />
      )}

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



      {/* Receipt Viewer Modal */}
      {showReceiptViewer && selectedReceiptUrl && (
        <div className="fixed inset-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Receipt Viewer</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadReceipt(selectedReceiptUrl, 'receipt')}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                  title="Download Receipt"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowReceiptViewer(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-4 h-[calc(90vh-80px)] overflow-auto">
              {selectedReceiptUrl.endsWith('.pdf') ? (
                <iframe
                  src={selectedReceiptUrl}
                  className="w-full h-full border-0"
                  title="Receipt PDF"
                />
              ) : (
                <img
                  src={selectedReceiptUrl}
                  alt="Receipt"
                  className="w-full h-auto max-h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ClientProfile;