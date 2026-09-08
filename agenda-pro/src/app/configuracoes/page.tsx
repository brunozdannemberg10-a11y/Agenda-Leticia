'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  User,
  Phone,
  Instagram,
  MapPin,
  Clock,
  MessageCircle,
  Save,
  CheckCircle2,
  Share2,
  Database,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BusinessConfig } from '@/lib/types';
import { loadConfig, saveConfig } from '@/lib/storage';
import { initialConfig } from '@/lib/mock-data';

export default function ConfiguracoesPage() {
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setConfig(loadConfig());
  }, []);

  const handleChange = (field: keyof BusinessConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm('Deseja restaurar as configurações padrão da Letícia Hermann?')) {
      setConfig(initialConfig);
      saveConfig(initialConfig);
      alert('Configurações restauradas com sucesso.');
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        businessName={config.name}
        professionalName={config.ownerName}
        slug={config.slug}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Top title */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">Configurações do Studio</h2>
          <p className="text-xs text-slate-500">
            Personalize os dados da sua empresa, horários de atendimento e modelos de mensagens do WhatsApp.
          </p>
        </div>

        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Configurações salvas com sucesso!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Card: Perfil da Empresa */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-rose-500" />
              Dados do Studio & Profissional
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Nome do Studio / Empresa *
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Nome da Profissional Responsável *
                </label>
                <input
                  type="text"
                  value={config.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  required
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  WhatsApp para Atendimento *
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 47988887777"
                  value={config.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  placeholder="@leticiahermann.unhas"
                  value={config.instagram || ''}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Endereço / Localização do Atendimento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rua das Flores, 123 - Sala 02, Centro"
                  value={config.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>
            </div>
          </div>

          {/* Card: Horários de Atendimento */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              Horários de Atendimento
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Horário de Abertura
                </label>
                <input
                  type="time"
                  value={config.openingTime}
                  onChange={(e) => handleChange('openingTime', e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Horário de Encerramento
                </label>
                <input
                  type="time"
                  value={config.closingTime}
                  onChange={(e) => handleChange('closingTime', e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>
            </div>
          </div>

          {/* Card: Mensagens de WhatsApp */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-rose-500" />
              Modelos de Mensagens do WhatsApp
            </h3>
            <p className="text-[11px] text-slate-500">
              Você pode usar as tags mágicas: <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold">&#123;cliente&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold">&#123;servicos&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold">&#123;data&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold">&#123;hora&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold">&#123;total&#125;</code>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  1. Mensagem de Confirmação de Agendamento
                </label>
                <textarea
                  rows={3}
                  value={config.whatsappConfirmationTemplate}
                  onChange={(e) => handleChange('whatsappConfirmationTemplate', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  2. Mensagem de Lembrete (Véspera)
                </label>
                <textarea
                  rows={3}
                  value={config.whatsappReminderTemplate}
                  onChange={(e) => handleChange('whatsappReminderTemplate', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  3. Mensagem de Comprovante / Recibo da Venda
                </label>
                <textarea
                  rows={3}
                  value={config.whatsappReceiptTemplate}
                  onChange={(e) => handleChange('whatsappReceiptTemplate', e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>
            </div>
          </div>

          {/* Save & Reset buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              Restaurar Padrões
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 py-3 px-8 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
