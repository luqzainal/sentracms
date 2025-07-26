import React, { useState, useMemo, useCallback } from 'react';
import { CheckCircle, DollarSign, Phone, Mail, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore, CalendarEvent } from '../../store/AppStore';
import EventPopup from '../common/EventPopup';
import { useNavigate } from 'react-router-dom';

interface ClientPortalDashboardProps {
  user: { email: string };
}

const ClientPortalDashboard: React.FC<ClientPortalDashboardProps> = () => {
  // All hooks at the top - ALWAYS called in same order
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { 
    clients, 
    calendarEvents,
    calculateClientProgressStatus,
    getComponentsByClientId,
    getInvoicesByClientId,
    getProgressStepsByClientId
  } = useAppStore();

  // Data processing - AFTER all hooks
  const client = clients.length > 0 ? clients[0] : null;
  
  // Only process data if client exists
  if (client) getComponentsByClientId(client.id);
  const invoices = client ? getInvoicesByClientId(client.id) : [];
  const progressStatus = client ? calculateClientProgressStatus(client.id) : { percentage: 0 };
  const { percentage: progressPercentage } = progressStatus;

  // Calendar logic - ALWAYS executed
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const clientAppointments = useMemo(() => 
    client ? calendarEvents.filter(e => e.clientId === client.id) : [], 
    [calendarEvents, client]
  );
  
  const events = useMemo(() => clientAppointments.map(event => {
    let dateStr = '';
    if (event.startDate) {
      if (typeof event.startDate === 'string') {
        dateStr = event.startDate.split('T')[0];
          } else {
        const d = new Date(event.startDate);
        dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    }
    return { ...event, date: dateStr, time: event.startTime || '' };
  }), [clientAppointments]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(current => {
      const newDate = new Date(current);
      const offset = direction === 'next' ? 1 : -1;
      if (calendarView === 'month') newDate.setMonth(newDate.getMonth() + offset);
      else if (calendarView === 'week') newDate.setDate(newDate.getDate() + (offset * 7));
      else newDate.setDate(newDate.getDate() + offset);
      return newDate;
    });
  }, [calendarView]);

  const getEventsForDate = useCallback((date: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  }, [currentDate, events]);

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`prev-${i}`} className="min-h-[60px] md:min-h-[80px] bg-slate-50 border-b border-r border-slate-200"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
      const dayEvents = getEventsForDate(day);
      days.push(
        <div key={day} className={`min-h-[60px] md:min-h-[80px] p-1 md:p-2 border-b border-r border-slate-200 ${isToday ? 'bg-blue-50' : ''}`}> 
          <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : ''}`}>{day}</div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 2).map(event => (
              <div key={event.id} onClick={() => handleEventClick(event)} className="text-xs p-1 rounded border bg-blue-50 text-blue-800 border-blue-200 truncate cursor-pointer hover:bg-blue-100">{event.title}</div>
            ))}
            {dayEvents.length > 2 && <div className="text-xs text-slate-500 mt-1">+{dayEvents.length - 2} more</div>}
          </div>
        </div>
      );
    }
    while (days.length % 7 !== 0) {
      days.push(<div key={`next-${days.length}`} className="min-h-[60px] md:min-h-[80px] bg-slate-50 border-b border-r border-slate-200"></div>);
    }
    return days;
  };

  // Event handlers - ALWAYS defined
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventPopup(true);
  };
  
  const closeEventPopup = () => {
    setShowEventPopup(false);
    setSelectedEvent(null);
  };

  // Component definitions - ALWAYS defined

  const MiniCard = ({ label, value, color }: { label: string, value: string, color?: string }) => (
    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-200 px-3 md:px-4 py-2 min-w-[100px] md:min-w-[120px]">
      <span className="text-xs text-slate-500 mb-1">{label}</span>
      <span className={`text-base md:text-lg font-bold ${color || 'text-slate-900'}`}>{value}</span>
    </div>
  );

  // Data calculations - only if client exists
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paid, 0);
  const outstanding = invoices.reduce((sum, inv) => sum + inv.due, 0);

  const progressSteps = client ? getProgressStepsByClientId(client.id) : [];
  const totalSteps = progressSteps.length;
  const completedSteps = progressSteps.filter(s => s.completed).length;
  const pendingSteps = totalSteps - completedSteps;
  const showMore = totalSteps > 3;
  const visibleSteps = progressSteps.slice(0, 3);

  // MAIN RETURN - conditional rendering based on client
  return (
    <div className="h-full flex flex-col px-4 md:px-8 pt-4 md:pt-6">
      {!client ? (
        // Loading state when no client data
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading client data...</p>
            </div>
        </div>
      ) : (
        // Main dashboard content when client exists
        <>
          {/* Header - Mobile Responsive */}
          <header className="flex-shrink-0 mb-4 md:mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-lg md:text-xl font-bold text-slate-900">Hi, {client.name} 👋</h1>
              <p className="text-slate-600 text-sm">Welcome to your portal.</p>
            </div>
            
            {/* Contact Info - Mobile Responsive */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 shadow-sm w-full lg:min-w-[340px] lg:w-auto">
              <div className="text-center md:text-left">
                <div className="text-sm md:text-base font-semibold text-slate-800 mb-0.5">Need Help?</div>
                <div className="text-xs text-slate-500">Contact our support team.</div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-red-500" /></span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-700">Phone</div>
                    <div className="text-xs text-slate-600">03 9388 0531</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 text-blue-600" /></span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-700">Email</div>
                    <div className="text-xs text-slate-600 truncate">evodagang.malaysia@gmail.com</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Grid: Mobile Stacked, Desktop 3-column */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 flex-1">
            {/* Left Column: Progress + Billing - Mobile Stack */}
            <div className="flex flex-col lg:h-full space-y-4">
              {/* Progress Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 md:px-6 py-4 md:py-5 flex flex-col justify-center">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-blue-100 rounded flex items-center justify-center mr-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-slate-700">Progress</span>
                  <span className="ml-auto text-sm md:text-base font-bold text-slate-900">{progressPercentage}%</span>
                  <span className="ml-2 md:ml-4 text-xs md:text-sm font-medium text-slate-500">
                    {pendingSteps === 0 ? 'All done' : `${pendingSteps} more pending`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-1 mb-3">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <ul className="space-y-2">
                  {visibleSteps.map((step, idx) => (
                    <li key={step.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-xs font-bold text-slate-400 w-4 text-right flex-shrink-0`}>{idx + 1}.</span>
                        <span className={`flex-1 text-xs md:text-sm ${step.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'} truncate`}>{step.title}</span>
                        {step.description && (
                          <span className="hidden md:inline ml-2 text-xs text-slate-400 italic truncate">{step.description}</span>
                        )}
                      </div>
                      {step.completed ? (
                        <span className="ml-2 flex items-center gap-1 text-green-600 font-semibold flex-shrink-0"><CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Done</span></span>
                      ) : (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 font-semibold flex-shrink-0">Pending</span>
                      )}
                    </li>
                  ))}
                </ul>
                {showMore && (
                  <div className="flex justify-end mt-3">
                    <button onClick={() => navigate('/client/progress')} className="flex items-center text-blue-600 hover:underline text-sm font-medium">
                      More details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Billing Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 md:px-6 py-4 flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded flex items-center justify-center mr-2 md:mr-3">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  </div>
                  <span className="text-base md:text-lg font-semibold text-slate-700">Billing</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <MiniCard label="Total Invoiced" value={`RM ${totalAmount.toLocaleString()}`} />
                  <MiniCard label="Paid" value={`RM ${paidAmount.toLocaleString()}`} color="text-green-600" />
                  <MiniCard label="Outstanding" value={`RM ${outstanding.toLocaleString()}`} color="text-red-600" />
                </div>
                <button onClick={() => navigate('/client/billing')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">View Details</button>
              </div>
            </div>

            {/* Calendar Section - Mobile Full Width, Desktop 2 Columns */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <button onClick={() => handleNavigation('prev')} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /></button>
                  <h2 className="text-base md:text-lg font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                  <button onClick={() => handleNavigation('next')} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></button>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <button onClick={() => setCalendarView('month')} className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm ${calendarView === 'month' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Month</button>
                  <button onClick={() => setCalendarView('week')} className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm ${calendarView === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Week</button>
                  <button onClick={() => setCalendarView('day')} className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm ${calendarView === 'day' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Day</button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-[300px] md:min-h-[400px]">
                {calendarView === 'month' && (
                  <>
                    <div className="grid grid-cols-7 text-center font-medium text-slate-600 border-b">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-2 text-xs">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 border-l border-t border-slate-200 flex-1">{renderCalendarDays()}</div>
                  </>
                )}
                {(calendarView === 'week' || calendarView === 'day') && (
                  <div className="flex flex-1 items-center justify-center text-slate-400">
                    <div className="text-center">
                      <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm">{calendarView.charAt(0).toUpperCase() + calendarView.slice(1)} view coming soon.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Event Popup - outside conditional rendering */}
      {showEventPopup && selectedEvent && (
        <EventPopup event={selectedEvent} clients={clients} onClose={closeEventPopup} onEdit={() => {}} onDelete={() => {}} />
      )}
    </div>
  );
};

export default ClientPortalDashboard;