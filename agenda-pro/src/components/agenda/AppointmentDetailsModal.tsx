'use client';

import React from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  MessageCircle,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileHeart,
  Sparkles,
  CalendarCheck2,
  Percent
} from 'lucide-react';
import { Appointment, AppointmentStatus, BusinessConfig } from '@/lib/types';
import { formatCurrency, formatDuration, formatPhone, formatDateBR } from '@/lib/utils';
import { getWhatsAppLink, generateConfirmationMessage, generateReminderMessage } from '@/lib/whatsapp';
import { statusConfig } from './AppointmentCard';
import Link from 'next/link';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  config: BusinessConfig;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onDelete: (id: string) => void;
  onLaunchToCashier: (appointment: Appointment) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  config,
  onStatusChange,
  onDelete,
  onLaunchToCashier,
}) => {
  if (!isOpen || !appointment) return null;

  const currentStatus = statusConfig[appointment.status] || statusConfig.scheduled;

  const handleSendConfirmation = () => {
    if (!appointment.clientPhone) return;
    const msg = generateConfirmationMessage(appointment, config);
    window.open(getWhatsAppLink(appointment.clientPhone, msg), '_blank');
  };

  const handleSendReminder = () => {
    if (!appointment.clientPhone) return;
    const msg = generateReminderMessage(appointment, config);
    window.open(getWhatsAppLink(appointment.clientPhone, msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Detalhes do Agendamento
            </span>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{appointment.clientName}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
              >
                {currentStatus.label}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Data & Horário
              </span>
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                {formatDateBR(appointment.date)}
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-600 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {appointment.startTime} às {appointment.endTime}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Contato
              </span>
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <User className="w-3.5 h-3.5 text-rose-500" />
                {appointment.clientName}
              </div>
              {appointment.clientPhone && (
                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-600 mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {formatPhone(appointment.clientPhone)}
                </div>
              )}
            </div>
          </div>

          {/* Previsão de Retorno */}
          {appointment.nextReturnDate && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <CalendarCheck2 className="w-4 h-4 text-rose-600" />
                Previsão de Retorno (Próxima Manutenção):
              </span>
              <span className="font-extrabold">{formatDateBR(appointment.nextReturnDate)}</span>
            </div>
          )}

          {/* Status Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Alterar Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  'scheduled',
                  'confirmed',
                  'in_progress',
                  'completed',
                  'cancelled',
                  'no_show',
                ] as AppointmentStatus[]
              ).map((st) => {
                const conf = statusConfig[st];
                const isSelected = appointment.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onStatusChange(appointment.id, st)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? `${conf.bg} ${conf.text} ${conf.border} ring-2 ring-rose-400`
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Services breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Serviços Contratados
            </span>
            {appointment.services.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    {item.serviceName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Duração: {formatDuration(item.durationMinutes)}
                  </div>
                </div>
                <div className="font-bold text-slate-800">
                  {formatCurrency(item.price)}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 text-sm font-bold text-slate-900 border-t border-slate-200">
              <span>Total a Pagar</span>
              <span className="text-rose-600 font-extrabold">{formatCurrency(appointment.totalPrice)}</span>
            </div>
          </div>

          {appointment.notes && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Observações:</span>
              {appointment.notes}
            </div>
          )}

          {/* WhatsApp Action Buttons */}
          {appointment.clientPhone && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Comunicação no WhatsApp
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSendConfirmation}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Enviar Confirmação
                </button>
                <button
                  type="button"
                  onClick={handleSendReminder}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Enviar Lembrete
                </button>
              </div>
            </div>
          )}

          {/* Link to Anamnesis */}
          {appointment.clientId && appointment.clientId !== 'block' && (
            <Link
              href="/anamnese"
              className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-xs font-bold text-rose-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileHeart className="w-4 h-4 text-rose-600" />
                Abrir Ficha de Anamnese da Cliente
              </span>
              <span>&rarr;</span>
            </Link>
          )}

          {/* Launch to Cashier / Action Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                  onDelete(appointment.id);
                  onClose();
                }
              }}
              className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
              title="Excluir agendamento"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {!appointment.paid && appointment.status !== 'blocked' ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLaunchToCashier(appointment);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Lançar / Receber no Caixa
              </button>
            ) : (
              <div className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {appointment.status === 'blocked' ? 'Horário Bloqueado' : 'Atendimento Pago'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
