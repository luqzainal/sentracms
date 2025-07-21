import React, { useState, useMemo, useCallback } from 'react';
import { CheckCircle, Package, DollarSign, Phone, Mail, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore, CalendarEvent } from '../../store/AppStore';
import EventPopup from '../common/EventPopup';
import { useNavigate } from 'react-router-dom';

interface ClientPortalDashboardProps {
  user: any;
}

const ClientPortalDashboard: React.FC<ClientPortalDashboardProps> = ({ user }) => {
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
  const components = client ? getComponentsByClientId(client.id) : [];
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
      days.push(<div key={`prev-${i}`} className="min-h-[80px] bg-slate-50 border-b border-r border-slate-200"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
      const dayEvents = getEventsForDate(day);
      days.push(
        <div key={day} className={`min-h-[80px] p-2 border-b border-r border-slate-200 ${isToday ? 'bg-blue-50' : ''}`}> 
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
      days.push(<div key={`next-${days.length}`} className="min-h-[80px] bg-slate-50 border-b border-r border-slate-200"></div>);
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
  const StatCard = ({ icon, title, value, onClick, colorClass }: { icon: React.ReactNode, title: string, value: string, onClick?: () => void, colorClass: string }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-slate-200 px-6 py-4 flex flex-col items-start justify-center ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''} min-w-[180px] min-h-[80px] group`}
      style={{ boxShadow: '0 2px 8px 0 rgba(30,41,59,0.04)' }}
    >
      <div className="flex items-center mb-2">
        <div className={`w-8 h-8 ${colorClass} rounded flex items-center justify-center mr-3 group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        <span className="text-base font-semibold text-slate-700 tracking-tight">{title}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
    </div>
  );

  const MiniCard = ({ label, value, color }: { label: string, value: string, color?: string }) => (
    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-200 px-4 py-2 min-w-[120px]">
      <span className="text-xs text-slate-500 mb-1">{label}</span>
      <span className={`text-lg font-bold ${color || 'text-slate-900'}`}>{value}</span>
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
    <div className="h-full flex flex-col px-8 pt-6">
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
          {/* Header */}
          <header className="flex-shrink-0 mb-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Hi, {client.name} 👋</h1>
              <p className="text-slate-600 text-sm">Welcome to your portal.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-6 py-3 flex items-center gap-6 shadow-sm min-w-[340px]">
              <div>
                <div className="text-base font-semibold text-slate-800 mb-0.5">Need Help?</div>
                <div className="text-xs text-slate-500">Contact our support team.</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><Phone className="w-4 h-4 text-red-500" /></span>
              <div>
                    <div className="text-xs font-semibold text-slate-700">Phone</div>
                    <div className="text-xs text-slate-600">03 9388 0531</div>
              </div>
            </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Mail className="w-4 h-4 text-blue-600" /></span>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Email</div>
                    <div className="text-xs text-slate-600">evodagang.malaysia@gmail.com</div>
          </div>
              </div>
              </div>
            </div>
          </header>

          {/* Main Content Grid: Progress + Billing (kiri), Calendar (kanan) */}
          <div className="grid grid-cols-3 gap-6 flex-1">
            {/* Left Column: Progress + Billing */}
            <div className="flex flex-col h-full">
              {/* Progress Bar + Steps (atas) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-3 flex flex-col justify-center mb-4">
                <div className="flex items-center mb-1">
                  <div className="w-7 h-7 bg-blue-100 rounded flex items-center justify-center mr-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
                  <span className="text-base font-semibold text-slate-700">Progress</span>
                  <span className="ml-auto text-base font-bold text-slate-900">{progressPercentage}%</span>
                  <span className="ml-4 text-sm font-medium text-slate-500">
                    {pendingSteps === 0 ? 'All done' : `${pendingSteps} more pending`}
                  </span>
        </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-1 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <ul className="mt-3 space-y-2">
                  {visibleSteps.map((step, idx) => (
                    <li key={step.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold text-slate-400 w-5 text-right`}>{idx + 1}.</span>
                        <span className={`flex-1 text-sm ${step.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>{step.title}</span>
                        {step.description && (
                          <span className="ml-2 text-xs text-slate-400 italic">{step.description}</span>
                        )}
                      </div>
                      {step.completed ? (
                        <span className="ml-3 flex items-center gap-1 text-green-600 font-semibold"><CheckCircle className="w-4 h-4" /> Done</span>
                      ) : (
                        <span className="ml-3 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 font-semibold">Pending</span>
                      )}
                    </li>
                  ))}
                </ul>
                {showMore && (
                  <div className="flex justify-end mt-2">
                    <button onClick={() => navigate('/client/progress')} className="flex items-center text-blue-600 hover:underline text-sm font-medium">
                      More details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Billing Card (bawah) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4 flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-lg font-semibold text-slate-700">Billing</span>
              </div>
                <div className="grid grid-cols-1 gap-2">
                  <MiniCard label="Total Invoiced" value={`RM ${totalAmount.toLocaleString()}`} />
                  <MiniCard label="Paid" value={`RM ${paidAmount.toLocaleString()}`} color="text-green-600" />
                  <MiniCard label="Outstanding" value={`RM ${outstanding.toLocaleString()}`} color="text-red-600" />
                </div>
                <button onClick={() => navigate('/client/billing')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">View Details</button>
            </div>
          </div>

            {/* Calendar Main (kanan, besar) */}
            <div className="col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleNavigation('prev')} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft /></button>
                  <h2 className="text-lg font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                  <button onClick={() => handleNavigation('next')} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight /></button>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setCalendarView('month')} className={`px-3 py-1 rounded-lg text-sm ${calendarView === 'month' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Month</button>
                  <button onClick={() => setCalendarView('week')} className={`px-3 py-1 rounded-lg text-sm ${calendarView === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Week</button>
                  <button onClick={() => setCalendarView('day')} className={`px-3 py-1 rounded-lg text-sm ${calendarView === 'day' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Day</button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                {calendarView === 'month' && (
                  <>
                    <div className="grid grid-cols-7 text-center font-medium text-slate-600 border-b">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-2 text-xs">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 border-l border-t border-slate-200 flex-1 min-h-[320px]">{renderCalendarDays()}</div>
                  </>
                )}
                {(calendarView === 'week' || calendarView === 'day') && (
                  <div className="flex flex-1 items-center justify-center text-slate-400">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="ml-2">{calendarView.charAt(0).toUpperCase() + calendarView.slice(1)} view coming soon.</span>
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