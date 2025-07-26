import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

interface ClientPortalAddOnServicesProps {
  user: { email: string };
  onBack: () => void;
}

const ClientPortalAddOnServices: React.FC<ClientPortalAddOnServicesProps> = ({ onBack }) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    clients, 
    addOnServices,
    clientServiceRequests,
    fetchAddOnServices,
    fetchClientServiceRequests,
    addClientServiceRequest
  } = useAppStore();

  const client = clients.length > 0 ? clients[0] : null;

  useEffect(() => {
    fetchAddOnServices();
    fetchClientServiceRequests();
  }, [fetchAddOnServices, fetchClientServiceRequests]);

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

  const availableServices = addOnServices.filter(service => service.status === 'Available');
  const clientRequests = clientServiceRequests.filter(request => request.client_id === client.id);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmitRequest = async () => {
    if (selectedServices.length === 0) return;

    setIsSubmitting(true);
    try {
      for (const serviceId of selectedServices) {
        await addClientServiceRequest({
          client_id: client.id,
          service_id: parseInt(serviceId),
          status: 'Pending',
          request_date: new Date().toISOString()
        });
      }
      setSelectedServices([]);
      // Refresh requests
      fetchClientServiceRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-50';
      case 'Rejected': return 'text-red-600 bg-red-50';
      case 'Completed': return 'text-blue-600 bg-blue-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <AlertCircle className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Add-On Services</h1>
              <p className="text-sm text-slate-600">Request additional services for your project</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Available Services */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Available Services</h2>
            {selectedServices.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-slate-600">Selected: {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}</p>
                <p className="text-lg font-semibold text-slate-900">
                  Total: RM {selectedServices.reduce((total, serviceId) => {
                    const service = availableServices.find(s => s.id.toString() === serviceId);
                    return total + (service?.price || 0);
                  }, 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {availableServices.map((service) => (
              <div
                key={service.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedServices.includes(service.id.toString())
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleServiceToggle(service.id.toString())}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      selectedServices.includes(service.id.toString())
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300'
                    }`}>
                      {selectedServices.includes(service.id.toString()) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{service.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                        
                        {/* Features */}
                        {service.features && service.features.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Features:</h4>
                            <ul className="space-y-1">
                              {service.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-sm text-slate-600">
                                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <span className="text-lg font-semibold text-slate-900">
                          RM {service.price.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {service.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {availableServices.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Plus className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No services available at the moment</p>
            </div>
          )}

          {/* Submit Button */}
          {selectedServices.length > 0 && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedServices([])}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Request Add-On Services'}
              </button>
            </div>
          )}
        </div>

        {/* My Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My Requests</h2>
          
          <div className="space-y-4">
            {clientRequests.map((request) => {
              const service = addOnServices.find(s => s.id === request.service_id);
              return (
                <div key={request.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        {service?.name || 'Unknown Service'}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Requested on {new Date(request.request_date).toLocaleDateString('en-MY')}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span>{request.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {clientRequests.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No service requests yet</p>
              <p className="text-sm">Select services above to make your first request</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortalAddOnServices; 