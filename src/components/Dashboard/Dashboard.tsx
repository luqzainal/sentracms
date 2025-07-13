import React, { useState } from 'react';
import { useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, MessageSquare, UserPlus, Filter, Database, CreditCard, Clock, BarChart3, Activity, Menu } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
  onToggleSidebar?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onToggleSidebar }) => {
  const [dateFilter, setDateFilter] = useState('month');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  const { 
    clients,
    chats,
    tags,
    invoices,
    loading,
    fetchClients,
    fetchChats,
    fetchTags,
    getTotalSales, 
    getTotalCollection, 
    getTotalBalance,
    getUnreadMessagesCount
  } = useAppStore();

  useEffect(() => {
    // Fetch initial data
    fetchClients();
    fetchChats();
    fetchTags();
  }, [fetchClients, fetchChats, fetchTags]);

  // Calculate metrics
  const totalSales = getTotalSales();
  const totalCollection = getTotalCollection();
  const totalBalance = getTotalBalance();
  const totalClients = clients.length;
  const completeClients = clients.filter(c => c.status === 'Complete').length;

  // Get latest message for each client (unique clients only)
  const latestMessagesPerClient = chats
    .filter(chat => chat.messages && chat.messages.length > 0)
    .map(chat => {
      const latestMessage = chat.messages.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      return {
        ...latestMessage,
        client: chat.client,
        avatar: chat.avatar,
        chatId: chat.id,
        isUnread: chat.unread_count > 0,
        lastMessageAt: chat.lastMessageAt || latestMessage.created_at
      };
    })
    .sort((a, b) => {
      // Sort by last message timestamp
      const timeA = new Date(a.lastMessageAt).getTime();
      const timeB = new Date(b.lastMessageAt).getTime();
      return timeB - timeA;
    })
    .slice(0, 5); // Show only 5 latest clients

  // Calculate total unread messages using the store function
  const totalUnreadMessages = getUnreadMessagesCount();

  // Monthly sales data - distribute total sales to January for demonstration
  const monthlyData = [
    { month: 'January', sales: totalSales, displayValue: `RM ${(Number(totalSales) || 0).toLocaleString()}` },
    { month: 'February', sales: 0, displayValue: 'RM 0' },
    { month: 'March', sales: 0, displayValue: 'RM 0' },
    { month: 'April', sales: 0, displayValue: 'RM 0' },
    { month: 'May', sales: 0, displayValue: 'RM 0' },
    { month: 'June', sales: 0, displayValue: 'RM 0' },
    { month: 'July', sales: 0, displayValue: 'RM 0' },
    { month: 'August', sales: 0, displayValue: 'RM 0' },
    { month: 'September', sales: 0, displayValue: 'RM 0' },
    { month: 'October', sales: 0, displayValue: 'RM 0' },
    { month: 'November', sales: 0, displayValue: 'RM 0' },
    { month: 'December', sales: 0, displayValue: 'RM 0' },
  ];

  // Filter data based on date range
  const filteredData = monthlyData.filter(item => {
    if (dateFilter === 'month') {
      return item.month === 'January';
    } else if (dateFilter === 'week') {
      return item.month === 'January';
    } else if (dateFilter === 'custom' && customDateStart && customDateEnd) {
      return item.month === 'January';
    }
    return true;
  });

  const maxSales = Math.max(...monthlyData.map(d => d.sales));

  const recentClients = clients.slice(0, 4);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    const validAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(validAmount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading.clients || loading.chats) {
    return (
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Client completion rate - complete clients over total clients (excluding inactive) * 100
  const activeClients = clients.filter(c => c.status !== 'Inactive');
  const clientCompletionRate = activeClients.length > 0 ? (completeClients / activeClients.length) * 100 : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Mobile Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Executive Dashboard</h1>
            <p className="text-slate-600 mt-1 text-sm lg:text-base">Comprehensive business analytics and performance metrics</p>
        </div>
        </div>
        
        <div className="flex items-center space-x-3 lg:space-x-6 flex-wrap gap-2">
          {/* Date Filter */}
          <div className="flex items-center space-x-2 lg:space-x-3 bg-white rounded-lg border border-slate-200 px-3 lg:px-4 py-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border-0 bg-transparent focus:ring-0 outline-none text-xs lg:text-sm font-medium text-slate-700"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="flex items-center space-x-2 lg:space-x-3 bg-white rounded-lg border border-slate-200 px-3 lg:px-4 py-2 w-full lg:w-auto">
              <input
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="border-0 bg-transparent focus:ring-0 outline-none text-xs lg:text-sm"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="border-0 bg-transparent focus:ring-0 outline-none text-xs lg:text-sm"
              />
            </div>
          )}
          
          <div className="text-right bg-white rounded-lg border border-slate-200 px-3 lg:px-4 py-2">
            <p className="text-xs lg:text-sm text-slate-500">Today</p>
            <p className="text-xs lg:text-sm font-medium text-slate-900">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wide">Total Sales</p>
              <p className="text-xl lg:text-3xl font-bold text-slate-900 mt-1 lg:mt-2">{formatCurrency(totalSales)}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs lg:text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-xs lg:text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wide">Collections</p>
              <p className="text-xl lg:text-3xl font-bold text-slate-900 mt-1 lg:mt-2">{formatCurrency(totalCollection)}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs lg:text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-xs lg:text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wide">Balance</p>
              <p className="text-xl lg:text-3xl font-bold text-slate-900 mt-1 lg:mt-2">{formatCurrency(totalBalance)}</p>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-xs lg:text-sm text-orange-600 font-medium">-3.1%</span>
                <span className="text-xs lg:text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wide">Total Clients</p>
              <p className="text-xl lg:text-3xl font-bold text-slate-900 mt-1 lg:mt-2">{totalClients}</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-xs lg:text-sm text-blue-600 font-medium">Active Management</span>
              </div>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wide">Completed Clients</p>
              <p className="text-xl lg:text-3xl font-bold text-slate-900 mt-1 lg:mt-2">{completeClients}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs lg:text-sm text-green-600 font-medium">Client Completion {clientCompletionRate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wide">New Clients</p>
              <p className="text-xl lg:text-3xl font-bold text-slate-900 mt-1 lg:mt-2">2</p>
              <div className="flex items-center mt-2">
                <span className="text-xs lg:text-sm text-slate-500">This week</span>
              </div>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-50 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Analytics Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-100 rounded-lg p-1.5 lg:p-2">
              <BarChart3 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-slate-900">Sales Analytics</h3>
              <p className="text-xs lg:text-sm text-slate-600">Monthly sales performance overview</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs lg:text-sm text-slate-500">Total Sales</p>
              <p className="text-xl lg:text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</p>
            </div>
          </div>
        </div>
        <div className="h-48 lg:h-80 overflow-x-auto">
          <div className="flex items-end justify-between h-full space-x-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-100 rounded-t-sm relative" style={{ height: window.innerWidth < 1024 ? '160px' : '280px' }}>
                  {data.sales > 0 && (
                    <>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-sm"
                        style={{ height: `${(data.sales / maxSales) * 100}%` }}
                      />
                      <div 
                        className="absolute w-full flex justify-center text-xs lg:text-xs font-medium text-black"
                        style={{ 
                          bottom: `${(data.sales / maxSales) * 100}%`,
                          transform: 'translateY(-4px)'
                        }}
                      >
                        {data.displayValue}
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs lg:text-xs text-slate-500 truncate">{data.month.slice(0, 3)} 2025</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-xs lg:text-sm text-slate-600">Sales (MYR) - 2025</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-100 rounded-lg p-1.5 lg:p-2">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-900">Client Management</h3>
            </div>
            <button 
              onClick={() => setActiveTab?.('clients')}
              className="text-slate-600 hover:text-slate-900 text-xs lg:text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 lg:space-y-4">
            {recentClients.map((client) => {
              // Calculate project progress based on completion status
              const projectProgress = client.status === 'Complete' ? 100 
                : client.status === 'Pending' ? 50 
                : 0;
              
                             // Get client's package from invoices if available
               const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
              const packageName = clientInvoices.length > 0 ? clientInvoices[0].packageName : null;
              
              // Get progress color based on status
              const getProgressColor = (status: string) => {
                switch (status) {
                  case 'Complete':
                    return 'bg-green-500';
                  case 'Pending':
                    return 'bg-yellow-500';
                  case 'Inactive':
                    return 'bg-red-300';
                  default:
                    return 'bg-slate-300';
                }
              };
              
              return (
                <div key={client.id} className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100">
                  {/* Client Avatar */}
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-medium flex-shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  
                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 text-sm lg:text-base truncate">{client.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)} ml-2`}>
                        {client.status}
                      </span>
                    </div>
                    <p className="text-xs lg:text-sm text-slate-500 truncate">{client.email}</p>
                    {packageName && (
                      <p className="text-xs text-blue-600 font-medium truncate">Package: {packageName}</p>
                    )}
                  </div>
                  
                  {/* Progress */}
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-16 lg:w-20 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(client.status)}`}
                        style={{ width: `${projectProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-8">{projectProgress}%</span>
                  </div>
                </div>
              );
            })}
            
            {recentClients.length === 0 && (
              <div className="text-center py-6 lg:py-8">
                <Users className="w-8 h-8 lg:w-12 lg:h-12 text-slate-400 mx-auto mb-2 lg:mb-3" />
                <p className="text-slate-500 text-sm">No clients yet</p>
                <p className="text-slate-400 text-xs">Add clients to start managing projects</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-slate-100 rounded-lg p-1.5 lg:p-2">
                <MessageSquare className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-900">Latest Client Messages</h3>
              {totalUnreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 lg:px-2 py-1 rounded-full font-medium">
                  {totalUnreadMessages}
                </span>
              )}
            </div>
            <button 
              onClick={() => setActiveTab?.('chat')}
              className="text-slate-600 hover:text-slate-900 text-xs lg:text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 lg:space-y-4 max-h-60 lg:max-h-80 overflow-y-auto">
                            {latestMessagesPerClient.map((message, index) => (
              <div key={`${message.chatId}-${message.id}`} className={`p-3 lg:p-4 rounded-lg border transition-colors ${
                message.isUnread ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start space-x-2 lg:space-x-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {message.client.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h4 className="text-xs lg:text-sm font-semibold text-slate-900 truncate">{message.client}</h4>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-500 whitespace-nowrap">{formatTime(message.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-xs lg:text-sm text-slate-600 line-clamp-1">
                      {message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">
                        {message.sender === 'admin' ? 'Team replied' : 'Client sent message'}
                      </span>
                      {message.isUnread && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
                            {latestMessagesPerClient.length === 0 && (
              <div className="text-center py-6 lg:py-8">
                <MessageSquare className="w-8 h-8 lg:w-12 lg:h-12 text-slate-400 mx-auto mb-2 lg:mb-3" />
                <p className="text-slate-500 text-sm">No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Today Appointment */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-slate-100 rounded-lg p-1.5 lg:p-2">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-900">Today Appointment</h3>
            </div>
            <div className="text-xs lg:text-sm font-medium text-slate-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
          <div className="text-center py-6 lg:py-8">
            <Calendar className="w-8 h-8 lg:w-12 lg:h-12 text-slate-400 mx-auto mb-2 lg:mb-3" />
            <p className="text-slate-500 font-medium text-sm lg:text-base">No appointments scheduled</p>
            <p className="text-xs lg:text-sm text-slate-400">Your calendar is clear for today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;