import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, BarChart3, MessageSquare, Package, LogOut, DollarSign, Eye, Plus } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import Logo from '../common/Logo';

// Lazy load components
const ClientPortalDashboard = React.lazy(() => import('./ClientPortalDashboard'));
const ClientPortalProgress = React.lazy(() => import('./ClientPortalProgress'));
const ClientPortalChat = React.lazy(() => import('./ClientPortalChat'));
const ClientPortalPackages = React.lazy(() => import('./ClientPortalPackages'));
const ClientPortalBilling = React.lazy(() => import('./ClientPortalBilling'));
const ClientPortalAppointments = React.lazy(() => import('./ClientPortalAppointments'));
const ClientPortalAddOnServices = React.lazy(() => import('./ClientPortalAddOnServices'));

interface ClientPortalLayoutProps {
  user: { email: string };
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
    fetchChats
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
    <div className="min-h-screen bg-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex-1 flex items-center justify-center">
              <Logo size="xlarge" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-sidebar-text" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 px-4 space-y-2 flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-menu-active text-black'
                      : 'text-sidebar-text hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.name === 'Chat' && clientChat && clientChat.client_unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {clientChat.client_unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-500 hover:bg-red-50 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
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
        <main className="bg-slate-50 px-0 pt-0 pb-4">
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <Routes>
              <Route path="/client" element={<ClientPortalDashboard user={user} />} />
              <Route path="/client/progress" element={<ClientPortalProgress user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/packages" element={<ClientPortalPackages user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/billing" element={<ClientPortalBilling user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/appointments" element={<ClientPortalAppointments user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/chat" element={<ClientPortalChat user={user} onBack={() => navigate('/client')} />} />
              <Route path="/client/add-ons" element={<ClientPortalAddOnServices user={user} onBack={() => navigate('/client')} />} />
              <Route path="*" element={<ClientPortalDashboard user={user} />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};

export default ClientPortalLayout; 