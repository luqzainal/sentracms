import React, { useState, useEffect } from 'react';
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
  console.log('App.tsx: Rendered. Loading:', loading, 'isAuthenticated:', isAuthenticated, 'User:', user);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add a useEffect to explicitly log when isAuthenticated changes
  useEffect(() => {
    console.log(`App.tsx: isAuthenticated changed to ${isAuthenticated}. User: ${user ? user.email : 'null'}`);
  }, [isAuthenticated, user]);


  const handleLogout = () => {
    signOut();
    setActiveTab('dashboard');
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    // If user is Client Admin or Client Team, show client dashboard
    if (user && (user.role === 'Client Admin' || user.role === 'Client Team')) {
      return (
        <ClientDashboard
          user={user}
          onBack={handleLogout}
        />
      );
    }

    // Otherwise show admin/team dashboard with sidebar
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
  // This is the critical part. If isAuthenticated is false, it should render Login.
  // If it becomes true, it should proceed to render the main app content.
  if (!isAuthenticated) {
    console.log('App.tsx: Rendering Login component because isAuthenticated is false.');
    return <Login />;
  }

  
  // If user is Client Admin or Client Team, show only the client dashboard (no sidebar)
  if (user && (user.role === 'Client Admin' || user.role === 'Client Team')) {
    console.log('App.tsx: Rendering Client Dashboard for client user.');
    return (
      <div className="min-h-screen bg-slate-100">
        {renderContent()}
      </div>
    );
  }

  // For Super Admin and Team users, show the full dashboard with sidebar
  console.log('App.tsx: Rendering main dashboard for admin/team user.');
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