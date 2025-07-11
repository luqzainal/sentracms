import React, { useState } from 'react';
import { ArrowLeft, Calendar, MessageSquare, DollarSign, HelpCircle, Package, Plus, Clock, CheckCircle, AlertCircle, User, Phone, Mail, MapPin, ChevronLeft, ChevronRight, X, Send, Paperclip, Smile } from 'lucide-react';
import ClientProgressTracker from '../Clients/ClientProgressTracker';
import { useAppStore } from '../../store/AppStore';

interface ClientDashboardProps {
  user: any;
  onBack: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onBack }) => {
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showPackageComponents, setShowPackageComponents] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showScheduleAppointment, setShowScheduleAppointment] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'list'>('month');

  const { 
    clients, 
    getProgressStepsByClientId, 
    getComponentsByClientId,
    getInvoicesByClientId,
    chats,
    calendarEvents
  } = useAppStore();

  // Find the client data based on the user email
  const client = clients.find(c => c.email === user.email);
  
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
  const clientEvents = calendarEvents.filter(event => event.clientId === client.id);

  // Calculate progress
  const completedSteps = progressSteps.filter(step => step.completed).length;
  const totalSteps = progressSteps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Calculate billing summary
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paid, 0);
  const dueAmount = invoices.reduce((sum, inv) => sum + inv.due, 0);

  // Calendar functions
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return clientEvents.filter(event => event.startDate === dateStr);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = 42; // 6 weeks * 7 days

    // Previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
      const day = prevMonth.getDate() - i;
      days.push(
        <div key={`prev-${day}`} className="min-h-20 p-2 text-slate-400 bg-slate-50 border border-slate-200">
          <span className="text-sm">{day}</span>
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && 
                     today.getMonth() === currentDate.getMonth() && 
                     today.getFullYear() === currentDate.getFullYear();
      const dayEvents = getEventsForDate(day);

      days.push(
        <div key={day} className={`min-h-20 p-2 border border-slate-200 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="text-xs p-1 rounded bg-green-100 text-green-700 truncate"
                title={`${event.title} - ${event.startTime}`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Next month's days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="min-h-20 p-2 text-slate-400 bg-slate-50 border border-slate-200">
          <span className="text-sm">{day}</span>
        </div>
      );
    }

    return days;
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
                  <span>Kuasa Components</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
              <p className="text-slate-600 mb-2">Current Package:</p>
              <h2 className="text-2xl font-bold text-slate-900">Kuasa 360</h2>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">List of modules you have access to</h3>
              <div className="space-y-3">
                {components.map((component, index) => (
                  <div key={component.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">Component {index + 1}: {component.name}</span>
                      {component.active && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Selesai
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
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
                <span className="text-slate-900">{client.email}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Registered Package: </span>
                <span className="text-slate-900">Kuasa 360</span>
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
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Invoice</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Receipt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 px-4 text-slate-900">Kuasa 360</td>
                      <td className="py-3 px-4 text-slate-900">RM {invoice.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-900">RM {invoice.paid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">-</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
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

  // Show Schedule Appointment
  if (showScheduleAppointment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowScheduleAppointment(false)}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  <span>Schedule Appointment</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Book your appointment session</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter appointment title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Purpose</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter purpose"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Purpose Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                type="button"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Set Appointment
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Appointments</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Start</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">End</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 text-slate-900">Follow up for First Session</td>
                      <td className="py-3 px-4 text-slate-600">21/07/2025 10:30</td>
                      <td className="py-3 px-4 text-slate-600">21/07/2025 12:30</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Approved
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-red-600 hover:text-red-700 text-sm border border-red-300 px-2 py-1 rounded">
                            Cancel
                          </button>
                          <button className="text-blue-600 hover:text-blue-700 text-sm border border-blue-300 px-2 py-1 rounded">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Settings</span>
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                Hai, {client.name} 👋
              </h1>
              <p className="text-slate-600 text-sm lg:text-base">Welcome to your client portal</p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Logout Account
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
              <h3 className="font-semibold text-slate-900 mb-2">Kuasa Components</h3>
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
              <div className="text-lg font-bold text-purple-600">RM {dueAmount.toLocaleString()}</div>
              <p className="text-xs text-slate-500">Outstanding</p>
            </div>
          </div>

          {/* Schedule Appointment */}
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowScheduleAppointment(true)}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Schedule Appointment</h3>
              <p className="text-sm text-slate-600 mb-3">Book your appointment session</p>
              <div className="flex items-center justify-center text-orange-600">
                <Plus className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Book Now</span>
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
                  <p className="text-xs text-slate-600">+60 12-345 6789</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email Support</p>
                  <p className="text-xs text-slate-600">support@sentra.com</p>
                </div>
              </div>
              
              {clientChat && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Live Chat</p>
                    <p className="text-xs text-blue-700">
                      {clientChat.unread > 0 ? `${clientChat.unread} new messages` : 'No new messages'}
                    </p>
                  </div>
                  {clientChat.unread > 0 && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{clientChat.unread}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Your Appointment Schedule</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      calendarView === 'month' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    month
                  </button>
                  <button
                    onClick={() => setCalendarView('list')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      calendarView === 'list' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    list
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h4 className="text-xl font-semibold text-slate-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h4>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <button className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                  today
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-0 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;