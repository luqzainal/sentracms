import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Calendar, UploadCloud, FileText, Trash2 } from 'lucide-react';
import { Invoice } from '../../store/AppStore';

interface AddPaymentModalProps {
  onClose: () => void;
  onSave: (paymentData: any) => Promise<void>; // Make onSave return a promise
  selectedInvoice?: Invoice;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ onClose, onSave, selectedInvoice }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    paymentSource: 'Online Transfer',
    status: 'Paid',
    paidAt: new Date().toISOString().slice(0, 16) // Current date and time in YYYY-MM-DDTHH:MM format
  });

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
    
    try {
      let attachmentUrl = '';
      
      // Upload attachment if present
      if (attachment) {
        console.log('🔄 Uploading payment attachment:', attachment.name);
        
        // 1. Get pre-signed URL from our API
        const res = await fetch('/api/generate-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileName: attachment.name, 
            fileType: attachment.type 
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
        }

        const responseData = await res.json();
        const { uploadUrl, fileUrl } = responseData;
        
        if (!uploadUrl || !fileUrl) {
          throw new Error('Invalid response: missing uploadUrl or fileUrl');
        }

        // 2. Upload file to DigitalOcean Spaces
        console.log('📤 Starting file upload to DigitalOcean Spaces...');
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl, true);
          
          xhr.onload = async () => {
            console.log('📡 Upload response status:', xhr.status);
            if (xhr.status === 200) {
              console.log('✅ File uploaded successfully!');
              attachmentUrl = fileUrl;
              resolve();
            } else {
              console.error('❌ Upload failed with status:', xhr.status);
              console.error('❌ Upload response:', xhr.responseText);
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = (error) => {
            console.error('❌ Network error during upload:', error);
            reject(new Error('Network error during upload.'));
          };
          
          console.log('📤 Sending file to DigitalOcean Spaces...');
          xhr.send(attachment);
        });
      }
      
      await onSave({
        ...formData,
        amount: amount,
        receiptFileUrl: attachmentUrl
      });
      // onClose will be called by the parent component on success
    } catch (error) {
      console.error("Failed to save payment:", error);
      alert('Failed to upload file. Please try again.');
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
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
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

          {/* File Attachment Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Receipt/Proof
            </label>
            
            {/* Show new attachment if selected */}
            {attachment && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">{attachment.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* File upload input */}
            {!attachment && (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-slate-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  id="payment-attachment"
                />
                <label htmlFor="payment-attachment" className="cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    Click to attach payment proof (max 5MB)
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports: Images, PDF, DOC, DOCX, XLS, XLSX
                  </p>
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Uploading...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;