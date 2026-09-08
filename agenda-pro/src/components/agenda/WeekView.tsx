'use client';

import React from 'react';
import { Appointment, AppointmentStatus, BusinessConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Clock, User } from 'lucide-react';

interface WeekViewProps {
  currentDate: string; // YYYY-MM-DD
  appointments: Appointment[];
  config: BusinessConfig;
  onSelectDate: (date: string) => void;
  onClickDetails: (appointment: Appointment) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  appointments,
  onSelectDate,
  onClickDetails,
}) => {
  // Get 7 days of the week containing currentDate
  const getDaysOfWeek = (baseDateStr: string) => {
    const baseDate = new Date(baseDateStr + 'T00:00:00');
    const dayOfWeek = baseDate.getDay(); // 0 = Sun, 1 = Mon, ...
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      days.push({
        dateStr: iso,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        isToday: iso === new Date().toISOString().split('T')[0],
        isSelected: iso === baseDateStr,
      });
    }
    return days;
  };

  const days = getDaysOfWeek(currentDate);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {days.map((day) => {
          const count = appointments.filter((a) => a.date === day.dateStr).length;

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => onSelectDate(day.dateStr)}
              className={`p-2 sm:p-3 rounded-2xl transition-all flex flex-col items-center justify-center ${
                day.isSelected
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider ${day.isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                {day.dayName}
              </span>
              <span className="text-base sm:text-lg font-bold my-0.5">{day.dayNumber}</span>
              {count > 0 && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold mt-1 ${
                    day.isSelected ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {count} {count === 1 ? 'hr' : 'hrs'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Week overview columns */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 pt-2 border-t border-slate-100">
        {days.map((day) => {
          const dayApts = appointments
            .filter((a) => a.date === day.dateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={day.dateStr}
              className={`p-2.5 rounded-2xl border min-h-[140px] space-y-2 ${
                day.isSelected ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100 bg-slate-50/40'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>{day.dayName}, {day.dayNumber}</span>
                <span className="text-[10px] text-slate-400 font-normal">{dayApts.length} atend.</span>
              </div>

              {dayApts.length === 0 ? (
                <div className="h-20 flex items-center justify-center text-[11px] text-slate-400 italic">
                  Livre
                </div>
              ) : (
                <div className="space-y-1.5">
                  {dayApts.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => onClickDetails(apt)}
                      className="p-2 rounded-xl bg-white border border-slate-200/70 hover:border-rose-400 shadow-xs text-left cursor-pointer hover:shadow-sm transition-all"
                    >
                      <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {apt.startTime}
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {apt.clientName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {apt.services[0]?.serviceName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
