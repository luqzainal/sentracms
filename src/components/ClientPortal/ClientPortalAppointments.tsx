import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Calendar, Clock } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { CalendarEvent } from '../../store/AppStore';

interface ClientPortalAppointmentsProps {
  user: any;
  onBack: () => void;
}

const ClientPortalAppointments: React.FC<ClientPortalAppointmentsProps> = ({ user, onBack }) => {
  const { 
    clients, 
    calendarEvents
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

  const appointments = calendarEvents.filter((event: CalendarEvent) => event.clientId === client.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  const getStatusColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'call':
        return 'bg-green-100 text-green-800';
      case 'consultation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">View Appointments</h1>
                <p className="text-sm text-slate-600">View your scheduled appointments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Appointments</h2>
          
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No appointments scheduled</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment: CalendarEvent) => (
                    <tr key={appointment.id} className="border-b border-slate-100">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{appointment.title}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{formatDate(appointment.startDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-600 text-sm max-w-xs truncate">
                          {appointment.description || 'No description'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.type)}`}>
                          {appointment.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortalAppointments; 