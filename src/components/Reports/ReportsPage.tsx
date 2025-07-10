import React, { useState } from 'react';
import { Download, Filter, TrendingUp, DollarSign, Users, Calendar, Database, CreditCard, UserX, CheckCircle, Clock, Menu } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAppStore } from '../../store/AppStore';

interface ReportsPageProps {
  onToggleSidebar?: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onToggleSidebar }) => {
  const [dateFilter, setDateFilter] = useState('month');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  const { 
    clients, 
    getTotalSales, 
    getTotalCollection, 
    getTotalBalance 
  } = useAppStore();

  // Filter clients based on date range if custom dates are selected
  const getFilteredClients = () => {
    if (dateFilter === 'custom' && customDateStart && customDateEnd) {
      const startDate = new Date(customDateStart);
      const endDate = new Date(customDateEnd);
      return clients.filter(client => {
        const clientDate = new Date(client.registeredAt);
        return clientDate >= startDate && clientDate <= endDate;
      });
    }
    return clients;
  };

  const filteredClients = getFilteredClients();

  // Calculate metrics
  const totalSales = filteredClients.reduce((sum, client) => sum + client.totalSales, 0);
  const totalCollection = filteredClients.reduce((sum, client) => sum + client.totalCollection, 0);
  const totalBalance = filteredClients.reduce((sum, client) => sum + client.balance, 0);
  const collectionRate = totalSales > 0 ? (totalCollection / totalSales) * 100 : 0;
  
  const totalClients = filteredClients.length;
  const inactiveClients = filteredClients.filter(c => c.status === 'Inactive').length;
  const dropoutRate = totalClients > 0 ? (inactiveClients / totalClients) * 100 : 0;
  
  // Client completion rate - complete clients over total clients (excluding inactive) * 100
  const activeClients = filteredClients.filter(c => c.status !== 'Inactive');
  const completeClients = filteredClients.filter(c => c.status === 'Complete');
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

  const clientPerformanceData = filteredClients.map(client => ({
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

      // Create a temporary container optimized for PDF layout
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels
      tempContainer.style.minHeight = '1123px'; // A4 height in pixels
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.boxSizing = 'border-box';
      document.body.appendChild(tempContainer);

      // Clone the report content
      const clonedContent = reportElement.cloneNode(true) as HTMLElement;
      clonedContent.style.width = '100%';
      clonedContent.style.maxWidth = 'none';
      clonedContent.style.fontSize = '11px';
      clonedContent.style.lineHeight = '1.4';
      
      // Optimize spacing for PDF
      const sections = clonedContent.querySelectorAll('.space-y-4, .space-y-6, .space-y-8');
      sections.forEach(section => {
        (section as HTMLElement).style.gap = '16px';
        (section as HTMLElement).style.display = 'flex';
        (section as HTMLElement).style.flexDirection = 'column';
      });
      
      // Optimize grid layouts
      const grids = clonedContent.querySelectorAll('.grid');
      grids.forEach(grid => {
        (grid as HTMLElement).style.display = 'grid';
        (grid as HTMLElement).style.gap = '12px';
      });
      
      // Optimize tables for PDF
      const tables = clonedContent.querySelectorAll('table');
      tables.forEach(table => {
        (table as HTMLElement).style.fontSize = '10px';
        (table as HTMLElement).style.width = '100%';
        (table as HTMLElement).style.borderCollapse = 'collapse';
      });
      
      // Optimize text elements
      const textElements = clonedContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
      textElements.forEach(element => {
        const el = element as HTMLElement;
        if (el.style.fontSize) {
          const currentSize = parseInt(el.style.fontSize);
          if (currentSize > 16) {
            el.style.fontSize = '14px';
          } else if (currentSize > 12) {
            el.style.fontSize = '11px';
          } else {
            el.style.fontSize = '10px';
          }
        }
      });
      
      tempContainer.appendChild(clonedContent);

      // Add header to the report
      const header = document.createElement('div');
      header.innerHTML = `
        <div style="margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; text-align: center;">
          <h1 style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 0; line-height: 1.2;">Sentra CMS - Business Reports</h1>
          <p style="color: #64748b; margin: 6px 0 0 0; font-size: 11px; line-height: 1.3;">Generated on ${new Date().toLocaleDateString('en-MY', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          <p style="color: #64748b; margin: 3px 0 0 0; font-size: 10px; line-height: 1.3;">
            ${dateFilter === 'custom' && customDateStart && customDateEnd ? 
              `Report Period: ${new Date(customDateStart).toLocaleDateString('en-MY')} - ${new Date(customDateEnd).toLocaleDateString('en-MY')}` : 
              `Report Period: ${dateFilter === 'week' ? 'This Week' : 'This Month'}`
            }
          </p>
        </div>
      `;
      tempContainer.insertBefore(header, clonedContent);

      // Generate canvas from the content with higher quality
      const canvas = await html2canvas(tempContainer, {
        width: 794, // A4 width in pixels at 96 DPI
        height: Math.max(1123, tempContainer.scrollHeight), // Dynamic height
        scale: 1.5, // Higher quality
        useCORS: true,
        backgroundColor: 'white',
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10; // 10mm margin
      const contentWidth = imgWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png', 0.95), 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pageHeight - margin);

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png', 0.95), 'PNG', margin, position, contentWidth, imgHeight);
        heightLeft -= (pageHeight - margin);
      }

        pdf.addImage(
          canvas.toDataURL('image/png', 0.95), 
          'PNG', 
          margin, 
          position, 
          contentWidth, 
          (canvas.height * contentWidth) / canvas.width,
          undefined,
          'FAST'
        );
        heightLeft -= contentHeight;
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `sentra-business-report-${currentDate}.pdf`;

      // Save the PDF
      pdf.save(filename);

      // Clean up
      document.body.removeChild(tempContainer);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6" id="report-content">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-600 text-sm lg:text-base">Analyze your business performance and insights</p>
        </div>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-3 flex-wrap gap-2">
          {/* Date Filter */}
          <div className="flex items-center space-x-1 lg:space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2 lg:px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xs lg:text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="flex items-center space-x-1 lg:space-x-2 w-full lg:w-auto">
              <input
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="px-2 lg:px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xs lg:text-sm flex-1 lg:flex-none"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="px-2 lg:px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xs lg:text-sm flex-1 lg:flex-none"
              />
            </div>
          )}
          
          <button 
            onClick={handleExportReport}
            className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm lg:text-base"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4 lg:mb-6">Summary Statistics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-slate-900">{totalClients}</p>
            <p className="text-xs lg:text-sm text-slate-600">Total Clients</p>
            {dateFilter === 'custom' && customDateStart && customDateEnd && (
              <p className="text-xs text-slate-500 mt-1 hidden lg:block">
                {new Date(customDateStart).toLocaleDateString()} - {new Date(customDateEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-slate-900">{completeClients.length}</p>
            <p className="text-xs lg:text-sm text-slate-600">Complete Clients</p>
            {dateFilter === 'custom' && customDateStart && customDateEnd && (
              <p className="text-xs text-slate-500 mt-1 hidden lg:block">
                {new Date(customDateStart).toLocaleDateString()} - {new Date(customDateEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-600" />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-slate-900">{filteredClients.filter(c => c.status === 'Pending').length}</p>
            <p className="text-xs lg:text-sm text-slate-600">Pending Clients</p>
            {dateFilter === 'custom' && customDateStart && customDateEnd && (
              <p className="text-xs text-slate-500 mt-1 hidden lg:block">
                {new Date(customDateStart).toLocaleDateString()} - {new Date(customDateEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <UserX className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-slate-900">{inactiveClients}</p>
            <p className="text-xs lg:text-sm text-slate-600">Inactive Clients</p>
            {dateFilter === 'custom' && customDateStart && customDateEnd && (
              <p className="text-xs text-slate-500 mt-1 hidden lg:block">
                {new Date(customDateStart).toLocaleDateString()} - {new Date(customDateEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-600">Total Sales (MYR)</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-600">Total Collection (MYR)</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-900">{formatCurrency(totalCollection)}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-600">Balance (MYR)</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-900">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-600">Collection Rate (%)</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-900">{collectionRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1 hidden lg:block">Total Collection / Total Sales</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 lg:mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-600">Dropout Rate (%)</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-900">{dropoutRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1 hidden lg:block">Inactive Clients / Total Clients</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-3 lg:mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(dropoutRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-600">Client Completion (%)</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-900">{clientCompletionRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1 hidden lg:block">Complete Clients / Active Clients * 100</p>
              {dateFilter === 'custom' && customDateStart && customDateEnd && (
                <p className="text-xs text-slate-500 mt-1 hidden lg:block">
                  Period: {new Date(customDateStart).toLocaleDateString()} - {new Date(customDateEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 lg:mt-4">
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4 lg:mb-6">Monthly Sales Chart</h3>
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
                  <p className="text-xs text-slate-500 truncate">{data.month.slice(0, 3)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-xs lg:text-sm text-slate-600">Sales (MYR)</span>
          </div>
        </div>
      </div>

      {/* Client Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4 lg:mb-6">Client Performance Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-slate-900 text-xs lg:text-sm min-w-[120px]">Client</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-slate-900 text-xs lg:text-sm min-w-[80px]">Status</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-slate-900 text-xs lg:text-sm min-w-[100px] hidden md:table-cell">Total Sales</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-slate-900 text-xs lg:text-sm min-w-[100px] hidden md:table-cell">Collection</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-slate-900 text-xs lg:text-sm min-w-[100px] hidden lg:table-cell">Balance</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-slate-900 text-xs lg:text-sm min-w-[120px]">Collection Rate</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-slate-900 text-xs lg:text-sm min-w-[100px] hidden lg:table-cell">Client Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientPerformanceData.map((client, index) => (
                <tr key={index} className="hover:bg-slate-50 border-b border-slate-100">
                  <td className="py-2 lg:py-4 px-2 lg:px-4">
                    <span className="font-medium text-slate-900 text-xs lg:text-sm">{client.name}</span>
                  </td>
                  <td className="py-2 lg:py-4 px-2 lg:px-4">
                    <span className={`px-1.5 lg:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-2 lg:py-4 px-2 lg:px-4 hidden md:table-cell">
                    <span className="font-medium text-slate-900 text-xs lg:text-sm">{formatCurrency(client.totalSales)}</span>
                  </td>
                  <td className="py-2 lg:py-4 px-2 lg:px-4 hidden md:table-cell">
                    <span className="font-medium text-green-600 text-xs lg:text-sm">{formatCurrency(client.totalCollection)}</span>
                  </td>
                  <td className="py-2 lg:py-4 px-2 lg:px-4 hidden lg:table-cell">
                    <span className="font-medium text-orange-600 text-xs lg:text-sm">{formatCurrency(client.balance)}</span>
                  </td>
                  <td className="py-2 lg:py-4 px-2 lg:px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 lg:w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(client.collectionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs lg:text-sm text-slate-600 min-w-[35px] lg:min-w-[45px]">{client.collectionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-2 lg:py-4 px-2 lg:px-4 hidden lg:table-cell">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 lg:w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            client.status === 'Complete' ? 'bg-green-500' :
                            client.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${Math.min(client.clientCompletion, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs lg:text-sm min-w-[35px] lg:min-w-[45px] text-slate-600">
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