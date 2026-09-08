'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Calendar,
  MessageCircle,
  CreditCard,
  History,
  X,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  Gift
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Client, BusinessConfig, Appointment } from '@/lib/types';
import { loadClients, saveClients, loadConfig, loadAppointments } from '@/lib/storage';
import { formatCurrency, formatPhone, formatDateBR } from '@/lib/utils';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function ClientesPage() {
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carrier, setCarrier] = useState('Vivo');
  const [birthDate, setBirthDate] = useState('');
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Selected client for history view
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);

  useEffect(() => {
    setIsClient(true);
    setConfig(loadConfig());
    setClients(loadClients());
    setAppointments(loadAppointments());
  }, []);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setName('');
    setPhone('');
    setCarrier('Vivo');
    setBirthDate('');
    setCreditBalance(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setPhone(c.phone);
    setCarrier(c.carrier || 'Vivo');
    setBirthDate(c.birthDate || '');
    setCreditBalance(c.creditBalance || 0);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingClient) {
      const updated = clients.map((c) =>
        c.id === editingClient.id
          ? {
              ...c,
              name: name.trim(),
              phone: phone.trim(),
              carrier,
              birthDate,
              creditBalance: Number(creditBalance) || 0,
              notes,
            }
          : c
      );
      setClients(updated);
      saveClients(updated);
    } else {
      const newClient: Client = {
        id: `cli_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        carrier,
        birthDate,
        creditBalance: Number(creditBalance) || 0,
        notes,
        createdAt: new Date().toISOString().split('T')[0],
        totalSpent: 0,
        totalVisits: 0,
      };
      const updated = [newClient, ...clients];
      setClients(updated);
      saveClients(updated);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta cliente?')) {
      const updated = clients.filter((c) => c.id !== id);
      setClients(updated);
      saveClients(updated);
    }
  };

  const filteredClients = clients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const totalClients = clients.length;
  const totalCredits = clients.reduce((acc, curr) => acc + (curr.creditBalance || 0), 0);
  const totalRevenueAllClients = clients.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        businessName={config.name}
        professionalName={config.ownerName}
        slug={config.slug}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gestão de Clientes</h2>
            <p className="text-xs text-slate-500">
              Histórico de visitas, aniversários, contatos e preferências das clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Cliente</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Total de Clientes
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">{totalClients}</div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Saldo em Créditos
            </span>
            <div className="text-xl font-black text-emerald-600 mt-1">
              {formatCurrency(totalCredits)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Faturamento Acumulado
            </span>
            <div className="text-xl font-black text-rose-600 mt-1">
              {formatCurrency(totalRevenueAllClients)}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>

        {/* Clients Cards Grid */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center text-xs text-slate-400">
            Nenhuma cliente encontrada com esse critério.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredClients.map((client) => {
              const clientApts = appointments.filter((a) => a.clientId === client.id);

              return (
                <div
                  key={client.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                      {client.phone && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {formatPhone(client.phone)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      {client.phone && (
                        <a
                          href={getWhatsAppLink(client.phone, `Olá ${client.name}! 💅`)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(client)}
                        className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges & Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Visitas</span>
                      <span className="font-bold text-slate-800">{client.totalVisits || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Total Gasto</span>
                      <span className="font-bold text-rose-600">
                        {formatCurrency(client.totalSpent || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Crédito</span>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(client.creditBalance || 0)}
                      </span>
                    </div>
                  </div>

                  {client.birthDate && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-pink-500" />
                      <span>Aniversário: {client.birthDate}</span>
                    </div>
                  )}

                  {client.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2 rounded-xl border border-amber-100">
                      &ldquo;{client.notes}&rdquo;
                    </p>
                  )}

                  {/* Visit History preview */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Última visita: {client.lastVisit ? formatDateBR(client.lastVisit) : 'Sem registro'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedClientForHistory(client)}
                      className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <History className="w-3.5 h-3.5" /> Ver histórico
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Add / Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-fade-in my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
              <h2 className="text-sm font-bold">
                {editingClient ? 'Editar Cliente' : 'Cadastrar Nova Cliente'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Nome da cliente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="47988887777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Nascimento
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Saldo de Crédito (R$)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={creditBalance || ''}
                  onChange={(e) => setCreditBalance(Number(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Observações / Preferências de Unhas
                </label>
                <textarea
                  placeholder="Ex: Prefere formato amendoadas, sensibilidade nas cutículas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                {editingClient && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingClient.id);
                      setIsModalOpen(false);
                    }}
                    className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                    title="Excluir cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Drawer Modal */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fade-in my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Histórico de Atendimentos
                </span>
                <h2 className="text-base font-bold text-white">
                  {selectedClientForHistory.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedClientForHistory(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {appointments.filter((a) => a.clientId === selectedClientForHistory.id).length === 0 ? (
                <p className="text-center py-6 text-slate-400">
                  Nenhum atendimento anterior registrado para esta cliente.
                </p>
              ) : (
                appointments
                  .filter((a) => a.clientId === selectedClientForHistory.id)
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{formatDateBR(apt.date)} às {apt.startTime}</span>
                        <span className="text-rose-600">{formatCurrency(apt.totalPrice)}</span>
                      </div>
                      <div className="text-slate-600">
                        {apt.services.map((s) => s.serviceName).join(' + ')}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                        <span>Status: {apt.status}</span>
                        <span>{apt.paid ? 'Pago' : 'Pendente'}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
