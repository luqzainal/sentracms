import React, { useState } from 'react';
import { X, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

interface Invoice {
  id: string;
  packageName: string;
  amount: number;
  clientId: number;
}

interface InvoiceData {
  packageName: string;
  amount: number;
  invoiceDate: string;
}

interface AddInvoiceModalProps {
  onClose: () => void;
  onSave: (invoiceData: InvoiceData) => void;
  existingInvoices?: Invoice[];
}

const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({ onClose, onSave, existingInvoices = [] }) => {
  const [formData, setFormData] = useState({
    packageName: '',
    amount: '',
    invoiceDate: new Date().toISOString().slice(0, 16) // Current date and time in YYYY-MM-DDTHH:MM format
  });
  
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateInvoice, setDuplicateInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkForDuplicate = () => {
    const packageName = formData.packageName.trim().toLowerCase();
    
    // Check for duplicate based on client + package name
    const duplicate = existingInvoices.find(invoice => 
      invoice.packageName.toLowerCase() === packageName
    );
    
    return duplicate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    
    // Parse amount to number and validate
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Check for duplicate
    const duplicate = checkForDuplicate();
    if (duplicate && !showDuplicateWarning) {
      setDuplicateInvoice(duplicate);
      setShowDuplicateWarning(true);
      return;
    }
    
    // Set loading state
    setIsSubmitting(true);
    
    try {
      // Proceed with save
      await onSave({
        packageName: formData.packageName,
        amount: amount,
        invoiceDate: formData.invoiceDate
      });
    } catch (error) {
      console.error('Error saving invoice:', error);
      setIsSubmitting(false); // Reset loading state on error
    }
  };
  
  const handleConfirmDuplicate = async () => {
    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // User confirmed to proceed with duplicate
      const amount = parseFloat(formData.amount);
      await onSave({
        packageName: formData.packageName,
        amount: amount,
        invoiceDate: formData.invoiceDate
      });
    } catch (error) {
      console.error('Error saving invoice:', error);
      setIsSubmitting(false); // Reset loading state on error
    }
  };
  
  const handleCancelDuplicate = () => {
    setShowDuplicateWarning(false);
    setDuplicateInvoice(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Add Invoice</h2>
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
              Package Name
            </label>
            <input
              type="text"
              name="packageName"
              value={formData.packageName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter package name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Total Amount (Package)
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
              Invoice Date (Created At)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="datetime-local"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate Warning Dialog */}
      {showDuplicateWarning && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Possible Duplicate Invoice</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                An invoice with the package name "<strong>{duplicateInvoice?.packageName}</strong>" already exists for this client.
              </p>
              
              {duplicateInvoice && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Existing Invoice:</strong> {duplicateInvoice.packageName}<br/>
                    <strong>Amount:</strong> RM {Number(duplicateInvoice.amount).toFixed(2)}
                  </p>
                </div>
              )}
              
              <p className="text-gray-600 mb-6">
                Do you want to proceed with creating this invoice anyway?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDuplicate}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDuplicate}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Anyway'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddInvoiceModal;