import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, BarChart3, MessageSquare, FileText, Package, Clock, LogOut, DollarSign, Eye, Plus } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

// Lazy load components
const ClientPortalDashboard = React.lazy(() => import('./ClientPortalDashboard'));
const ClientPortalProgress = React.lazy(() => import('./ClientPortalProgress'));
const ClientPortalChat = React.lazy(() => import('./ClientPortalChat'));
const ClientPortalPackages = React.lazy(() => import('./ClientPortalPackages'));
const ClientPortalBilling = React.lazy(() => import('./ClientPortalBilling'));
const ClientPortalAppointments = React.lazy(() => import('./ClientPortalAppointments'));
const ClientPortalAddOnServices = React.lazy(() => import('./ClientPortalAddOnServices'));

interface ClientPortalLayoutProps {
  user: any;
  onLogout: () => void;
}

const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { 
    clients, 
    fetchClients,
    fetchProgressSteps,
    fetchComponents,
    fetchInvoices,
    fetchPayments,
    fetchCalendarEvents,
    fetchAddOnServices,
    fetchClientServiceRequests,
    chats,
    fetchChats,
    getClientRole
  } = useAppStore();

  const client = clients.length > 0 ? clients[0] : null;
  const clientChat = chats.find(chat => chat.clientId === client?.id);

  useEffect(() => {
    // Load all essential data for client portal
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchClients(),
          fetchProgressSteps(),
          fetchComponents(),
          fetchInvoices(),
          fetchPayments(),
          fetchCalendarEvents(),
          fetchAddOnServices(),
          fetchClientServiceRequests(),
          fetchChats()
        ]);
      } catch (error) {
        console.error("Failed to fetch client portal data:", error);
      }
    };

    fetchAllData();
  }, [fetchClients, fetchProgressSteps, fetchComponents, fetchInvoices, fetchPayments, fetchCalendarEvents, fetchAddOnServices, fetchClientServiceRequests, fetchChats]);

  const navigation = [
    { name: 'Dashboard', href: '/client', icon: Home },
    { name: 'Progress', href: '/client/progress', icon: BarChart3 },
    { name: 'My Packages', href: '/client/packages', icon: Package },
    { name: 'Billing', href: '/client/billing', icon: DollarSign },
    { name: 'Appointments', href: '/client/appointments', icon: Eye },
    { name: 'Chat', href: '/client/chat', icon: MessageSquare },
    { name: 'Add-On Services', href: '/client/add-ons', icon: Plus },
  ];

  const currentPath = location.pathname;

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {client?.name?.substring(0, 2).toUpperCase() || 'CL'}
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">Client Portal</h1>
                <p className="text-xs text-slate-600">{client?.name || 'Loading...'}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Chat' && clientChat && clientChat.client_unread_count > 0 && (
                    <div className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{clientChat.client_unread_count}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-semibold text-slate-900">Client Portal</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1">
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <Routes>
              <Route path="/client" element={<ClientPortalDashboard user={user} onBack={handleLogout} />} />
              <Route path="/client/progress" element={<ClientPortalProgress user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/packages" element={<ClientPortalPackages user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/billing" element={<ClientPortalBilling user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/appointments" element={<ClientPortalAppointments user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/chat" element={<ClientPortalChat user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/add-ons" element={<ClientPortalAddOnServices user={user} onBack={() => navigate('/client')} />} />
              <Route path="*" element={<ClientPortalDashboard user={user} onBack={handleLogout} />} />
            </Routes>
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalLayout; 