'use client';

import React from 'react';
import { Appointment, AppointmentStatus, BusinessConfig } from '@/lib/types';
import { AppointmentCard } from './AppointmentCard';
import { Clock, Plus, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface DayViewProps {
  date: string;
  appointments: Appointment[];
  config: BusinessConfig;
  onSelectSlot: (time: string) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onLaunchToCashier: (appointment: Appointment) => void;
  onClickDetails: (appointment: Appointment) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  date,
  appointments,
  config,
  onSelectSlot,
  onStatusChange,
  onLaunchToCashier,
  onClickDetails,
}) => {
  // Generate time slots from config.openingTime to config.closingTime
  const generateTimeSlots = () => {
    const slots: string[] = [];
    const [startHour] = (config.openingTime || '08:00').split(':').map(Number);
    const [endHour] = (config.closingTime || '20:00').split(':').map(Number);

    for (let h = startHour; h < endHour; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  };

  const slots = generateTimeSlots();

  // Filter appointments for this date and sort by startTime
  const dayAppointments = appointments
    .filter((a) => a.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-4">
      {/* Appointments List for the day */}
      {dayAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Nenhum agendamento para este dia</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Clique em um dos horários livres abaixo ou no botão &quot;Novo Agendamento&quot; para marcar um horário.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {dayAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              config={config}
              onStatusChange={onStatusChange}
              onLaunchToCashier={onLaunchToCashier}
              onClickDetails={onClickDetails}
            />
          ))}
        </div>
      )}

      {/* Hourly Timeline Slots */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80">
        <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-rose-500" />
          Grade de Horários do Dia
        </h4>

        <div className="space-y-2">
          {slots.map((time) => {
            // Check if any appointment covers or starts at this time
            const matchingApt = dayAppointments.find((a) => a.startTime === time);

            return (
              <div
                key={time}
                className="flex items-center space-x-3 py-1.5 border-b border-slate-100 last:border-0 group"
              >
                <div className="w-14 text-xs font-bold text-slate-400 group-hover:text-rose-500 transition-colors">
                  {time}
                </div>

                {matchingApt ? (
                  <div
                    onClick={() => onClickDetails(matchingApt)}
                    className="flex-1 px-3 py-2 rounded-xl bg-rose-50/80 border border-rose-200/60 flex items-center justify-between cursor-pointer hover:bg-rose-100/70 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span className="font-bold text-xs text-rose-900">{matchingApt.clientName}</span>
                      <span className="text-[11px] text-rose-700 hidden sm:inline">
                        • {matchingApt.services.map((s) => s.serviceName).join(', ')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-rose-800">
                      {matchingApt.startTime} - {matchingApt.endTime}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectSlot(time)}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-dashed border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 text-slate-400 hover:text-rose-600 text-xs font-medium flex items-center justify-between transition-all"
                  >
                    <span>Disponível</span>
                    <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-bold">
                      <Plus className="w-3 h-3" /> Agendar
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
