import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Package
} from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import Logo from '../common/Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, isOpen = true, onToggle }) => {
  const { getUnreadMessagesCount } = useAppStore();
  const unreadCount = getUnreadMessagesCount('admin');

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'clients', icon: Users, label: 'Clients' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'chat', icon: MessageSquare, label: 'Messages', badge: unreadCount > 0 ? unreadCount : null },
    { id: 'addon-services', icon: Package, label: 'Add-On Services' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onToggle) onToggle();
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex-1 flex items-center justify-center">
          <Logo size="xlarge" />
        </div>
        <button 
          onClick={onToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5 text-sidebar-text" />
        </button>
      </div>

      <nav className="mt-4 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-sidebar-menu-active text-black' 
                : 'text-sidebar-text hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-red-500 hover:bg-red-50 hover:bg-opacity-20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;