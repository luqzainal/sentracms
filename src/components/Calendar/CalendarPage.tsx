import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, X, Menu } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import EventPopup from '../common/EventPopup';
import { CalendarEvent } from '../../store/AppStore';

interface CalendarPageProps {
  onToggleSidebar?: () => void;
}

interface EventFormProps {
  isEdit: boolean;
  eventFormData: any;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmitEvent: (e: React.FormEvent, isEdit: boolean) => void;
  resetFormAndModals: () => void;
  clients: any[];
}

const EventForm: React.FC<EventFormProps> = ({ isEdit, eventFormData, handleFormChange, handleSubmitEvent, resetFormAndModals, clients }) => (
  <form onSubmit={(e) => handleSubmitEvent(e, isEdit)} className="space-y-4">
    <h2 className="text-xl font-semibold">{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
    <input type="text" name="title" value={eventFormData.title} onChange={handleFormChange} placeholder="Event Title" required className="w-full p-2 border rounded" />
    <select name="client" value={eventFormData.client} onChange={handleFormChange} required className="w-full p-2 border rounded">
      <option value="">Select Client</option>
      {clients.map(c => <option key={c.id} value={c.businessName}>{c.businessName}</option>)}
    </select>
    <div className="grid grid-cols-2 gap-4">
        <input type="date" name="startDate" value={eventFormData.startDate} onChange={handleFormChange} required className="w-full p-2 border rounded" />
        <input type="time" name="startTime" value={eventFormData.startTime} onChange={handleFormChange} required className="w-full p-2 border rounded" />
        <input type="date" name="endDate" value={eventFormData.endDate} onChange={handleFormChange} required className="w-full p-2 border rounded" />
        <input type="time" name="endTime" value={eventFormData.endTime} onChange={handleFormChange} required className="w-full p-2 border rounded" />
    </div>
    <select name="type" value={eventFormData.type} onChange={handleFormChange} required className="w-full p-2 border rounded">
      <option value="meeting">Meeting</option>
      <option value="call">Call</option>
      <option value="deadline">Deadline</option>
      <option value="payment">Payment</option>
    </select>
    <textarea name="description" value={eventFormData.description} onChange={handleFormChange} placeholder="Description" className="w-full p-2 border rounded" />
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={resetFormAndModals} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{isEdit ? 'Update Event' : 'Create Event'}</button>
    </div>
  </form>
);

const CalendarPage: React.FC<CalendarPageProps> = ({ onToggleSidebar }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    description: '',
    client: '',
    type: 'meeting',
  });

  const {
    calendarEvents,
    clients,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    fetchCalendarEvents,
    fetchClients,
  } = useAppStore();

  useEffect(() => {
    fetchCalendarEvents();
    fetchClients();
  }, [fetchCalendarEvents, fetchClients]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const events = calendarEvents.map(event => {
    const client = clients.find(c => c.id === event.clientId);
    let dateStr = '';
    if (event.startDate) {
      try {
        // Handle date string properly to avoid timezone issues
        // If startDate is already in YYYY-MM-DD format, use it directly
        if (event.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateStr = event.startDate;
        } else {
          // If it's a full datetime string, extract just the date part
          dateStr = event.startDate.split('T')[0];
        }
      } catch (e) {
        dateStr = new Date().toISOString().split('T')[0];
      }
    }
    return {
      ...event,
      date: dateStr,
      time: event.startTime || '',
      client: client?.businessName || 'Unknown Client',
    };
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const offset = direction === 'next' ? 1 : -1;
    if (view === 'month') newDate.setMonth(currentDate.getMonth() + offset);
    else if (view === 'week') newDate.setDate(currentDate.getDate() + (offset * 7));
    else newDate.setDate(currentDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'payment': return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'call': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventsForDate = (date: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleEventClick = (event: any) => {
    const fullEvent = calendarEvents.find(e => e.id === event.id);
    if (fullEvent) {
      setSelectedEvent(fullEvent);
      setShowEventDetailsModal(true);
    }
  };
  
  const resetFormAndModals = () => {
    setShowNewEventModal(false);
    setShowEditEventModal(false);
    setShowEventDetailsModal(false);
    setSelectedEvent(null);
    setEventFormData({
      title: '', startDate: '', endDate: '', startTime: '',
      endTime: '', description: '', client: '', type: 'meeting',
    });
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;
    
    const formatToYYYYMMDD = (date: any) => {
      if (!date) return '';
      // Handle date string properly to avoid timezone issues
      if (typeof date === 'string') {
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return date; // Already in YYYY-MM-DD format
        } else if (date.includes('T')) {
          return date.split('T')[0]; // Extract date from datetime string
        }
      }
      // Fallback to Date object processing
      return new Date(date).toISOString().split('T')[0];
    };
    const client = clients.find(c => c.id === selectedEvent.clientId);

    setEventFormData({
      title: selectedEvent.title || '',
      startDate: formatToYYYYMMDD(selectedEvent.startDate),
      endDate: formatToYYYYMMDD(selectedEvent.endDate || selectedEvent.startDate),
      startTime: selectedEvent.startTime || '',
      endTime: selectedEvent.endTime || '',
        description: selectedEvent.description || '',
      client: client?.businessName || '',
      type: selectedEvent.type || 'meeting',
    });
    
      setShowEventDetailsModal(false);
      setShowEditEventModal(true);
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent && confirm('Are you sure you want to delete this event?')) {
        await deleteCalendarEvent(selectedEvent.id);
      resetFormAndModals();
      fetchCalendarEvents();
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEventFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitEvent = async (e: React.FormEvent, isEdit = false) => {
    e.preventDefault();
    const { startDate, startTime, endDate, endTime, client: clientName } = eventFormData;
    
    if (new Date(`${endDate}T${endTime}`) <= new Date(`${startDate}T${startTime}`)) {
      alert('End date must be after start date.');
      return;
    }
    
    const client = clients.find(c => c.businessName === clientName);
    if (!client) {
      alert('Please select a valid client.');
      return;
    }
    
    const eventData: Partial<CalendarEvent> = {
      ...eventFormData,
      clientId: client.id,
      startDate: startDate, // Store just the date part, not datetime
      endDate: endDate, // Store just the date part, not datetime
    };

    if (isEdit && selectedEvent) {
      await updateCalendarEvent(selectedEvent.id, eventData);
    } else {
      await addCalendarEvent(eventData as CalendarEvent);
      }
    
    resetFormAndModals();
    fetchCalendarEvents();
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`prev-${i}`} className="min-h-[120px] bg-slate-50 border-b border-r border-slate-200"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
      const dayEvents = getEventsForDate(day);
      days.push(
        <div key={day} className={`min-h-[120px] p-2 border-b border-r border-slate-200 ${isToday ? 'bg-blue-50' : ''}`}>
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>{day}</div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 3).map(event => (
              <div key={event.id} onClick={() => handleEventClick(event)} className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate cursor-pointer`}>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && <div className="text-xs text-slate-500 mt-1">+{dayEvents.length - 3} more</div>}
          </div>
        </div>
      );
    }
    while (days.length % 7 !== 0) {
      days.push(<div key={`next-${days.length}`} className="min-h-[120px] bg-slate-50 border-b border-r border-slate-200"></div>);
    }
    return days;
  };

  const renderWeekView = () => {
      // Logic for week view can be re-implemented here if needed
      return <div className="p-4 text-center">Week view is under construction.</div>;
  };

  const renderDayView = () => {
      const dayEvents = getEventsForDate(currentDate.getDate());
    return (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">{currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            <div className="space-y-3">
            {dayEvents.length > 0 ? dayEvents.map(event => (
              <div key={event.id} onClick={() => handleEventClick(event)} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)} cursor-pointer`}>
                <div className="flex justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <span className="text-sm">{event.time}</span>
                  </div>
                    <p className="text-sm mt-1 opacity-75">{event.description}</p>
                  <p className="text-xs mt-1 opacity-60">{event.client}</p>
                </div>
            )) : <p className="text-slate-500">No events for this day.</p>}
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
      if (view === 'month') return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      return currentDate.toLocaleDateString('en-US', { dateStyle: 'full' });
  };
  
  const Modal = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-2">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );



  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => handleNavigation('prev')} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft /></button>
          <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
          <button onClick={() => handleNavigation('next')} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight /></button>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => setView('month')} className={`px-3 py-1 rounded-lg text-sm ${view === 'month' ? 'bg-blue-100 text-blue-700' : ''}`}>Month</button>
            <button onClick={() => setView('week')} className={`px-3 py-1 rounded-lg text-sm ${view === 'week' ? 'bg-blue-100 text-blue-700' : ''}`}>Week</button>
            <button onClick={() => setView('day')} className={`px-3 py-1 rounded-lg text-sm ${view === 'day' ? 'bg-blue-100 text-blue-700' : ''}`}>Day</button>
        </div>
        <button onClick={() => setShowNewEventModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"><Plus className="w-4 h-4" /><span>New Event</span></button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {(view === 'month' || view === 'week') && (
          <div className="grid grid-cols-7 text-center font-medium text-slate-600 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-3">{day}</div>)}
          </div>
          )}
        {view === 'month' && <div className="grid grid-cols-7 border-l border-t border-slate-200">{renderCalendarDays()}</div>}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
      </div>

      {showNewEventModal && (
        <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <EventForm 
              isEdit={false} 
              eventFormData={eventFormData}
              handleFormChange={handleFormChange}
              handleSubmitEvent={handleSubmitEvent}
              resetFormAndModals={resetFormAndModals}
              clients={clients}
            />
          </div>
        </div>
      )}
      {showEditEventModal && (
        <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <EventForm 
              isEdit={true} 
              eventFormData={eventFormData}
              handleFormChange={handleFormChange}
              handleSubmitEvent={handleSubmitEvent}
              resetFormAndModals={resetFormAndModals}
              clients={clients}
            />
          </div>
        </div>
      )}

      {showEventDetailsModal && selectedEvent && (
        <EventPopup
          event={selectedEvent}
          clients={clients}
          onClose={resetFormAndModals}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}
        </div>
  );
};

export default CalendarPage;