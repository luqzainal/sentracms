import React from 'react';
import { X, Calendar, Clock, User } from 'lucide-react';

const EventPopupClient = ({ event, clients, onClose }) => {
  const client = clients.find(c => c.id === event.clientId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center mb-4">
          <User className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-bold text-slate-900">Event Details</h2>
          <span className="ml-3 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">{event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}</span>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-slate-500 mb-1">Event Title</label>
          <div className="font-semibold text-slate-900 bg-slate-50 rounded px-3 py-2">{event.title}</div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Start Date & Time</label>
            <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2 mt-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{event.startTime}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">End Date & Time</label>
            <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{new Date(event.endDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2 mt-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{event.endTime}</span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-slate-500 mb-1">Client</label>
          <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2">
            <User className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-900">{client?.name || '-'}</span>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">Close</button>
        </div>
      </div>
    </div>
  );
};

export default EventPopupClient; 