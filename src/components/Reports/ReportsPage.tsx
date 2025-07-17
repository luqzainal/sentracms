import React, { useState, useEffect } from 'react';
import { Download, Filter, TrendingUp, DollarSign, Users, Database, CreditCard, UserX, CheckCircle, Clock, Menu } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import logoImage from '../../assets/AiChatbot (15).png';

// Lazy load PDF libraries
const loadPDFLibraries = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  return { jsPDF, autoTable };
};

interface ReportsPageProps {
  onToggleSidebar: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onToggleSidebar }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDFReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const { jsPDF, autoTable } = await loadPDFLibraries();
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 20;

      // Add logo to PDF
      try {
        // Convert image to base64 for PDF
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = logoImage;
        });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0);
        const logoBase64 = canvas.toDataURL('image/png');
        
        // Add logo to PDF (centered, 20x20 size)
        doc.addImage(logoBase64, 'PNG', (pageWidth - 20) / 2, yPos, 20, 20);
        yPos += 25;
      } catch (error) {
        console.warn('Could not add logo to PDF:', error);
        yPos += 5; // Small spacing even without logo
      }

      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('SENTRA CMS', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Business Performance Report', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 5;
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-MY')}`, pageWidth / 2, yPos, { align: 'center' });
      
      // Add line separator
      yPos += 10;
      doc.setDrawColor(0, 0, 0);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 15;

      // Executive Summary
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, yPos);
      yPos += 10;

      // Key Metrics Table
      const summaryData = [
        ['Total Clients', totalClients.toString()],
        ['Total Sales', formatCurrency(totalSales)],
        ['Total Collection', formatCurrency(totalCollection)],
        ['Outstanding Balance', formatCurrency(totalBalance)],
        ['Collection Rate', `${collectionRate.toFixed(1)}%`],
        ['Client Completion Rate', `${clientCompletionRate.toFixed(1)}%`],
        ['Client Dropout Rate', `${dropoutRate.toFixed(1)}%`]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // Light gray
        },
        margin: { left: 20, right: 20 }
      });

      yPos = doc.lastAutoTable.finalY + 20;

      // Client Performance Analysis
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Client Performance Analysis', 20, yPos);
      yPos += 10;

      // Client details table
      const clientTableData = filteredClients.map(client => [
        client.name,
        client.status,
        formatCurrency(client.totalSales),
        formatCurrency(client.totalCollection),
        formatCurrency(client.balance),
        `${client.totalSales > 0 ? ((client.totalCollection / client.totalSales) * 100).toFixed(1) : 0}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Client Name', 'Status', 'Total Sales', 'Collection', 'Balance', 'Collection Rate']],
        body: clientTableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 40 }, // Client Name
          1: { cellWidth: 20 }, // Status
          2: { cellWidth: 30 }, // Total Sales
          3: { cellWidth: 30 }, // Collection
          4: { cellWidth: 25 }, // Balance
          5: { cellWidth: 25 }  // Collection Rate
        }
      });

      yPos = doc.lastAutoTable.finalY + 20;

      // Monthly Sales Analysis
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Sales Analysis', 20, yPos);
      yPos += 10;

      const monthlyTableData = monthlyData.map(month => [
        month.month,
        month.displayValue,
        month.sales === 0 ? 'No Activity' : 'Active'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Month', 'Sales Amount', 'Status']],
        body: monthlyTableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 20, right: 20 }
      });

      yPos = doc.lastAutoTable.finalY + 20;

      // Status Distribution
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Client Status Distribution', 20, yPos);
      yPos += 10;

      const statusData = [
        ['Complete', completeClients.length, `${clientCompletionRate.toFixed(1)}%`],
        ['Pending', filteredClients.filter(c => c.status === 'Pending').length, `${((filteredClients.filter(c => c.status === 'Pending').length / totalClients) * 100).toFixed(1)}%`],
        ['Inactive', inactiveClients, `${dropoutRate.toFixed(1)}%`]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Status', 'Count', 'Percentage']],
        body: statusData,
        theme: 'grid',
        styles: {
          fontSize: 11,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 20, right: 20 }
      });

      // Footer on each page
      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('© 2024 Sentra CMS - Confidential Business Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      // Save the PDF
      const fileName = `Sentra-CMS-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const [dateFilter, setDateFilter] = useState('month');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  const { 
    clients,
    fetchPayments,
    getMonthlySalesData
    // getTotalSales, 
    // getTotalCollection, 
    // getTotalBalance 
  } = useAppStore();

  // Fetch payments data on component mount
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
  const totalSales = filteredClients.reduce((sum, client) => sum + (Number(client.totalSales) || 0), 0);
  const totalCollection = filteredClients.reduce((sum, client) => sum + (Number(client.totalCollection) || 0), 0);
  const totalBalance = filteredClients.reduce((sum, client) => sum + (Number(client.balance) || 0), 0);
  const collectionRate = totalSales > 0 ? (totalCollection / totalSales) * 100 : 0;
  
  const totalClients = filteredClients.length;
  const inactiveClients = filteredClients.filter(c => c.status === 'Inactive').length;
  const dropoutRate = totalClients > 0 ? (inactiveClients / totalClients) * 100 : 0;
  
  // Client completion rate - complete clients over total clients (excluding inactive) * 100
  const activeClients = filteredClients.filter(c => c.status !== 'Inactive');
  const completeClients = filteredClients.filter(c => c.status === 'Complete');
  const clientCompletionRate = activeClients.length > 0 ? (completeClients.length / activeClients.length) * 100 : 0;

  // Format currency helper function
  const formatCurrency = (amount: number) => {
    const validAmount = Number(amount) || 0;
    return `RM ${validAmount.toLocaleString()}`;
  };

  // Monthly sales data based on actual payment dates
  const monthlyData = getMonthlySalesData();

  const maxSales = Math.max(...monthlyData.map(d => d.sales));

  const clientPerformanceData = filteredClients.map(client => {
    const clientSales = Number(client.totalSales) || 0;
    const clientCollection = Number(client.totalCollection) || 0;
    const clientBalance = Number(client.balance) || 0;
    
    return {
      name: client.name,
      status: client.status,
      totalSales: clientSales,
      totalCollection: clientCollection,
      balance: clientBalance,
      collectionRate: clientSales > 0 ? (clientCollection / clientSales) * 100 : 0,
      clientCompletion: client.status === 'Complete' ? 100 : client.status === 'Pending' ? 50 : 0
    };
  });

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
            onClick={generatePDFReport}
            disabled={isGeneratingPDF}
            className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPDF ? 'Generating...' : 'Export PDF'}</span>
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
                  <p className="text-xs text-slate-500 truncate">{data.month.slice(0, 3)} 2025</p>
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