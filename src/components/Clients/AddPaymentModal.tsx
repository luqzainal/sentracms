import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Calendar, Upload, Eye, FileText, Download } from 'lucide-react';
import { Invoice } from '../../store/AppStore';

interface PaymentData {
  amount: number;
  paymentSource: string;
  receiptDate: string;
  receiptUrl?: string;
  description?: string;
}

interface AddPaymentModalProps {
  onClose: () => void;
  onSave: (paymentData: PaymentData) => Promise<void>; // Make onSave return a promise
  selectedInvoice?: Invoice;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ onClose, onSave, selectedInvoice }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentSource: 'Online Transfer',
    status: 'Paid',
    paidAt: new Date().toISOString().slice(0, 16) // Current date and time in YYYY-MM-DDTHH:MM format
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedReceiptUrl, _setUploadedReceiptUrl] = useState<string | null>(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    // Parse amount to number and validate
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }
    
    // Check if payment amount exceeds due amount
    if (selectedInvoice && amount > selectedInvoice.due) {
      if (!confirm(`Payment amount (RM ${amount.toLocaleString()}) exceeds due amount (RM ${selectedInvoice.due.toLocaleString()}). Continue?`)) {
        setIsSubmitting(false);
        return;
      }
    }
    
    // Upload receipt file if selected
    let receiptUrl = uploadedReceiptUrl;
    if (receiptFile) {
      setIsUploading(true);
      try {
        receiptUrl = await uploadReceiptFile(receiptFile);
      } catch (error) {
        console.error('Failed to upload receipt:', error);
        alert('Failed to upload receipt file. Please try again.');
        setIsUploading(false);
        setIsSubmitting(false);
        return;
      }
      setIsUploading(false);
    }
    
    try {
      await onSave({
        ...formData,
        amount: amount,
        receiptUrl: receiptUrl
      });
      // onClose will be called by the parent component on success
    } catch (error) {
      console.error("Failed to save payment:", error);
      // Optionally show an error toast to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (JPEG, PNG, GIF, or PDF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setReceiptFile(file);
    }
  };

  const uploadReceiptFile = async (file: File): Promise<string> => {
    try {
      // 1. Get pre-signed URL from our API
      const res = await fetch('https://sentra-api-app-sxdm6.ondigitalocean.app/api/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!res.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await res.json();

      // 2. Upload file to AWS S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'cache-control': 'public, max-age=31536000'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleViewReceipt = () => {
    if (uploadedReceiptUrl) {
      setShowReceiptViewer(true);
    }
  };

  const handleDownloadReceipt = () => {
    if (uploadedReceiptUrl) {
      const link = document.createElement('a');
      link.href = uploadedReceiptUrl;
      link.download = `receipt-${Date.now()}.pdf`;
      link.click();
    }
  };

  return (
    <>
      <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Add Payment</h2>
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
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="number"
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
                Paid At (Date & Time)
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

            {/* Receipt Upload Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Receipt/Proof of Payment
              </label>
              
              {/* Existing Receipt */}
              {uploadedReceiptUrl && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">Receipt uploaded</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleViewReceipt}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadReceipt}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="relative">
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="receipt-upload"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {receiptFile ? receiptFile.name : 'Click to upload receipt (JPEG, PNG, GIF, PDF)'}
                    </span>
                    <span className="text-xs text-slate-400">Max 5MB</span>
                  </div>
                </label>
              </div>
              
              {receiptFile && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">{receiptFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setReceiptFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting || isUploading ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Receipt Viewer Modal */}
      {showReceiptViewer && uploadedReceiptUrl && (
        <div className="fixed inset-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Receipt Viewer</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                  title="Download Receipt"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowReceiptViewer(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-4 h-[calc(90vh-80px)] overflow-auto">
              {uploadedReceiptUrl.endsWith('.pdf') ? (
                <iframe
                  src={uploadedReceiptUrl}
                  className="w-full h-full border-0"
                  title="Receipt PDF"
                />
              ) : (
                <img
                  src={uploadedReceiptUrl}
                  alt="Receipt"
                  className="w-full h-auto max-h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPaymentModal;