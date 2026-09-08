'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Service, BusinessConfig } from '@/lib/types';
import { loadServices, saveServices, loadConfig } from '@/lib/storage';
import { formatCurrency, formatDuration } from '@/lib/utils';

export default function ServicosPage() {
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Service['category']>('alongamento');
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [price, setPrice] = useState<number>(150);
  const [description, setDescription] = useState('');

  useEffect(() => {
    setIsClient(true);
    setConfig(loadConfig());
    setServices(loadServices());
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setCategory('alongamento');
    setDurationMinutes(120);
    setPrice(150);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setCategory(s.category);
    setDurationMinutes(s.durationMinutes);
    setPrice(s.price);
    setDescription(s.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingService) {
      const updated = services.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              name: name.trim(),
              category,
              durationMinutes: Number(durationMinutes) || 60,
              price: Number(price) || 0,
              description: description.trim(),
            }
          : s
      );
      setServices(updated);
      saveServices(updated);
    } else {
      const newService: Service = {
        id: `srv_${Date.now()}`,
        name: name.trim(),
        category,
        durationMinutes: Number(durationMinutes) || 60,
        price: Number(price) || 0,
        description: description.trim(),
        active: true,
      };
      const updated = [newService, ...services];
      setServices(updated);
      saveServices(updated);
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    const updated = services.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    setServices(updated);
    saveServices(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este serviço do catálogo?')) {
      const updated = services.filter((s) => s.id !== id);
      setServices(updated);
      saveServices(updated);
    }
  };

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'alongamento', label: 'Alongamentos' },
    { id: 'manutencao', label: 'Manutenções' },
    { id: 'esmaltacao', label: 'Esmaltação em Gel' },
    { id: 'tradicional', label: 'Tradicionais' },
    { id: 'cuidados', label: 'Cuidados / Reparos' },
    { id: 'cursos', label: 'Cursos' },
  ];

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'todos' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
            <h2 className="text-xl font-bold text-slate-900">Catálogo de Serviços</h2>
            <p className="text-xs text-slate-500">
              Configure durações, valores e serviços disponíveis na sua agenda e página pública.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Serviço</span>
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome do serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-3xl p-5 border transition-all space-y-3 relative group ${
                service.active ? 'border-slate-200/80 hover:border-rose-300 shadow-xs' : 'opacity-60 bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider block">
                    {service.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                    {service.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(service)}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(service.id)}
                    className={`p-1.5 rounded-xl border text-xs font-bold transition-colors ${
                      service.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                    title={service.active ? 'Ativo na agenda' : 'Inativo na agenda'}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {service.description && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {service.description}
                </p>
              )}

              {/* Price and Duration */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                  {formatDuration(service.durationMinutes)}
                </div>

                <div className="text-base font-black text-rose-600">
                  {formatCurrency(service.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Add / Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-fade-in my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
              <h2 className="text-sm font-bold">
                {editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fibra de vidro, Banho de gel..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Service['category'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
                >
                  <option value="alongamento">Alongamento</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="esmaltacao">Esmaltação em Gel</option>
                  <option value="tradicional">Tradicional</option>
                  <option value="cuidados">Cuidados & Reparos</option>
                  <option value="cursos">Cursos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    placeholder="150,00"
                    required
                    className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Duração (minutos) *
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                  >
                    <option value={20}>20 min (Reparo)</option>
                    <option value={45}>45 min (Remoção)</option>
                    <option value={60}>1h 00min (Pé ou Mão)</option>
                    <option value={90}>1h 30min</option>
                    <option value={105}>1h 45min (Esmaltação Pés)</option>
                    <option value={120}>2h 00min (Banho/Esmaltação)</option>
                    <option value={130}>2h 10min (Manutenção Banho)</option>
                    <option value={150}>2h 30min (Manutenção Fibra)</option>
                    <option value={180}>3h 00min (Fibra de Vidro)</option>
                    <option value={540}>9h 00min (Curso Completo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Descrição para a Cliente
                </label>
                <textarea
                  placeholder="Explique o que inclui o serviço para exibição na página de agendamento online..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                {editingService && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingService.id);
                      setIsModalOpen(false);
                    }}
                    className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                    title="Excluir serviço"
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
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
