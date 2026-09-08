'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  DollarSign,
  Calendar as CalendarIcon,
  CheckCircle2,
  Phone,
  User,
  Instagram,
  MapPin,
  Check,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import {
  Service,
  BusinessConfig,
  Appointment
} from '@/lib/types';
import {
  loadConfig,
  loadServices,
  loadAppointments,
  saveAppointments
} from '@/lib/storage';
import {
  formatCurrency,
  formatDuration,
  getTodayDateString,
  addMinutesToTime,
  formatDateBR
} from '@/lib/utils';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Booking Flow Steps: 1 = Services, 2 = Date & Time, 3 = Client Info, 4 = Success
  const [step, setStep] = useState<number>(1);

  // Selections
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');

  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);

  useEffect(() => {
    setIsClient(true);
    setConfig(loadConfig());
    setServices(loadServices().filter((s) => s.active));
    setAppointments(loadAppointments());
  }, []);

  if (!isClient) return null;

  const selectedServicesList = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServicesList.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalPrice = selectedServicesList.reduce((acc, curr) => acc + curr.price, 0);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  // Generate Available Slots for Selected Date
  const generateAvailableSlots = () => {
    const slots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    const dayApts = appointments.filter((a) => a.date === selectedDate && a.status !== 'cancelled');

    return slots.map((time) => {
      // Check if slot is taken
      const isTaken = dayApts.some((apt) => {
        return time >= apt.startTime && time < apt.endTime;
      });
      return { time, available: !isTaken };
    });
  };

  const availableSlots = generateAvailableSlots();

  const handleFinishBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, informe seu nome e WhatsApp.');
      return;
    }
    if (!selectedTime) {
      alert('Por favor, selecione um horário disponível.');
      return;
    }

    const calculatedEndTime = addMinutesToTime(selectedTime, totalDuration || 60);

    const newAppointment: Appointment = {
      id: `apt_pub_${Date.now()}`,
      clientId: `cli_${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      date: selectedDate,
      startTime: selectedTime,
      endTime: calculatedEndTime,
      services: selectedServicesList.map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes,
      })),
      totalPrice,
      status: 'scheduled',
      professionalName: config.ownerName,
      notes: clientNotes ? `Agendado Online: ${clientNotes}` : 'Agendamento Online',
      paid: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...appointments, newAppointment];
    setAppointments(updated);
    saveAppointments(updated);
    setConfirmedApt(newAppointment);
    setStep(4);
  };

  const handleSendBookingWhatsApp = () => {
    if (!confirmedApt) return;
    const servicos = confirmedApt.services.map((s) => s.serviceName).join(' + ');
    const msg = `Olá ${config.ownerName}! 💅 Acabei de agendar pelo site para o dia *${formatDateBR(confirmedApt.date)}* às *${confirmedApt.startTime}* para fazer *${servicos}*. Meu nome é *${confirmedApt.clientName}*.`;
    window.open(getWhatsAppLink(config.phone, msg), '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Studio Profile Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {config.name || 'Studio de Unhas'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Por {config.ownerName} • Agendamento Online Oficial
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap">
            {config.instagram && (
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <Instagram className="w-3.5 h-3.5" /> {config.instagram}
              </span>
            )}
            {config.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {config.address}
              </span>
            )}
          </div>
        </div>

        {/* Step 1: Select Services */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                  Passo 1 de 3
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Escolha os serviços desejados
                </h2>
              </div>
              {selectedServiceIds.length > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl">
                  {selectedServiceIds.length} selecionado(s)
                </span>
              )}
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {services.map((s) => {
                const isSelected = selectedServiceIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-400 text-rose-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <div className="pr-3">
                      <div className="font-bold text-xs sm:text-sm">{s.name}</div>
                      {s.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {s.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDuration(s.durationMinutes)}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-black text-sm text-slate-900 block">
                        {formatCurrency(s.price)}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 mt-1">
                          <Check className="w-3 h-3" /> Adicionado
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                          + Selecionar
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Total Footer Banner & Next */}
            {selectedServiceIds.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Total • {formatDuration(totalDuration)}
                  </span>
                  <span className="text-lg font-black text-rose-600">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5"
                >
                  <span>Continuar para Horários</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Available Time Slot */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                  Passo 2 de 3
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Escolha a data e o horário
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Voltar aos serviços
              </button>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Data do Atendimento
              </label>
              <input
                type="date"
                min={getTodayDateString()}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
              />
            </div>

            {/* Available Time Slots Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Horários Livres Disponíveis
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {availableSlots.map(({ time, available }) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={!available}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        !available
                          ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-400'
                          : 'bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-700 hover:border-rose-300'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary & Next */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600"
              >
                Voltar
              </button>

              <button
                type="button"
                disabled={!selectedTime}
                onClick={() => setStep(3)}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Avançar para Seus Dados</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Client Details & Confirm */}
        {step === 3 && (
          <form
            onSubmit={handleFinishBooking}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                  Passo 3 de 3
                </span>
                <h2 className="text-base font-bold text-slate-900">Seus dados para contato</h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Alterar horário
              </button>
            </div>

            {/* Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>Serviços:</span>
                <span className="text-rose-400">
                  {selectedServicesList.map((s) => s.name).join(' + ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data & Horário:</span>
                <span>
                  {formatDateBR(selectedDate)} às {selectedTime}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-800">
                <span>Total:</span>
                <span className="text-emerald-400">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Como você gostaria de ser chamada?"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Seu WhatsApp (com DDD) *
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 47988887777"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Observações (Opcional)
                </label>
                <textarea
                  placeholder="Ex: Gostaria de fazer nail art específica, unhas curtas, etc."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Agendamento
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success Screen */}
        {step === 4 && confirmedApt && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Agendamento Solicitado com Sucesso!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Seu horário está pré-reservado no Studio {config.ownerName}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Data:</span>
                <span>{formatDateBR(confirmedApt.date)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800">
                <span>Horário:</span>
                <span className="text-rose-600">
                  {confirmedApt.startTime} às {confirmedApt.endTime}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Serviços:</span>
                <span>{confirmedApt.services.map((s) => s.serviceName).join(' + ')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Valor Total:</span>
                <span className="text-emerald-600">{formatCurrency(confirmedApt.totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleSendBookingWhatsApp}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Avisar a {config.ownerName} no WhatsApp
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedServiceIds([]);
                  setSelectedTime('');
                  setStep(1);
                }}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600"
              >
                Fazer outro agendamento
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-[11px] text-slate-400 mt-8">
        Desenvolvido com carinho por <span className="font-bold text-slate-600">ZanettIA</span> • Agenda Inteligente
      </footer>
    </div>
  );
}
