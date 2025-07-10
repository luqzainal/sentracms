import React, { useState } from 'react';
import { Users, DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, MessageSquare, UserPlus, Filter, Database, CreditCard, Clock, BarChart3, Activity } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [dateFilter, setDateFilter] = useState('month');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  const { 
    clients, 
    chats, 
    getTotalSales, 
    getTotalCollection, 
    getTotalBalance 
  } = useAppStore();

  // Calculate metrics
  const totalSales = getTotalSales();
  const totalCollection = getTotalCollection();
  const totalBalance = getTotalBalance();
  const totalClients = clients.length;
  const completeClients = clients.filter(c => c.status === 'Complete').length;

  // Get all messages and sort by most recent, then take first 10
  const allMessages = chats.flatMap(chat => 
    chat.messages.map(message => ({
      ...message,
      client: chat.client,
      avatar: chat.avatar,
      chatId: chat.id,
      isUnread: chat.unread > 0 && message.id === Math.max(...chat.messages.map(m => m.id))
    }))
  ).sort((a, b) => {
    // Simple timestamp sorting - in real app, you'd use proper date comparison
    const timeA = a.timestamp.includes('AM') || a.timestamp.includes('PM') ? 
      (a.timestamp.includes('10:') ? 10 : 9) : 0;
    const timeB = b.timestamp.includes('AM') || b.timestamp.includes('PM') ? 
      (b.timestamp.includes('10:') ? 10 : 9) : 0;
    return timeB - timeA;
  }).slice(0, 10);

  // Calculate total unread messages
  const totalUnreadMessages = chats.reduce((total, chat) => total + chat.unread, 0);

  // Monthly sales data matching the attachment
  const monthlyData = [
    { month: 'January', sales: 0, displayValue: 'RM 0' },
    { month: 'February', sales: 0, displayValue: 'RM 0' },
    { month: 'March', sales: 0, displayValue: 'RM 0' },
    { month: 'April', sales: 0, displayValue: 'RM 0' },
    { month: 'May', sales: 0, displayValue: 'RM 0' },
    { month: 'June', sales: 19994, displayValue: 'RM 19,994' },
    { month: 'July', sales: 49979, displayValue: 'RM 49,979' },
    { month: 'August', sales: 0, displayValue: 'RM 0' },
    { month: 'September', sales: 0, displayValue: 'RM 0' },
    { month: 'October', sales: 0, displayValue: 'RM 0' },
    { month: 'November', sales: 0, displayValue: 'RM 0' },
    { month: 'December', sales: 0, displayValue: 'RM 0' },
  ];

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
    return `RM ${amount.toLocaleString()}`;
  };

  // Client completion rate - complete clients over total clients (excluding inactive) * 100
  const activeClients = clients.filter(c => c.status !== 'Inactive');
  const clientCompletionRate = activeClients.length > 0 ? (completeClients / activeClients.length) * 100 : 0;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Executive Dashboard</h1>
          <p className="text-slate-600 mt-1">Comprehensive business analytics and performance metrics</p>
        </div>
        <div className="flex items-center space-x-6">
          {/* Date Filter */}
          <div className="flex items-center space-x-3 bg-white rounded-lg border border-slate-200 px-4 py-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border-0 bg-transparent focus:ring-0 outline-none text-sm font-medium text-slate-700"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="flex items-center space-x-3 bg-white rounded-lg border border-slate-200 px-4 py-2">
              <input
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="border-0 bg-transparent focus:ring-0 outline-none text-sm"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="border-0 bg-transparent focus:ring-0 outline-none text-sm"
              />
            </div>
          )}
          
          <div className="text-right bg-white rounded-lg border border-slate-200 px-4 py-2">
            <p className="text-sm text-slate-500">Today</p>
            <p className="text-sm font-medium text-slate-900">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Sales</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totalSales)}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Collections</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totalCollection)}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Balance</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totalBalance)}</p>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600 font-medium">-3.1%</span>
                <span className="text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Clients</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalClients}</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600 font-medium">Active Management</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Completed Clients</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{completeClients}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">Client Completion {clientCompletionRate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">New Clients</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">2</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-slate-500">This week</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Analytics Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-100 rounded-lg p-2">
              <BarChart3 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Sales Analytics</h3>
              <p className="text-sm text-slate-600">Monthly sales performance overview</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</p>
            </div>
          </div>
        </div>
        <div className="h-80">
          <div className="flex items-end justify-between h-full space-x-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-100 rounded-t-sm relative" style={{ height: '280px' }}>
                  {data.sales > 0 && (
                    <>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-sm"
                        style={{ height: `${(data.sales / maxSales) * 100}%` }}
                      />
                      <div 
                        className="absolute w-full flex justify-center text-xs font-medium text-black"
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
                  <p className="text-xs text-slate-500">{data.month}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-600">Sales (MYR)</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-100 rounded-lg p-2">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Client Management</h3>
            </div>
            <button 
              onClick={() => setActiveTab?.('clients')}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-5">
            {recentClients.map((client) => {
              const progressPercentage = client.totalSales > 0 ? 
                Math.round((client.totalCollection / client.totalSales) * 100) : 0;
              
              return (
                <div key={client.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{client.businessName}</h4>
                    <p className="text-sm text-slate-500">{client.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-slate-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 w-8">{progressPercentage}%</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-slate-100 rounded-lg p-2">
                <MessageSquare className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Latest Messages</h3>
              {totalUnreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {totalUnreadMessages}
                </span>
              )}
            </div>
            <button 
              onClick={() => setActiveTab?.('chat')}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {allMessages.map((message, index) => (
              <div key={`${message.chatId}-${message.id}`} className={`p-4 rounded-lg border transition-colors ${
                message.isUnread ? 'bg-slate-50 border-slate-300' : 'bg-slate-25 border-slate-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {message.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{message.client}</h4>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{message.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{message.content}</p>
                    {message.isUnread && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Unread
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {allMessages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Today Appointment */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-slate-100 rounded-lg p-2">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Today Appointment</h3>
            </div>
            <div className="text-sm font-medium text-slate-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No appointments scheduled</p>
            <p className="text-sm text-slate-400">Your calendar is clear for today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;