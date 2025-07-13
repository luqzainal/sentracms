import React, { Suspense, useState, useEffect } from 'react';
import { useAppStore } from './store/AppStore';
import Sidebar from './components/Layout/Sidebar';
import { DatabaseProvider } from './context/SupabaseContext';
import { Toaster } from 'react-hot-toast';

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
const ClientPortalDashboard = React.lazy(() => import('./components/ClientPortal/ClientPortalDashboard'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  const { user, activeTab, selectedClient, setActiveTab, setUser, setSelectedClient } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Default to open on desktop (lg breakpoint is 1024px), closed on mobile
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Handle window resize to adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    setSelectedClient(null);
  };

  if (!user) {
    return (
      <DatabaseProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Login />
        </Suspense>
      </DatabaseProvider>
    );
  }

  if (user.role === 'Client Admin' || user.role === 'Client Team') {
    return (
      <DatabaseProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <ClientPortalDashboard user={user} onBack={handleLogout} />
        </Suspense>
      </DatabaseProvider>
    );
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard setActiveTab={setActiveTab} onToggleSidebar={handleToggleSidebar} />;
        case 'clients':
          return <ClientsPage setActiveTab={setActiveTab} onToggleSidebar={handleToggleSidebar} />;
                  case 'client-profile':
            return selectedClient ? (
              <ClientProfile 
                clientId={selectedClient.id.toString()} 
                onBack={() => setActiveTab('clients')}
                onEdit={() => {}} // Can be implemented later
              />
            ) : <ClientsPage setActiveTab={setActiveTab} onToggleSidebar={handleToggleSidebar} />;
        case 'payments':
          return <PaymentsPage />;
        case 'calendar':
          return <CalendarPage onToggleSidebar={handleToggleSidebar} />;
        case 'chat':
          return <ChatPage onToggleSidebar={handleToggleSidebar} />;
        case 'reports':
          return <ReportsPage onToggleSidebar={handleToggleSidebar} />;
        case 'settings':
          return <SettingsPage onToggleSidebar={handleToggleSidebar} />;
        default:
          return <Dashboard setActiveTab={setActiveTab} onToggleSidebar={handleToggleSidebar} />;
      }
    })();

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {content}
      </Suspense>
    );
  };

  return (
    <DatabaseProvider>
      <div className="flex h-screen bg-gray-100">
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            // Define default options
            className: '',
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            
            // Default options for specific types
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'green',
                secondary: 'white',
              },
            },
          }}
        />
        {/* Backdrop overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={handleToggleSidebar}
          />
        )}
        
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
        />
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </DatabaseProvider>
  );
}

export default App;