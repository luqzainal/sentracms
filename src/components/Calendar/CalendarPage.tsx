import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, X, Menu } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

interface CalendarPageProps {
  onToggleSidebar?: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onToggleSidebar }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    description: '',
    client: ''
  });

  const { calendarEvents, clients, addCalendarEvent } = useAppStore();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Convert calendar events to display format
  const events = calendarEvents.map(event => {
    const client = clients.find(c => c.id === event.clientId);
    return {
      id: event.id,
      title: event.title,
      date: event.startDate,
      time: event.startTime,
      type: event.type,
      client: client?.businessName || 'Unknown Client',
      description: event.description
    };
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

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

  const getEventsForDate = (date: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = 42; // 6 weeks * 7 days

    // Previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
      const day = prevMonth.getDate() - i;
      days.push(
        <div key={`prev-${day}`} className="min-h-24 p-2 text-slate-400 bg-slate-50">
          <span className="text-sm">{day}</span>
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && 
                     today.getMonth() === currentDate.getMonth() && 
                     today.getFullYear() === currentDate.getFullYear();
      const dayEvents = getEventsForDate(day);

      days.push(
        <div key={day} className={`min-h-24 p-2 border-b border-r border-slate-200 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate cursor-pointer hover:opacity-80 transition-opacity`}
                title={`${event.title} - ${event.time}`}
                onClick={() => handleEventClick(event)}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Next month's days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="min-h-24 p-2 text-slate-400 bg-slate-50">
          <span className="text-sm">{day}</span>
        </div>
      );
    }

    return days;
  };

  const handleNewEventClick = () => {
    setShowNewEventModal(true);
  };

  const handleCloseModal = () => {
    setShowNewEventModal(false);
    setEventFormData({
      title: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      description: '',
      client: ''
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that end date/time is after start date/time
    const startDateTime = new Date(`${eventFormData.startDate}T${eventFormData.startTime}`);
    const endDateTime = new Date(`${eventFormData.endDate}T${eventFormData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      alert('End date and time must be after start date and time');
      return;
    }
    
    // Find client ID
    const selectedClient = clients.find(c => c.businessName === eventFormData.client);
    
    addCalendarEvent({
      clientId: selectedClient?.id || 0,
      title: eventFormData.title,
      startDate: eventFormData.startDate,
      endDate: eventFormData.endDate,
      startTime: eventFormData.startTime,
      endTime: eventFormData.endTime,
      description: eventFormData.description,
      type: 'meeting'
    });
    
    // Close modal and reset form
    handleCloseModal();
    
    // Show success message
    alert('Event created successfully!');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 relative">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-600 text-sm lg:text-base">Manage appointments, deadlines, and important dates</p>
        </div>
        </div>
        <button 
          onClick={handleNewEventClick}
          className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm lg:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Calendar Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:p-6 border-b border-slate-200 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 lg:p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-slate-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 lg:p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div className="flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setView('month')}
              className={`px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                view === 'day' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-3 lg:p-6">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-0 mb-2 lg:mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 lg:p-3 text-center text-xs lg:text-sm font-medium text-slate-600 border-b border-slate-200">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border-l border-t border-slate-200">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Upcoming Events</h3>
        <div className="space-y-2 lg:space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center space-x-3 lg:space-x-4 p-3 bg-slate-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                event.type === 'meeting' ? 'bg-blue-500' :
                event.type === 'payment' ? 'bg-green-500' :
                event.type === 'deadline' ? 'bg-red-500' :
                'bg-purple-500'
              }`} />
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 text-sm lg:text-base">{event.title}</h4>
                <p className="text-xs lg:text-sm text-slate-600">{event.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center text-xs lg:text-sm text-slate-600 mb-1">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {event.date}
                </div>
                <div className="flex items-center text-xs lg:text-sm text-slate-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {event.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-200">
              <h2 className="text-lg lg:text-xl font-semibold text-slate-900">Create New Event</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
              {/* Event Title */}
              <div>
                <label className="block text-sm lg:text-base font-medium text-slate-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={eventFormData.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm lg:text-base"
                  placeholder="Enter event title"
                />
              </div>

              {/* Client */}
              <div>
                <div>
                  <label className="block text-sm lg:text-base font-medium text-slate-700 mb-2">
                    Client
                  </label>
                  <select
                    name="client"
                    value={eventFormData.client}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm lg:text-base"
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.businessName}>
                        {client.businessName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date and Time */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm lg:text-base font-medium text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={eventFormData.startDate}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm lg:text-base"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm lg:text-base font-medium text-slate-700 mb-2">
                    Start Time *
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="startTime"
                      value={eventFormData.startTime}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm lg:text-base"
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* End Date and Time */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm lg:text-base font-medium text-slate-700 mb-2">
                    End Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={eventFormData.endDate}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm lg:text-base"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm lg:text-base font-medium text-slate-700 mb-2">
                    End Time *
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="endTime"
                      value={eventFormData.endTime}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm lg:text-base"
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm lg:text-base font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={eventFormData.description}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm lg:text-base"
                  placeholder="Enter event description..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Event Details</h3>
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <p className="text-slate-900 font-medium">{selectedEvent.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <div className="flex items-center space-x-1 text-slate-900">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Time
                </label>
                <div className="flex items-center space-x-1 text-slate-900">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{selectedEvent.time}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client
                </label>
                <div className="flex items-center space-x-1 text-slate-900">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{selectedEvent.client}</span>
                </div>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <p className="text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Event Type
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(selectedEvent.type)}`}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-slate-200">
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
  );
};

export default CalendarPage;