'use client';

import React from 'react';
import {
  Clock,
  Phone,
  DollarSign,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Appointment, AppointmentStatus, BusinessConfig } from '@/lib/types';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { getWhatsAppLink, generateConfirmationMessage, generateReminderMessage } from '@/lib/whatsapp';

interface AppointmentCardProps {
  appointment: Appointment;
  config: BusinessConfig;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onLaunchToCashier: (appointment: Appointment) => void;
  onClickDetails: (appointment: Appointment) => void;
}

export const statusConfig: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  scheduled: {
    label: 'Agendado',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  confirmed: {
    label: 'Confirmado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  in_progress: {
    label: 'Em Atendimento',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Concluído',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  no_show: {
    label: 'Falta',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  blocked: {
    label: 'Bloqueado',
    bg: 'bg-slate-200',
    text: 'text-slate-800',
    border: 'border-slate-300',
    dot: 'bg-slate-600',
  },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  config,
  onStatusChange,
  onLaunchToCashier,
  onClickDetails,
}) => {
  const currentStatus = statusConfig[appointment.status] || statusConfig.scheduled;

  const handleSendConfirmation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!appointment.clientPhone) {
      alert('Esta cliente não tem telefone cadastrado.');
      return;
    }
    const msg = generateConfirmationMessage(appointment, config);
    const link = getWhatsAppLink(appointment.clientPhone, msg);
    window.open(link, '_blank');
  };

  const handleSendReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!appointment.clientPhone) {
      alert('Esta cliente não tem telefone cadastrado.');
      return;
    }
    const msg = generateReminderMessage(appointment, config);
    const link = getWhatsAppLink(appointment.clientPhone, msg);
    window.open(link, '_blank');
  };

  return (
    <div
      onClick={() => onClickDetails(appointment)}
      className="group relative bg-white hover:bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all cursor-pointer"
    >
      {/* Top row: Time + Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <span>{appointment.startTime}</span>
            <span className="text-slate-400 mx-1">-</span>
            <span>{appointment.endTime}</span>
          </div>
          {appointment.paid && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Pago
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`}></span>
          <span>{currentStatus.label}</span>
        </div>
      </div>

      {/* Client Name & Phone */}
      <div className="mb-2">
        <h3 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
          {appointment.clientName}
        </h3>
        {appointment.clientPhone && (
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-slate-400" />
            {formatPhone(appointment.clientPhone)}
          </p>
        )}
      </div>

      {/* Services summary */}
      <div className="mb-3 space-y-1">
        {appointment.services.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-rose-400" />
              {item.serviceName}
            </span>
            <span className="font-medium text-slate-700">{formatCurrency(item.price)}</span>
          </div>
        ))}
        {appointment.notes && (
          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded-lg mt-1 border border-slate-100">
            &ldquo;{appointment.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Total & Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
        <div className="text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Total</span>
          <span className="font-bold text-slate-900 text-sm">{formatCurrency(appointment.totalPrice)}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* WhatsApp buttons */}
          {appointment.clientPhone && (
            <>
              <button
                type="button"
                onClick={handleSendConfirmation}
                title="Enviar Confirmação WhatsApp"
                className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Launch to cashier */}
          {!appointment.paid && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLaunchToCashier(appointment);
              }}
              title="Receber no Caixa / PDV"
              className="flex items-center space-x-1 py-1.5 px-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Receber</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
