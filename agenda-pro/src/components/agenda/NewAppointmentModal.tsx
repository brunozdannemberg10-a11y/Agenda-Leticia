'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Clock,
  DollarSign,
  Calendar as CalendarIcon,
  User,
  Sparkles,
  Check,
  Ban,
  CalendarCheck2
} from 'lucide-react';
import { Client, Service, Appointment } from '@/lib/types';
import { formatCurrency, formatDuration, addMinutesToTime, getTodayDateString } from '@/lib/utils';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  clients: Client[];
  services: Service[];
  initialDate?: string;
  initialTime?: string;
  onQuickCreateClient?: (client: Omit<Client, 'id' | 'createdAt' | 'totalSpent' | 'totalVisits'>) => Client;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  services,
  initialDate,
  initialTime,
  onQuickCreateClient,
}) => {
  const [isBlockMode, setIsBlockMode] = useState<boolean>(false); // Modo Ausência / Bloqueio
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isNewClientMode, setIsNewClientMode] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');

  const [date, setDate] = useState<string>(initialDate || getTodayDateString());
  const [startTime, setStartTime] = useState<string>(initialTime || '09:00');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [professionalName, setProfessionalName] = useState<string>('Letícia Hermann');
  const [notes, setNotes] = useState<string>('');
  const [nextReturnDays, setNextReturnDays] = useState<number>(20); // Previsão de retorno padrão 20 dias

  if (!isOpen) return null;

  // Calculate totals from selected services
  const selectedServicesList = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = isBlockMode
    ? 60
    : selectedServicesList.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalPrice = isBlockMode
    ? 0
    : selectedServicesList.reduce((acc, curr) => acc + curr.price, 0);
  const calculatedEndTime = addMinutesToTime(startTime, totalDuration || 60);

  // Calculate next return date string
  const calculateReturnDate = (days: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let clientName = '';
    let clientPhone = '';
    let clientId = selectedClientId;

    if (isBlockMode) {
      clientName = 'BLOQUEIO / AUSÊNCIA';
      clientPhone = '';
      clientId = 'block';
    } else if (isNewClientMode) {
      if (!newClientName.trim()) {
        alert('Por favor, informe o nome da cliente.');
        return;
      }
      if (onQuickCreateClient) {
        const created = onQuickCreateClient({
          name: newClientName.trim(),
          phone: newClientPhone.trim(),
          creditBalance: 0,
        });
        clientId = created.id;
        clientName = created.name;
        clientPhone = created.phone;
      } else {
        clientId = `cli_${Date.now()}`;
        clientName = newClientName.trim();
        clientPhone = newClientPhone.trim();
      }
    } else {
      const foundClient = clients.find((c) => c.id === selectedClientId);
      if (!foundClient) {
        alert('Por favor, selecione uma cliente ou cadastre uma nova.');
        return;
      }
      clientName = foundClient.name;
      clientPhone = foundClient.phone;
    }

    if (!isBlockMode && selectedServiceIds.length === 0) {
      alert('Por favor, selecione pelo menos um serviço.');
      return;
    }

    onSave({
      clientId,
      clientName,
      clientPhone,
      date,
      startTime,
      endTime: calculatedEndTime,
      services: isBlockMode
        ? [
            {
              serviceId: 'srv_ausencia',
              serviceName: 'AUSÊNCIA / BLOQUEIO',
              price: 0,
              durationMinutes: 60,
            },
          ]
        : selectedServicesList.map((s) => ({
            serviceId: s.id,
            serviceName: s.name,
            price: s.price,
            durationMinutes: s.durationMinutes,
            commission: s.commissionRate ? (s.price * s.commissionRate) / 100 : undefined,
          })),
      totalPrice,
      status: isBlockMode ? 'blocked' : 'scheduled',
      professionalName,
      notes: isBlockMode ? (notes || 'Horário Bloqueado') : notes,
      nextReturnDate: !isBlockMode && nextReturnDays > 0 ? calculateReturnDate(nextReturnDays) : undefined,
      paid: isBlockMode,
    });

    // Reset state & close
    setSelectedServiceIds([]);
    setNotes('');
    setIsBlockMode(false);
    setIsNewClientMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white">
          <div className="flex items-center space-x-2.5">
            {isBlockMode ? <Ban className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            <h2 className="text-base font-bold">
              {isBlockMode ? 'Bloquear Horário (Ausência)' : 'Novo Agendamento'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsBlockMode(!isBlockMode)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                isBlockMode ? 'bg-slate-900 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isBlockMode ? 'Voltar para Agendamento' : 'Bloquear Horário'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Client Selection (Only if not in block mode) */}
          {!isBlockMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  Cliente
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewClientMode(!isNewClientMode)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                >
                  {isNewClientMode ? 'Selecionar existente' : '+ Cadastrar rápida'}
                </button>
              </div>

              {isNewClientMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div>
                    <input
                      type="text"
                      placeholder="Nome completo da cliente *"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="WhatsApp (ex: 47988887777)"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
                >
                  <option value="">Selecione uma cliente cadastrada...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.phone ? `(${client.phone})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-rose-500" />
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Início
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
              />
            </div>
          </div>

          {/* Services Selection (Hidden in block mode) */}
          {!isBlockMode ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Selecione os Serviços *</span>
                {selectedServiceIds.length > 0 && (
                  <span className="text-rose-600 font-bold lowercase">
                    {selectedServiceIds.length} selecionado(s)
                  </span>
                )}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {services
                  .filter((s) => s.category !== 'bloqueio')
                  .map((service) => {
                    const isSelected = selectedServiceIds.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleService(service.id)}
                        className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition-all text-xs ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/80 ring-1 ring-rose-500 text-rose-900 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{service.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDuration(service.durationMinutes)}
                          </div>
                        </div>
                        <div className="font-bold text-slate-800 ml-2">
                          {formatCurrency(service.price)}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold block mb-1">Motivo do Bloqueio:</span>
              <input
                type="text"
                placeholder="Ex: Almoço, Curso presencial, Médico, Folga..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          )}

          {/* Previsão de Retorno da Cliente (Próxima manutenção) */}
          {!isBlockMode && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <CalendarCheck2 className="w-3.5 h-3.5 text-rose-500" />
                Previsão de Retorno (Manutenção):
              </span>
              <select
                value={nextReturnDays}
                onChange={(e) => setNextReturnDays(Number(e.target.value))}
                className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800"
              >
                <option value={15}>Em 15 dias</option>
                <option value={20}>Em 20 dias (Recomendado)</option>
                <option value={25}>Em 25 dias</option>
                <option value={30}>Em 30 dias</option>
                <option value={0}>Não definir</option>
              </select>
            </div>
          )}

          {/* Total & Duration Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider block">
                Horário Previsto
              </span>
              <span className="font-semibold text-sm">
                {startTime} às {calculatedEndTime} ({formatDuration(totalDuration)})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-300 uppercase tracking-wider block">
                Valor Total
              </span>
              <span className="font-bold text-base text-rose-400">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {/* Professional & Notes */}
          {!isBlockMode && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Profissional Responsável
                </label>
                <input
                  type="text"
                  value={professionalName}
                  onChange={(e) => setProfessionalName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Observações do Atendimento
                </label>
                <textarea
                  placeholder="Ex: Inspiração de decoração francesa, cliente alérgica a esmalte comum, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isBlockMode ? 'Confirmar Bloqueio' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
