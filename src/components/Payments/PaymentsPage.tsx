import React, { useState } from 'react';
import { Plus, Filter, Download, Search, DollarSign, Calendar, Clock, CheckCircle } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const payments = [
    {
      id: 'INV-001',
      client: 'Acme Corporation',
      amount: 5000,
      status: 'Paid',
      dueDate: '2025-01-15',
      paidDate: '2025-01-14',
      method: 'Bank Transfer',
      description: 'Website Development - Phase 1'
    },
    {
      id: 'INV-002',
      client: 'Tech Solutions Inc',
      amount: 3500,
      status: 'Pending',
      dueDate: '2025-01-20',
      paidDate: null,
      method: 'Credit Card',
      description: 'Mobile App Development'
    },
    {
      id: 'INV-003',
      client: 'Global Marketing',
      amount: 2000,
      status: 'Overdue',
      dueDate: '2025-01-10',
      paidDate: null,
      method: 'PayPal',
      description: 'SEO Optimization Services'
    },
    {
      id: 'INV-004',
      client: 'Digital Agency',
      amount: 7500,
      status: 'Paid',
      dueDate: '2025-01-12',
      paidDate: '2025-01-11',
      method: 'Bank Transfer',
      description: 'E-commerce Platform'
    },
    {
      id: 'INV-005',
      client: 'StartUp Ventures',
      amount: 1500,
      status: 'Pending',
      dueDate: '2025-01-25',
      paidDate: null,
      method: 'Credit Card',
      description: 'Consulting Services'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Overdue':
        return <Calendar className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = payments.filter(p => p.status === 'Paid').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'Pending').reduce((sum, payment) => sum + payment.amount, 0);
  const overdueAmount = payments.filter(p => p.status === 'Overdue').reduce((sum, payment) => sum + payment.amount, 0);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600">Track payments, invoices, and financial transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-200 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">${overdueAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Invoice ID</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Client</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Due Date</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Payment Method</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <span className="font-medium text-slate-900">{payment.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-900">{payment.client}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-slate-900">${payment.amount.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-600">{payment.dueDate}</span>
                    {payment.paidDate && (
                      <div className="text-xs text-green-600">Paid: {payment.paidDate}</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-600">{payment.method}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-600">{payment.description}</span>
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

export default PaymentsPage;