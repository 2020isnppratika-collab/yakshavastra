import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Shield } from "lucide-react";
import { api } from "../../api/client";

export const AdminCalendar: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    setLoading(true);
    api.admin
      .getCalendar()
      .then((data) => setEvents(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block">
            Admin Schedule Planner
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">Costume Rental Calendar</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Overview of upcoming bookings, dispatches, and warehouse occupancy.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm">
          <button onClick={prevMonth} className="p-1 hover:bg-stone-100 rounded text-stone-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold font-serif text-stone-900 px-3">{monthName}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-stone-100 rounded text-stone-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex space-x-3 border-b border-stone-200 text-xs font-bold pb-2">
        <Link to="/admin" className="text-stone-500 hover:text-stone-900 pb-2">Dashboard</Link>
        <Link to="/admin/bookings" className="text-stone-500 hover:text-stone-900 pb-2">Bookings Manager</Link>
        <Link to="/admin/costumes" className="text-stone-500 hover:text-stone-900 pb-2">Costume Inventory</Link>
        <Link to="/admin/calendar" className="text-red-900 border-b-2 border-red-900 pb-2">Rental Schedule Calendar</Link>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[110px] rounded-2xl bg-stone-50/50 p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const matchingEvents = events.filter((e) => dayStr >= e.start_at && dayStr <= e.end_at);

            return (
              <div
                key={dayStr}
                className="min-h-[110px] rounded-2xl border border-stone-200 p-2.5 flex flex-col justify-between hover:bg-amber-50/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span>{dayNum}</span>
                  {matchingEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-900" title={`${matchingEvents.length} active`} />
                  )}
                </div>

                <div className="space-y-1 mt-1 overflow-y-auto max-h-[75px]">
                  {matchingEvents.map((ev, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 rounded text-[10px] font-medium bg-red-900/10 text-red-950 border border-red-900/20 truncate"
                      title={`${ev.costume_name} - ${ev.customer_name} (${ev.slot})`}
                    >
                      <strong className="block truncate">{ev.costume_name}</strong>
                      <span className="text-stone-500 truncate block">{ev.slot}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
