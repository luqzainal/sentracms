import React, { useState } from 'react';
import { ArrowLeft, Edit, Plus, Trash2, Calendar, FileText, CreditCard, User, Mail, Phone, Building, MapPin, Clock } from 'lucide-react';
import AddInvoiceModal from './AddInvoiceModal';
import AddPaymentModal from './AddPaymentModal';
import AddComponentModal from './AddComponentModal';
import AddEventModal from './AddEventModal';
import ClientModal from './ClientModal';

interface ClientProfileProps {
  clientId: string;
  onBack: () => void;
  onEdit: (client: any) => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ clientId, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState('components');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock client data - in real app, this would be fetched based on clientId
  const client = {
    id: clientId,
    name: 'Syazwani binti Jamali',
    businessName: 'Syazwani Tech Solutions',
    email: 'syazwani@gmail.com',
    phone: '0193721960',
    status: 'complete',
    pic: 'Ahmad Razak',
    registeredAt: '2025-07-09 10:44:34',
    company: 'Tech Solutions Sdn Bhd',
    address: 'Jalan Sultanah Zainab, Kota Bharu, Kelantan',
    notes: 'VIP client with multiple ongoing projects'
  };

  const components = [
    { id: 1, name: 'Akses 12 Month Sistem Kuasa', active: true, price: 'RM 299.00' },
    { id: 2, name: 'Akses 12 Month Sistem Telah AI', active: true, price: 'RM 199.00' },
    { id: 3, name: 'Akses 12 Month Group Support Kuasa', active: true, price: 'RM 99.00' },
    { id: 4, name: 'Akses 12 Month Group Support Telah AI', active: false, price: 'RM 99.00' },
    { id: 5, name: 'Executive Kuasa Workshop: Step by Step Weekly', active: false, price: 'RM 499.00' },
    { id: 6, name: 'Group Onboarding Coaching (1 Sessions)', active: false, price: 'RM 299.00' },
    { id: 7, name: '3 Month Online Session with Kuasa Expert', active: false, price: 'RM 799.00' }
  ];

  const invoices = [
    {
      id: 'Kuasa 360',
      amount: 'RM9,997.00',
      paid: 'RM3,000.00',
      due: 'RM6,997.00',
      status: 'Partial'
    }
  ];

  const calendarEvents = [];

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = (clientData: any) => {
    console.log('Saving client profile:', clientData);
    setShowEditModal(false);
    // Here you would typically update the client data
  };

  const handleAddInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleAddPayment = () => {
    setShowPaymentModal(true);
  };

  const handleAddComponent = () => {
    setShowComponentModal(true);
  };

  const handleSaveComponent = (componentData: any) => {
    console.log('Saving components:', componentData);
    setShowComponentModal(false);
    // Here you would typically save to your backend
  };

  const handleSaveEvent = (eventData: any) => {
    console.log('Saving event:', eventData);
    setShowEventModal(false);
    // Here you would typically save to your backend
  };

  const handleSaveInvoice = (invoiceData: any) => {
    console.log('Saving invoice:', invoiceData);
    setShowInvoiceModal(false);
    // Here you would typically save to your backend
  };

  const handleSavePayment = (paymentData: any) => {
    console.log('Saving payment:', paymentData);
    setShowPaymentModal(false);
    // Here you would typically save to your backend
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
              <label className="text-sm font-medium text-slate-600">PIC:</label>
              <p className="text-slate-900">{client.pic}</p>
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
              <button
                onClick={handleAddComponent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Component</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {components.map((component) => (
                <div key={component.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-slate-900">{component.name}</span>
                      <div className="text-sm text-slate-500">{component.price}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
            <div className="text-center py-8 text-slate-500">
              No events yet.
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
                onClick={handleAddInvoice}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Invoice</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {invoices.map((invoice, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{invoice.id}</h4>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-500 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-medium">{invoice.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Paid:</span>
                      <span className="text-green-600">{invoice.paid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Due:</span>
                      <span className="text-red-600">{invoice.due}</span>
                    </div>
                  </div>
                  
                  {/* Payment Details */}
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Payment Details</span>
                      <button 
                        onClick={handleAddPayment}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + Add Payment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
        />
      )}

     {showComponentModal && (
       <AddComponentModal
         onClose={() => setShowComponentModal(false)}
         onSave={handleSaveComponent}
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