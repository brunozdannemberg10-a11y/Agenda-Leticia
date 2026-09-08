'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { DayView } from '@/components/agenda/DayView';
import { WeekView } from '@/components/agenda/WeekView';
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal';
import { AppointmentDetailsModal } from '@/components/agenda/AppointmentDetailsModal';
import { PaymentModal } from '@/components/caixa/PaymentModal';
import {
  Appointment,
  AppointmentStatus,
  Client,
  Service,
  BusinessConfig,
  CashRegister,
  SaleTransaction
} from '@/lib/types';
import {
  loadConfig,
  loadServices,
  loadClients,
  loadAppointments,
  saveAppointments,
  loadCashRegister,
  saveCashRegister,
  loadSales,
  saveSales,
  saveClients
} from '@/lib/storage';
import { getTodayDateString, formatCurrency, formatDateBR } from '@/lib/utils';
import Link from 'next/link';

export default function AgendaHomePage() {
  const [isClient, setIsClient] = useState(false);

  // States
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegister>(loadCashRegister());
  const [sales, setSales] = useState<SaleTransaction[]>([]);

  // View state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [slotInitialTime, setSlotInitialTime] = useState<string>('09:00');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [appointmentToPay, setAppointmentToPay] = useState<Appointment | null>(null);

  useEffect(() => {
    setIsClient(true);
    setConfig(loadConfig());
    setServices(loadServices());
    setClients(loadClients());
    setAppointments(loadAppointments());
    setCashRegister(loadCashRegister());
    setSales(loadSales());
  }, []);

  // Update handlers
  const handleSaveAppointment = (newAptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newApt: Appointment = {
      ...newAptData,
      id: `apt_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...appointments, newApt];
    setAppointments(updated);
    saveAppointments(updated);
  };

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    const updated = appointments.map((a) =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    setAppointments(updated);
    saveAppointments(updated);
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    saveAppointments(updated);
  };

  const handleQuickCreateClient = (
    newClientData: Omit<Client, 'id' | 'createdAt' | 'totalSpent' | 'totalVisits'>
  ): Client => {
    const newClient: Client = {
      ...newClientData,
      id: `cli_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      totalVisits: 0,
    };
    const updated = [...clients, newClient];
    setClients(updated);
    saveClients(updated);
    return newClient;
  };

  const handleOpenPaymentModal = (apt: Appointment) => {
    setAppointmentToPay(apt);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (sale: SaleTransaction) => {
    // 1. Mark appointment as paid & completed
    if (sale.appointmentId) {
      const updatedApts = appointments.map((a) =>
        a.id === sale.appointmentId ? { ...a, paid: true, status: 'completed' as AppointmentStatus } : a
      );
      setAppointments(updatedApts);
      saveAppointments(updatedApts);
    }

    // 2. Add to sales history
    const updatedSales = [sale, ...sales];
    setSales(updatedSales);
    saveSales(updatedSales);

    // 3. Add to cash register movements
    const updatedRegister: CashRegister = {
      ...cashRegister,
      salesTotal: cashRegister.salesTotal + sale.total,
      finalExpectedAmount: cashRegister.finalExpectedAmount + sale.total,
      movements: [
        ...cashRegister.movements,
        {
          id: `mov_${Date.now()}`,
          type: 'venda',
          amount: sale.total,
          method: sale.payments[0]?.method || 'pix',
          description: `Venda - ${sale.clientName} (${sale.items.map((i) => i.description).join(', ')})`,
          time: sale.time,
          date: sale.date,
        },
      ],
    };
    setCashRegister(updatedRegister);
    saveCashRegister(updatedRegister);

    // 4. Update client stats
    if (sale.clientId) {
      const updatedClients = clients.map((c) =>
        c.id === sale.clientId
          ? {
              ...c,
              totalSpent: c.totalSpent + sale.total,
              totalVisits: c.totalVisits + 1,
              lastVisit: sale.date,
            }
          : c
      );
      setClients(updatedClients);
      saveClients(updatedClients);
    }
  };

  // Date Navigation
  const changeDateBy = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.clientName.toLowerCase().includes(q) ||
      a.clientPhone.includes(q) ||
      a.services.some((s) => s.serviceName.toLowerCase().includes(q))
    );
  });

  const todayApts = filteredAppointments.filter((a) => a.date === selectedDate);
  const todayTotalExpected = todayApts.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const todayCompletedCount = todayApts.filter((a) => a.status === 'completed').length;

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        businessName={config.name}
        professionalName={config.ownerName}
        slug={config.slug}
        todaySalesTotal={cashRegister.salesTotal}
        todaySalesCount={sales.length}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5">
        {/* Top Control Bar: Date navigator, View selector & CTA */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          {/* Date Selector */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => changeDateBy(-1)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200">
              <CalendarIcon className="w-4 h-4 text-rose-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => changeDateBy(1)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedDate(getTodayDateString())}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Hoje
            </button>
          </div>

          {/* Search, View Mode & New Appointment CTA */}
          <div className="flex items-center space-x-2.5 flex-wrap sm:flex-nowrap">
            {/* View Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Dia
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Semana
              </button>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => {
                setSlotInitialTime('09:00');
                setIsNewModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-2 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Quick Day Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Agendamentos Hoje
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-800">
                {todayApts.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Finalizados
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-600">
                {todayCompletedCount} / {todayApts.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Previsão do Dia
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-800">
                {formatCurrency(todayTotalExpected)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Total em Caixa
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-700">
                {formatCurrency(cashRegister.finalExpectedAmount)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* View Component: Day or Week */}
        {viewMode === 'day' ? (
          <DayView
            date={selectedDate}
            appointments={filteredAppointments}
            config={config}
            onSelectSlot={(time) => {
              setSlotInitialTime(time);
              setIsNewModalOpen(true);
            }}
            onStatusChange={handleStatusChange}
            onLaunchToCashier={handleOpenPaymentModal}
            onClickDetails={(apt) => {
              setSelectedAppointment(apt);
              setIsDetailsModalOpen(true);
            }}
          />
        ) : (
          <WeekView
            currentDate={selectedDate}
            appointments={filteredAppointments}
            config={config}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setViewMode('day');
            }}
            onClickDetails={(apt) => {
              setSelectedAppointment(apt);
              setIsDetailsModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleSaveAppointment}
        clients={clients}
        services={services}
        initialDate={selectedDate}
        initialTime={slotInitialTime}
        onQuickCreateClient={handleQuickCreateClient}
      />

      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointment={selectedAppointment}
        config={config}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteAppointment}
        onLaunchToCashier={handleOpenPaymentModal}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setAppointmentToPay(null);
        }}
        appointment={appointmentToPay}
        clients={clients}
        config={config}
        cashRegister={cashRegister}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
