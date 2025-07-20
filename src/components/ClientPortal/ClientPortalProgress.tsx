import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import ClientProgressTracker from '../Clients/ClientProgressTracker';

interface ClientPortalProgressProps {
  user: any;
  onBack: () => void;
}

const ClientPortalProgress: React.FC<ClientPortalProgressProps> = ({ user, onBack }) => {
  const { 
    clients, 
    getProgressStepsByClientId,
    calculateClientProgressStatus
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

  const progressSteps = getProgressStepsByClientId(client.id);
  const progressStatus = calculateClientProgressStatus(client.id);
  const { percentage: progressPercentage } = progressStatus;

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
              <h1 className="text-xl font-semibold text-slate-900">Progress Tracking</h1>
              <p className="text-sm text-slate-600">View your onboarding journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Overall Progress</h2>
              <p className="text-sm text-slate-600">{progressPercentage}% Complete</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-slate-600">Completed: {progressSteps.filter(step => step.completed).length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-slate-600">Total Steps: {progressSteps.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-slate-600">Pending: {progressSteps.filter(step => !step.completed).length}</span>
            </div>
          </div>
        </div>

        <ClientProgressTracker clientId={client.id.toString()} onBack={onBack} />
      </div>
    </div>
  );
};

export default ClientPortalProgress; 