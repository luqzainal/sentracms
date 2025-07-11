import React, { useState } from 'react';
import { useSupabase } from './hooks/useSupabase';
import Login from './components/Auth/Login';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ClientsPage from './components/Clients/ClientsPage';
import CalendarPage from './components/Calendar/CalendarPage';
import ChatPage from './components/Chat/ChatPage';
import ReportsPage from './components/Reports/ReportsPage';
import SettingsPage from './components/Settings/SettingsPage';
import ClientDashboard from './components/ClientPortal/ClientDashboard';

function App() {
  const { user, loading, signOut, isAuthenticated } = useSupabase();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const handleLogout = () => {
    signOut();
    setActiveTab('dashboard');
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    // If user is a client, show client dashboard
    if (user && (user.role === 'Client Admin' || user.role === 'Client Team')) {
      return (
        <ClientDashboard
          user={user}
          onBack={handleLogout}
        />
      );
    }

    // Otherwise show admin dashboard
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} onToggleSidebar={toggleSidebar} />;
      case 'clients':
        return <ClientsPage setActiveTab={setActiveTab} onToggleSidebar={toggleSidebar} />;
      case 'calendar':
        return <CalendarPage onToggleSidebar={toggleSidebar} />;
      case 'chat':
        return <ChatPage onToggleSidebar={toggleSidebar} />;
      case 'reports':
        return <ReportsPage onToggleSidebar={toggleSidebar} />;
      case 'settings':
        return <SettingsPage onToggleSidebar={toggleSidebar} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} onToggleSidebar={toggleSidebar} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading application...</p>
          <p className="text-slate-500 text-sm mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Login />;
  }

  // If user is a client, don't show sidebar
  if (user && (user.role === 'Client Admin' || user.role === 'Client Team')) {
    return (
      <div className="min-h-screen bg-slate-100">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      <main className="flex-1 overflow-y-auto lg:ml-0">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;