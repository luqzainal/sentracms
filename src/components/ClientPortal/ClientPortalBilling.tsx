import React from 'react';
import { ArrowLeft, DollarSign, Receipt, Download } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

interface ClientPortalBillingProps {
  user: { email: string };
  onBack: () => void;
}

const ClientPortalBilling: React.FC<ClientPortalBillingProps> = ({ onBack }) => {
  const { 
    clients, 
    getInvoicesByClientId,
    getPaymentsByClientId
  } = useAppStore();

  const client = clients.length > 0 ? clients[0] : null;

  if (!client) {
    return (
      <div className="bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Client data not found</h2>
          <p className="text-slate-600 mb-4">Unable to load client information</p>
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const invoices = getInvoicesByClientId(client.id);
  const payments = getPaymentsByClientId(client.id);

  // Calculate billing summary
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paid, 0);
  const dueAmount = invoices.reduce((sum, inv) => sum + inv.due, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleDownloadReceipt = (receiptUrl: string, fileName: string) => {
    if (receiptUrl) {
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = fileName;
      link.click();
    }
  };

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">My Account & Billing</h1>
                <p className="text-sm text-slate-600">Check your invoices & payment status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8 space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <p className="text-slate-900">{client.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-slate-900">{client.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Phone</label>
              <p className="text-slate-900">{client.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Business</label>
              <p className="text-slate-900">{client.businessName}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600">Registered Package</label>
              <p className="text-slate-900">
                {invoices.length > 0 ? invoices[0].packageName : 'No Package Assigned'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Total Invoiced</p>
              <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Total Paid</p>
              <p className="text-xl font-semibold text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Balance</p>
              <p className="text-xl font-semibold text-red-600">{formatCurrency(dueAmount)}</p>
            </div>
          </div>
        </div>

        {/* Invoice & Payment History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Invoice & Payment History</h2>
          
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Invoice</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Receipt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const invoicePayments = payments.filter(p => p.invoiceId === invoice.id);
                    const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
                    
                    return (
                      <tr key={invoice.id} className="border-b border-slate-100">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">{invoice.packageName}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-900">{formatCurrency(invoice.amount)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-600">{formatDate(invoice.createdAt)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-green-600">{formatCurrency(totalPaid)}</p>
                        </td>
                        <td className="py-3 px-4">
                          {invoicePayments.length > 0 && invoicePayments[0].receiptUrl ? (
                            <button
                              onClick={() => handleDownloadReceipt(
                                invoicePayments[0].receiptUrl!,
                                `receipt-${invoice.id}.pdf`
                              )}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                            >
                              <Download className="w-4 h-4" />
                              <span className="text-sm">Download</span>
                            </button>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.due === 0 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.paid > 0 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {invoice.due === 0 ? 'Paid' : invoice.paid > 0 ? 'Partial' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortalBilling; 