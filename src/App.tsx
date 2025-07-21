import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { useAppStore } from './store/AppStore';
import Sidebar from './components/Layout/Sidebar';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';

// Lazy load components
const Login = React.lazy(() => import('./components/Auth/Login'));
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'));
const ClientsPage = React.lazy(() => import('./components/Clients/ClientsPage'));
const ClientProfile = React.lazy(() => import('./components/Clients/ClientProfile'));
const PaymentsPage = React.lazy(() => import('./components/Payments/PaymentsPage'));
const CalendarPage = React.lazy(() => import('./components/Calendar/CalendarPage'));
const ChatPage = React.lazy(() => import('./components/Chat/ChatPage'));
const ReportsPage = React.lazy(() => import('./components/Reports/ReportsPage'));
const SettingsPage = React.lazy(() => import('./components/Settings/SettingsPage'));
const ClientPortalLayout = React.lazy(() => import('./components/ClientPortal/ClientPortalLayout'));
const AddOnServicesPage = React.lazy(() => import('./components/AddOnServices/AddOnServicesPage'));
const ClientRequestsPage = React.lazy(() => import('./components/AddOnServices/ClientRequestsPage'));
const ToastTest = React.lazy(() => import('./components/common/ToastTest'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// A wrapper component to extract clientId from URL and pass it as a prop
const ClientProfileWrapper = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  if (!clientId) {
    // Handle case where clientId is missing, maybe redirect
    return <Navigate to="/clients" replace />;
  }

  return <ClientProfile clientId={clientId} onBack={() => navigate('/clients')} />;
};


function App() {
  const { user, setUser, fetchCalendarEvents } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setActiveTab(path);
  }, [location]);

  // Fetch calendar events when user is authenticated
  useEffect(() => {
    if (user) {
      fetchCalendarEvents();
    }
  }, [user, fetchCalendarEvents]);

  // Debug session information
  useEffect(() => {
    if (user) {
      console.log('👤 Current user session:', {
        id: user.id,
        email: user.email,
        role: user.role,
        sessionTimestamp: localStorage.getItem('demoUserTimestamp')
      });
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    console.log('🚪 Logging out from App...');
    setUser(null);
    localStorage.removeItem('demoUser');
    localStorage.removeItem('demoUserTimestamp');
    localStorage.removeItem('demoUserRememberMe');
    navigate('/login');
  };

  const handleSetTab = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  if (!user) {
    return (
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </Suspense>
    );
  }

  if (user.role === 'Client Admin' || user.role === 'Client Team') {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
          <ToastContainer />
          <Suspense fallback={<LoadingSpinner />}>
            <ClientPortalLayout user={user} onLogout={handleLogout} />
          </Suspense>
        </div>
      </ToastProvider>
    );
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
      <ToastProvider>
        <div className="flex h-screen bg-gray-100">
          <ToastContainer />
          {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={handleToggleSidebar}
          />
        )}
        
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleSetTab} 
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
        />
        <div className="flex-1 overflow-auto">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard setActiveTab={handleSetTab} onToggleSidebar={handleToggleSidebar} />} />
              <Route path="/clients" element={<ClientsPage setActiveTab={handleSetTab} onToggleSidebar={handleToggleSidebar} />} />
            <Route path="/clients/:clientId" element={<ClientProfileWrapper />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/calendar" element={<CalendarPage onToggleSidebar={handleToggleSidebar} />} />
              <Route path="/chat" element={<ChatPage onToggleSidebar={handleToggleSidebar} />} />
              <Route path="/addon-services" element={<AddOnServicesPage onToggleSidebar={handleToggleSidebar} />} />
              <Route path="/client-requests" element={<ClientRequestsPage onToggleSidebar={handleToggleSidebar} />} />
              <Route path="/toast-test" element={<ToastTest />} />
              <Route path="/reports" element={<ReportsPage onToggleSidebar={handleToggleSidebar} />} />
              <Route path="/settings" element={<SettingsPage onToggleSidebar={handleToggleSidebar} />} />
              <Route path="*" element={<Dashboard setActiveTab={handleSetTab} onToggleSidebar={handleToggleSidebar} />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;