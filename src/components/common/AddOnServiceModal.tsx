import React, { useState } from 'react';
import { X, Package, Check } from 'lucide-react';

interface AddOnService {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
}

interface AddOnServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedServices: string[]) => void;
  availableServices: AddOnService[];
}

const AddOnServiceModal: React.FC<AddOnServiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  availableServices 
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one add-on service');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedServices);
      setSelectedServices([]);
      onClose();
    } catch (error) {
      console.error('Error submitting add-on services:', error);
      alert('Failed to submit add-on services. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedServices([]);
    onClose();
  };

  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = availableServices.find(s => s.id === serviceId);
    return total + (service ? parseFloat(service.price.replace('RM ', '')) : 0);
  }, 0);

  const groupedServices = availableServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, AddOnService[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add-On Services</h2>
            <p className="text-slate-600 mt-1">Select additional services to enhance your package</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {Object.entries(groupedServices).map(([category, services]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>{category}</span>
              </h3>
              
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      service.available
                        ? selectedServices.includes(service.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => service.available && handleServiceToggle(service.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          selectedServices.includes(service.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-300'
                        }`}>
                          {selectedServices.includes(service.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{service.name}</h4>
                          <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                          {!service.available && (
                            <p className="text-xs text-red-600 mt-1">Currently unavailable</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="text-lg font-bold text-slate-900">{service.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {availableServices.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Add-On Services Available</h3>
              <p className="text-slate-600">Check back later for new add-on services</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">
                Selected: {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}
              </p>
              {selectedServices.length > 0 && (
                <p className="text-lg font-bold text-slate-900">
                  Total: RM {totalPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedServices.length === 0 || isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Request Add-On Services</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOnServiceModal; 