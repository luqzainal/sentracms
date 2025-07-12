import React, { useState } from 'react';
import { ArrowLeft, Edit, Plus, Trash2, Calendar, FileText, CreditCard, User, Mail, Phone, Building, MapPin, Clock, X, Package } from 'lucide-react';
import AddInvoiceModal from './AddInvoiceModal';
import AddPaymentModal from './AddPaymentModal';
import AddComponentModal from './AddComponentModal';
import AddEventModal from './AddEventModal';
import ClientModal from './ClientModal';
import { useAppStore } from '../../store/AppStore';

interface ClientProfileProps {
  clientId: string;
  onBack: () => void;
  onEdit: (client: any) => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ clientId, onBack, onEdit }) => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { 
    getClientById, 
    getInvoicesByClientId, 
    getPaymentsByClientId,
    getComponentsByClientId,
    calendarEvents,
    updateClient,
    addInvoice,
    deleteInvoice,
    addPayment,
    addComponent,
    addCalendarEvent,
    deleteComponent,
    deleteCalendarEvent,
    copyComponentsToProgressSteps
  } = useAppStore();

  const client = getClientById(parseInt(clientId));
  const invoices = getInvoicesByClientId(parseInt(clientId));
  const payments = getPaymentsByClientId(parseInt(clientId));
  const components = getComponentsByClientId(parseInt(clientId));
  const clientEvents = calendarEvents.filter(event => event.clientId === parseInt(clientId));

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Client not found</h2>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = (clientData: any) => {
    updateClient(client.id, clientData);
    setShowEditModal(false);
  };

  const handleSaveInvoice = (invoiceData: any) => {
    addInvoice({
      ...invoiceData,
      clientId: client.id,
      amount: parseFloat(invoiceData.totalAmount.replace(/[^\d.]/g, '')),
      paid: 0,
      due: parseFloat(invoiceData.totalAmount.replace(/[^\d.]/g, '')),
      status: 'Pending',
      createdAt: invoiceData.invoiceDate
    });
    setShowInvoiceModal(false);
  };

  const handleSavePayment = (paymentData: any) => {
    const invoice = invoices[0]; // For demo, use first invoice
    if (invoice) {
      addPayment({
        ...paymentData,
        clientId: client.id,
        invoiceId: invoice.id,
        amount: parseFloat(paymentData.amount.replace(/[^\d.]/g, '')),
        paidAt: paymentData.paidAt
      });
    }
    setShowPaymentModal(false);
  };

  const handleSaveComponent = (componentData: any) => {
    componentData.forEach((comp: any) => {
      addComponent({
        clientId: client.id,
        name: comp.name,
        price: 'RM 299.00',
        active: true
      });
    });
    
    // Auto-copy new components to progress steps
    setTimeout(() => {
      copyComponentsToProgressSteps(client.id);
    }, 100);
    
    setShowComponentModal(false);
  };

  const handleSaveEvent = (eventData: any) => {
    addCalendarEvent({
      ...eventData,
      clientId: client.id,
      type: 'meeting'
    });
    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteCalendarEvent(eventId);
    }
  };

  const handleDeleteComponent = (componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      // Delete only the specific component by its ID
      deleteComponent(componentId);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      deleteInvoice(invoiceId);
    }
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Profile</h1>
          </div>
        </div>
        <button
          onClick={handleEditProfile}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Client Name:</label>
              <p className="text-slate-900">{client.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Business Name:</label>
              <p className="text-slate-900">{client.businessName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email Address:</label>
              <p className="text-slate-900">{client.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Phone:</label>
              <p className="text-slate-900">{client.phone}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Status:</label>
              <p className="text-slate-900">{client.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Package Name:</label>
              <p className="text-slate-900">{client.packageName || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Tags:</label>
              {client.tags && client.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {client.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-900">No tags assigned</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Registered At:</label>
              <p className="text-slate-900">{client.registeredAt}</p>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Component Package</h3>
            </div>
            
            {/* Package Name Section */}
            {client.packageName && invoices.length > 0 ? (
              <div className="space-y-4">
                {/* Package Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">{client.packageName}</h4>
                        <p className="text-sm text-blue-700">Main Package</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowComponentModal(true)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Component</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Child Components - Only show if there are components */}
                {components.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {components.map((component) => (
                      <div key={component.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border-l-4 border-blue-300">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 text-slate-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-slate-900 text-sm">{component.name}</span>
                            <div className="text-xs text-slate-500">{component.price}</div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComponent(component.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No package assigned yet</p>
                <p className="text-sm">Create an invoice to automatically set up a package</p>
              </div>
            )}
          </div>
        </div>

          {/* Calendar Events */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Calendar Events</h3>
              </div>
              <button 
                onClick={() => setShowEventModal(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {clientEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{event.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors ml-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {clientEvents.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No events yet.
                </div>
              )}
            </div>
          </div>
      </div>

        {/* Right Column - Invoices */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Invoice</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {invoices.map((invoice, index) => (
                <div key={invoice.id} className="border border-slate-200 rounded-lg p-4 relative">
                  <button
                    onClick={() => handleDeleteInvoice(invoice.id)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Invoice"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{invoice.packageName}</h4>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-medium">RM {invoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Paid:</span>
                      <span className="text-green-600">RM {invoice.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Due:</span>
                      <span className="text-red-600">RM {invoice.due.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Payment Details */}
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Payment Details</span>
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + Add Payment
                      </button>
                    </div>
                  </div>
                )}
              ))}
              {invoices.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No invoices yet.
                </div>
              )}
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
        />
      )}

      {showComponentModal && (
        <AddComponentModal
          onClose={() => setShowComponentModal(false)}
          onSave={handleSaveComponent}
          clientId={client.id}
          packageName={client.packageName}
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
    </div>
  );
};

export default ClientProfile;