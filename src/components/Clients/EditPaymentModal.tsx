import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Calendar } from 'lucide-react';

interface EditPaymentModalProps {
  payment: any;
  onClose: () => void;
  onSave: (paymentData: any) => void;
}

const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ payment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentSource: 'Online Transfer',
    status: 'Paid',
    paidAt: ''
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount.toString() || '',
        paymentSource: payment.paymentSource || 'Online Transfer',
        status: payment.status || 'Paid',
        paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString().slice(0, 16) : ''
      });
    }
  }, [payment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse amount to number and validate
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    onSave({
      amount: amount,
      paymentSource: formData.paymentSource,
      status: formData.status,
      paidAt: formData.paidAt
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Edit Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Source
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                name="paymentSource"
                value={formData.paymentSource}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="Online Transfer">Online Transfer</option>
                <option value="Stripe/Razorpay (Payment Gateway)">Stripe/Razorpay (Payment Gateway)</option>
                <option value="Terminal">Terminal</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Paid At (Date & Time) *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="datetime-local"
                name="paidAt"
                value={formData.paidAt}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Update Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentModal;