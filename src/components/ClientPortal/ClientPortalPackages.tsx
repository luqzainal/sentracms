import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

interface ClientPortalPackagesProps {
  user: any;
  onBack: () => void;
}

const ClientPortalPackages: React.FC<ClientPortalPackagesProps> = ({ user, onBack }) => {
  const { 
    clients, 
    getComponentsByClientId,
    getInvoicesByClientId
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

  const components = getComponentsByClientId(client.id);
  const invoices = getInvoicesByClientId(client.id);
  const activeComponents = components.filter(comp => comp.active);

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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">My Packages</h1>
                <p className="text-sm text-slate-600">List of modules you have access to</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Current Package */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Package</h2>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 text-lg">
              {invoices.length > 0 ? invoices[0].packageName : 'No Package Assigned'}
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              {activeComponents.length} Active Components
            </p>
          </div>
        </div>

        {/* Components List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">List of Components</h2>
          
          {activeComponents.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No components available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeComponents.map((component, index) => (
                <div key={component.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{component.name}</h3>
                    <p className="text-sm text-slate-600">Price: RM {component.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortalPackages; 