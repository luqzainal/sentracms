import React from 'react';
import { X, Calendar as CalendarIcon, Clock, Users, MapPin, FileText, Tag } from 'lucide-react';
import { Client, CalendarEvent } from '../../store/AppStore';

interface EventPopupProps {
  event: CalendarEvent;
  clients: Client[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EventPopup: React.FC<EventPopupProps> = ({ event, clients, onClose, onEdit, onDelete }) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'payment':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'call':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="w-4 h-4" />;
      case 'payment':
        return <CalendarIcon className="w-4 h-4" />;
      case 'deadline':
        return <Clock className="w-4 h-4" />;
      case 'call':
        return <MapPin className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  const clientName = clients.find(c => c.id === event.clientId)?.businessName || 'Unknown Client';

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
              {getEventTypeIcon(event.type)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Event Details</h2>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getEventTypeColor(event.type)}`}>
                <Tag className="w-3 h-3 mr-1" />
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Title
            </label>
            <p className="text-lg font-semibold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {event.title}
            </p>
          </div>
          
          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date & Time
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-900">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{formatTime(event.startTime)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date & Time
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{formatDate(event.endDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-900">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{formatTime(event.endTime)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Client Information */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client
            </label>
            <div className="flex items-center space-x-2 text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{clientName}</span>
            </div>
          </div>
          
          {/* Description */}
          {event.description && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-900 text-sm leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex space-x-3">
            <button 
              onClick={onEdit} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Edit Event
            </button>
            <button 
              onClick={onDelete} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              Delete Event
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup; 