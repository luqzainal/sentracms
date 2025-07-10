import React, { useState } from 'react';
import { Download, Filter, TrendingUp, DollarSign, Users, Calendar, Database, CreditCard, UserX, CheckCircle, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAppStore } from '../../store/AppStore';

const ReportsPage: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('month');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  const { 
    clients, 
    getTotalSales, 
    getTotalCollection, 
    getTotalBalance 
  } = useAppStore();

  // Calculate metrics
  const totalSales = getTotalSales();
  const totalCollection = getTotalCollection();
  const totalBalance = getTotalBalance();
  const collectionRate = totalSales > 0 ? (totalCollection / totalSales) * 100 : 0;
  
  const totalClients = clients.length;
  const inactiveClients = clients.filter(c => c.status === 'Inactive').length;
  const dropoutRate = totalClients > 0 ? (inactiveClients / totalClients) * 100 : 0;
  
  // Client completion rate - complete clients over total clients (excluding inactive) * 100
  const activeClients = clients.filter(c => c.status !== 'Inactive');
  const completeClients = clients.filter(c => c.status === 'Complete');
  const clientCompletionRate = activeClients.length > 0 ? (completeClients.length / activeClients.length) * 100 : 0;

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

  const clientPerformanceData = clients.map(client => ({
    name: client.name,
    status: client.status,
    totalSales: client.totalSales,
    totalCollection: client.totalCollection,
    balance: client.balance,
    collectionRate: client.totalSales > 0 ? (client.totalCollection / client.totalSales) * 100 : 0,
    clientCompletion: client.status === 'Complete' ? 100 : client.status === 'Pending' ? 50 : 0
  }));

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString()}`;
  };

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

  const handleExportReport = async () => {
    try {
      const reportElement = document.getElementById('report-content');
      if (!reportElement) return;

      // Create a temporary container for landscape layout
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1920px'; // Landscape width
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      document.body.appendChild(tempContainer);

      // Clone the report content
      const clonedContent = reportElement.cloneNode(true) as HTMLElement;
      clonedContent.style.width = '100%';
      clonedContent.style.maxWidth = 'none';
      tempContainer.appendChild(clonedContent);

      // Split content into two pages
      const sections = clonedContent.children;
      const page1Sections = Array.from(sections).slice(0, Math.ceil(sections.length / 2));
      const page2Sections = Array.from(sections).slice(Math.ceil(sections.length / 2));

      // Create page 1
      const page1Container = document.createElement('div');
      page1Container.style.width = '1920px';
      page1Container.style.minHeight = '1080px';
      page1Container.style.backgroundColor = 'white';
      page1Container.style.padding = '40px';
      page1Container.style.boxSizing = 'border-box';
      
      // Add header to page 1
      const header1 = document.createElement('div');
      header1.innerHTML = `
        <div style="margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
          <h1 style="font-size: 32px; font-weight: bold; color: #1e293b; margin: 0;">Business Reports - Page 1</h1>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      `;
      page1Container.appendChild(header1);
      
      page1Sections.forEach(section => {
        page1Container.appendChild(section.cloneNode(true));
      });
      
      document.body.appendChild(page1Container);

      // Create page 2
      const page2Container = document.createElement('div');
      page2Container.style.width = '1920px';
      page2Container.style.minHeight = '1080px';
      page2Container.style.backgroundColor = 'white';
      page2Container.style.padding = '40px';
      page2Container.style.boxSizing = 'border-box';
      
      // Add header to page 2
      const header2 = document.createElement('div');
      header2.innerHTML = `
        <div style="margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
          <h1 style="font-size: 32px; font-weight: bold; color: #1e293b; margin: 0;">Business Reports - Page 2</h1>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      `;
      page2Container.appendChild(header2);
      
      page2Sections.forEach(section => {
        page2Container.appendChild(section.cloneNode(true));
      });
      
      document.body.appendChild(page2Container);

      // Generate PNG for page 1
      const canvas1 = await html2canvas(page1Container, {
        width: 1920,
        height: 1080,
        scale: 1,
        useCORS: true,
        backgroundColor: 'white'
      });
      
      // Generate PNG for page 2
      const canvas2 = await html2canvas(page2Container, {
        width: 1920,
        height: 1080,
        scale: 1,
        useCORS: true,
        backgroundColor: 'white'
      });

      // Download page 1
      const link1 = document.createElement('a');
      link1.download = `business-report-page-1-${new Date().toISOString().split('T')[0]}.png`;
      link1.href = canvas1.toDataURL('image/png');
      link1.click();

      // Download page 2 after a short delay
      setTimeout(() => {
        const link2 = document.createElement('a');
        link2.download = `business-report-page-2-${new Date().toISOString().split('T')[0]}.png`;
        link2.href = canvas2.toDataURL('image/png');
        link2.click();
      }, 1000);

      // Clean up
      document.body.removeChild(tempContainer);
      document.body.removeChild(page1Container);
      document.body.removeChild(page2Container);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6" id="report-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600">Analyze your business performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          )}
          
          <button 
            onClick={handleExportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalClients}</p>
            <p className="text-sm text-slate-600">Total Clients</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{clients.filter(c => c.status === 'Complete').length}</p>
            <p className="text-sm text-slate-600">Complete Clients</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{clients.filter(c => c.status === 'Pending').length}</p>
            <p className="text-sm text-slate-600">Pending Clients</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserX className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{inactiveClients}</p>
            <p className="text-sm text-slate-600">Inactive Clients</p>
          </div>
        </div>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Sales (MYR)</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Collection (MYR)</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalCollection)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Balance (MYR)</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Collection Rate (%)</p>
              <p className="text-2xl font-bold text-slate-900">{collectionRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1">Total Collection / Total Sales</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Dropout Rate (%)</p>
              <p className="text-2xl font-bold text-slate-900">{dropoutRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1">Inactive Clients / Total Clients</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(dropoutRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Client Completion (%)</p>
              <p className="text-2xl font-bold text-slate-900">{clientCompletionRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1">Complete Clients / Total Clients (Excluding Inactive)</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(clientCompletionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Analytics Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Monthly Sales Chart</h3>
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

      {/* Client Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Client Performance Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Client</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Total Sales</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Collection</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Balance</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Collection Rate</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900">Client Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientPerformanceData.map((client, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <span className="font-medium text-slate-900">{client.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-slate-900">{formatCurrency(client.totalSales)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-green-600">{formatCurrency(client.totalCollection)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-orange-600">{formatCurrency(client.balance)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(client.collectionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 min-w-[45px]">{client.collectionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            client.status === 'Complete' ? 'bg-green-500' :
                            client.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${Math.min(client.clientCompletion, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm min-w-[45px] text-slate-600">
                        {client.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;