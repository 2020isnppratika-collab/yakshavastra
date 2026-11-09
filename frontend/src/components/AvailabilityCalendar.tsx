import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle, Info, Clock } from "lucide-react";
import { api } from "../api/client";
import { SlotType } from "../types";

interface AvailabilityCalendarProps {
  costumeId: string;
  startDate: string;
  endDate: string;
  selectedSlot: SlotType;
  onSelectRange: (start: string, end: string) => void;
  bufferDays: number;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  costumeId,
  startDate,
  endDate,
  selectedSlot,
  onSelectRange,
  bufferDays,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarData, setCalendarData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    setIsLoading(true);
    api.costumes
      .getAvailability(costumeId, { year, month })
      .then((data) => setCalendarData(data))
      .catch((err) => console.error("Error loading calendar:", err))
      .finally(() => setIsLoading(false));
  }, [costumeId, year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  // Generate calendar grid (including leading blanks for day of week)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const handleDayClick = (dayStr: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    if (!startDate || (startDate && endDate)) {
      // Start a new selection
      onSelectRange(dayStr, dayStr);
    } else if (startDate && !endDate) {
      if (dayStr < startDate) {
        onSelectRange(dayStr, startDate);
      } else {
        onSelectRange(startDate, dayStr);
      }
    }
  };

  const daysMap = new Map();
  if (calendarData && calendarData.days) {
    calendarData.days.forEach((d: any) => {
      daysMap.set(d.date, d);
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-stone-200 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-900" />
          <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">{monthName}</h3>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={prevMonth}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs font-semibold text-stone-500 mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Leading empty spaces */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`blank-${i}`} className="h-13 sm:h-16 rounded-lg sm:rounded-xl bg-stone-50/50" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dayStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const dayInfo = daysMap.get(dayStr);
          const isPast = dayStr < todayStr;

          // Slot-specific availability check if slot is not full_day
          let isAvailable = dayInfo ? dayInfo.is_available : true;
          let unitsLeft = dayInfo ? dayInfo.units_available : 1;

          if (dayInfo && selectedSlot !== "full_day" && dayInfo.slots?.[selectedSlot]) {
            isAvailable = dayInfo.slots[selectedSlot].is_available;
            unitsLeft = dayInfo.slots[selectedSlot].available_units;
          }

          if (isPast) {
            isAvailable = false;
          }

          const isSelectedStart = startDate === dayStr;
          const isSelectedEnd = endDate === dayStr;
          const isInRange = startDate && endDate && dayStr >= startDate && dayStr <= endDate;

          let bgClass = "bg-stone-50 hover:bg-amber-50 text-stone-800 border-stone-200";
          if (!isAvailable) {
            bgClass = "bg-stone-100 text-stone-400 border-dashed border-stone-300 cursor-not-allowed opacity-60";
          } else if (isSelectedStart || isSelectedEnd) {
            bgClass = "bg-red-900 text-amber-100 border-red-950 font-bold shadow-md ring-2 ring-amber-400";
          } else if (isInRange) {
            bgClass = "bg-amber-100/80 text-red-950 border-amber-300 font-semibold";
          }

          return (
            <button
              key={dayStr}
              type="button"
              disabled={!isAvailable}
              onClick={() => handleDayClick(dayStr, isAvailable)}
              className={`h-13 sm:h-16 rounded-lg sm:rounded-xl border p-1 sm:p-1.5 flex flex-col justify-between text-left transition-all relative ${bgClass}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[11px] sm:text-xs font-semibold ${isSelectedStart || isSelectedEnd ? "text-amber-300" : ""}`}>
                  {dayNum}
                </span>
                {dayStr === todayStr && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Today" />
                )}
              </div>

              <div className="text-[9px] sm:text-[10px] leading-tight truncate">
                {isPast ? (
                  <span className="text-stone-400">Past</span>
                ) : !isAvailable ? (
                  <span className="text-red-700/80 font-medium">Booked</span>
                ) : (
                  <span className={isSelectedStart || isSelectedEnd ? "text-amber-200" : "text-emerald-700"}>
                    {unitsLeft} left
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend & Buffer Info */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-500 gap-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-red-900 border border-amber-400 inline-block" />
            <span>Selected Dates</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-stone-50 border border-stone-300 inline-block" />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-stone-100 border border-dashed border-stone-300 inline-block" />
            <span>Booked / Reserved</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-stone-500 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200">
          <Info className="w-3.5 h-3.5 text-amber-600" />
          <span>Includes {bufferDays} day buffer after return for cleaning & repair</span>
        </div>
      </div>
    </div>
  );
};
