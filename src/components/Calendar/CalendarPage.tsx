import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import EventPopup from '../common/EventPopup';
import { CalendarEvent } from '../../store/AppStore';
import ConfirmationModal from '../common/ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';

interface CalendarPageProps {
  onToggleSidebar?: () => void;
}

interface EventFormData {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
  client: string;
  type: string;
}

interface ClientData {
  id: number;
  businessName: string;
}

interface EventFormProps {
  isEdit: boolean;
  eventFormData: EventFormData;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmitEvent: (e: React.FormEvent, isEdit: boolean) => void;
  resetFormAndModals: () => void;
  clients: ClientData[];
}

const EventForm: React.FC<EventFormProps> = React.memo(({ isEdit, eventFormData, handleFormChange, handleSubmitEvent, resetFormAndModals, clients }) => (
  <form onSubmit={(e) => handleSubmitEvent(e, isEdit)} className="space-y-4">
    <h2 className="text-xl font-semibold">{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
    <input 
      type="text" 
      name="title" 
      value={eventFormData.title} 
      onChange={handleFormChange} 
      placeholder="Event Title" 
      required 
      className="w-full p-2 border rounded" 
    />
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
      <option value="onboarding">Onboarding</option>
      <option value="handover">Handover</option>
    </select>
    <textarea 
      name="description" 
      value={eventFormData.description} 
      onChange={handleFormChange} 
      placeholder="Description" 
      className="w-full p-2 border rounded" 
    />
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={resetFormAndModals} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{isEdit ? 'Update Event' : 'Create Event'}</button>
    </div>
  </form>
));

const CalendarPage: React.FC<CalendarPageProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventFormData, setEventFormData] = useState(() => {
    const today = new Date();
    // Use local date formatting instead of toISOString to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return {
      title: '',
      startDate: todayStr,
      endDate: todayStr,
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      client: '',
      type: 'onboarding',
    };
  });

  // Memoize eventFormData to prevent unnecessary re-renders
  const memoizedEventFormData = useMemo(() => eventFormData, [eventFormData]);

  const {
    calendarEvents,
    clients,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    fetchCalendarEvents,
    fetchClients,
  } = useAppStore();

  // Custom confirmation modal
  const { confirmation, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  useEffect(() => {
    fetchCalendarEvents();
    fetchClients();
  }, [fetchCalendarEvents, fetchClients]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const events = useMemo(() => {
    return calendarEvents.map(event => {
      const client = clients.find(c => c.id === event.clientId);
      let dateStr = '';
      
      if (event.startDate) {
        try {
          // Handle date string properly to avoid timezone issues
          if (typeof event.startDate === 'string') {
            // If startDate is already in YYYY-MM-DD format, use it directly
            if (event.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              dateStr = event.startDate;
            } else if (event.startDate.includes('T')) {
              // If it's a full datetime string, extract just the date part
              dateStr = event.startDate.split('T')[0];
            } else {
              // Try to parse as Date object and format locally to avoid timezone issues
              const parsedDate = new Date(event.startDate);
              if (!isNaN(parsedDate.getTime())) {
                // Use local date formatting instead of toISOString to avoid timezone issues
                const year = parsedDate.getFullYear();
                const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                const day = String(parsedDate.getDate()).padStart(2, '0');
                dateStr = `${year}-${month}-${day}`;
              }
            }
          } else {
            // If it's a Date object, format locally
            const parsedDate = new Date(event.startDate);
            if (!isNaN(parsedDate.getTime())) {
              // Use local date formatting instead of toISOString to avoid timezone issues
              const year = parsedDate.getFullYear();
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
              const day = String(parsedDate.getDate()).padStart(2, '0');
              dateStr = `${year}-${month}-${day}`;
            }
          }
        } catch (e) {
          console.error('Error parsing event date:', event.startDate, e);
          // Don't fall back to today's date, just skip this event
          return null;
        }
      }
      
      // Only return event if we have a valid date
      if (!dateStr) {
        console.warn('Event has no valid start date:', event);
        return null;
      }
      
      return {
        ...event,
        date: dateStr,
        time: event.startTime || '',
        client: client?.businessName || 'Unknown Client',
      };
    }).filter((event): event is NonNullable<typeof event> => event !== null); // Remove null events with proper typing
  }, [calendarEvents, clients]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const offset = direction === 'next' ? 1 : -1;
    
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + offset);
    } else if (view === 'week') {
      // Navigate by weeks (7 days)
      newDate.setDate(currentDate.getDate() + (offset * 7));
    } else {
      // Day view - navigate by days
      newDate.setDate(currentDate.getDate() + offset);
    }
    
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'onboarding': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'handover': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventsForDate = useCallback((date: number) => {
    // Use consistent date formatting that matches the events mapping
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    
    // Also check for events that might have different date formats
    return events.filter(event => {
      // Direct match
      if (event.date === dateStr) return true;
      
      // Try to parse and compare dates if formats don't match
      try {
        const eventDate = new Date(event.date);
        const targetDate = new Date(dateStr);
        return eventDate.getFullYear() === targetDate.getFullYear() &&
               eventDate.getMonth() === targetDate.getMonth() &&
               eventDate.getDate() === targetDate.getDate();
      } catch {
        return false;
      }
    });
  }, [currentDate, events]);

  const handleEventClick = useCallback((event: { id: string }) => {
    const fullEvent = calendarEvents.find(e => e.id === event.id);
    if (fullEvent) {
      setSelectedEvent(fullEvent);
      setShowEventDetailsModal(true);
    }
  }, [calendarEvents]);
  
  const resetFormAndModals = useCallback(() => {
    setShowEditEventModal(false);
    setShowEventDetailsModal(false);
    setSelectedEvent(null);
    
    // Set default dates to today when resetting for new event
    const today = new Date();
    // Use local date formatting instead of toISOString to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    setEventFormData({
      title: '', 
      startDate: todayStr, 
      endDate: todayStr, 
      startTime: '09:00',
      endTime: '10:00', 
      description: '', 
      client: '', 
      type: 'onboarding',
    });
  }, []);

  const handleEditEvent = useCallback(() => {
    if (!selectedEvent) return;
    
    const formatToYYYYMMDD = (date: unknown) => {
      if (!date) return '';
      // Handle date string properly to avoid timezone issues
      if (typeof date === 'string') {
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return date; // Already in YYYY-MM-DD format
        } else if (date.includes('T')) {
          return date.split('T')[0]; // Extract date from datetime string
        }
      }
      // Fallback to Date object processing with local formatting
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return '';
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
  }, [selectedEvent, clients]);

  const handleDeleteEvent = useCallback(async () => {
    if (selectedEvent) {
      showConfirmation(
        () => deleteCalendarEvent(selectedEvent.id),
        {
          title: 'Delete Event',
          message: 'Are you sure you want to delete this event?',
          confirmText: 'Delete',
          type: 'danger'
        }
      );
    }
  }, [selectedEvent, showConfirmation, deleteCalendarEvent]);

  const formDataRef = useRef(eventFormData);
  formDataRef.current = eventFormData;

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventFormData(prev => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (prev[name as keyof typeof prev] === value) {
        return prev;
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSubmitEvent = useCallback(async (e: React.FormEvent, isEdit = false) => {
    e.preventDefault();
    
    // Get current form data from ref to avoid stale closures
    const currentFormData = formDataRef.current;
    const { startDate, startTime, endDate, endTime, client: clientName } = currentFormData;
    
    // Fix validation: Allow same start and end date, but end time must be after start time if same date
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (endDateTime < startDateTime) {
      alert('End date and time must be after or equal to start date and time.');
      return;
    }
    
    const client = clients.find(c => c.businessName === clientName);
    if (!client) {
      alert('Please select a valid client.');
      return;
    }
    
    const eventData: Partial<CalendarEvent> = {
      ...currentFormData,
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
    // No need to call fetchCalendarEvents() since add/update already updates the state
  }, [clients, selectedEvent, updateCalendarEvent, addCalendarEvent, resetFormAndModals, fetchCalendarEvents]);

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
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    // Generate array of 7 days starting from Sunday
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    
    // Get events for each day of the week
    const getEventsForWeekDay = (date: Date) => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      return events.filter(event => {
        // Direct match
        if (event.date === dateStr) return true;
        
        // Try to parse and compare dates if formats don't match
        try {
          const eventDate = new Date(event.date);
          const targetDate = new Date(dateStr);
          return eventDate.getFullYear() === targetDate.getFullYear() &&
                 eventDate.getMonth() === targetDate.getMonth() &&
                 eventDate.getDate() === targetDate.getDate();
        } catch {
          return false;
        }
      });
    };
    
    const today = new Date();
    const isToday = (date: Date) => {
      return date.getDate() === today.getDate() && 
             date.getMonth() === today.getMonth() && 
             date.getFullYear() === today.getFullYear();
    };
    
    return (
      <div className="grid grid-cols-7 border-l border-t border-slate-200">
        {weekDays.map((date, index) => {
          const dayEvents = getEventsForWeekDay(date);
          const isCurrentDay = isToday(date);
          
          return (
            <div 
              key={index} 
              className={`min-h-[200px] p-2 border-b border-r border-slate-200 ${isCurrentDay ? 'bg-blue-50' : ''}`}
            >
              <div className={`text-sm font-medium mb-2 ${isCurrentDay ? 'text-blue-600' : 'text-slate-700'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold mb-2 ${isCurrentDay ? 'text-blue-600' : 'text-slate-900'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map(event => (
                  <div 
                    key={event.id} 
                    onClick={() => handleEventClick(event)} 
                    className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate cursor-pointer hover:opacity-80`}
                    title={`${event.title} - ${event.time}`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-75">{event.time}</div>
                  </div>
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-xs text-slate-500 mt-1">
                    +{dayEvents.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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
    if (view === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
      
      // Get the end of the week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startMonth = startOfWeek.getMonth();
      const endMonth = endOfWeek.getMonth();
      const year = startOfWeek.getFullYear();
      
      if (startMonth === endMonth) {
        return `${monthNames[startMonth]} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${year}`;
      } else {
        return `${monthNames[startMonth]} ${startOfWeek.getDate()} - ${monthNames[endMonth]} ${endOfWeek.getDate()}, ${year}`;
      }
    } else {
      return currentDate.toLocaleDateString('en-US', { dateStyle: 'full' });
    }
  };
  
  const Modal = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
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


      {showEditEventModal && (
        <Modal onClose={() => setShowEditEventModal(false)}>
          <EventForm 
            isEdit={true} 
            eventFormData={memoizedEventFormData}
            handleFormChange={handleFormChange}
            handleSubmitEvent={handleSubmitEvent}
            resetFormAndModals={resetFormAndModals}
            clients={clients}
          />
        </Modal>
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

      {/* Custom Confirmation Modal */}
      {confirmation && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          onClose={hideConfirmation}
          onConfirm={handleConfirm}
          title={confirmation.title || 'Confirm Action'}
          message={confirmation.message}
          confirmText={confirmation.confirmText}
          cancelText={confirmation.cancelText}
          type={confirmation.type}
          icon={confirmation.icon}
        />
      )}
        </div>
  );
};

export default CalendarPage;
