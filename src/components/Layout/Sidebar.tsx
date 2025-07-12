import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, isOpen = true, onToggle }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024 && onToggle) {
      onToggle();
    }
  };
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen flex flex-col bg-slate-900 border-r border-slate-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onToggle}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
      {/* Header */}
        <div className="p-4 lg:p-6 border-b border-slate-700">
        <div className="flex justify-center">
          <img 
            src="/src/assets/AiChatbot (14) copy.png" 
            alt="Sentra Logo" 
            className="w-full h-auto max-w-[240px] lg:max-w-[300px]"
          />
        </div>
      </div>
      
      {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    activeTab === item.id
                      ? 'bg-slate-800 text-white border border-slate-600 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white transition-none'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm lg:text-base">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-slate-700">
        <button
          onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 lg:px-4 py-3 rounded-lg text-slate-300 hover:bg-red-900/20 hover:text-red-300 border border-transparent hover:border-red-800"
        >
          <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm lg:text-base">Sign Out</span>
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;