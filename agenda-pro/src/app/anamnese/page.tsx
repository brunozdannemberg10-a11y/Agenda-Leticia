'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileHeart,
  Plus,
  Search,
  User,
  Calendar,
  Sparkles,
  PenTool,
  Check,
  X,
  Trash2,
  FileCheck2,
  Share2,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AnamnesisFicha, Client, BusinessConfig } from '@/lib/types';
import { loadAnamnesis, saveAnamnesis, loadClients, loadConfig } from '@/lib/storage';
import { formatDateBR, formatPhone } from '@/lib/utils';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function AnamnesePage() {
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [fichas, setFichas] = useState<AnamnesisFicha[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<AnamnesisFicha | null>(null);

  // Form State
  const [clientId, setClientId] = useState('');
  const [nailType, setNailType] = useState<AnamnesisFicha['nailType']>('natural');
  const [preferredShape, setPreferredShape] = useState<AnamnesisFicha['preferredShape']>('almond');
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergyDetails, setAllergyDetails] = useState('');
  const [usesMedications, setUsesMedications] = useState(false);
  const [medicationDetails, setMedicationDetails] = useState('');
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasFungusHistory, setHasFungusHistory] = useState(false);
  const [previousTechnique, setPreviousTechnique] = useState('');
  const [notes, setNotes] = useState('');

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setConfig(loadConfig());
    setFichas(loadAnamnesis());
    setClients(loadClients());
  }, []);

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleOpenAdd = () => {
    setClientId(clients[0]?.id || '');
    setNailType('natural');
    setPreferredShape('almond');
    setHasAllergies(false);
    setAllergyDetails('');
    setUsesMedications(false);
    setMedicationDetails('');
    setHasDiabetes(false);
    setHasFungusHistory(false);
    setPreviousTechnique('');
    setNotes('');
    setHasSignature(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      alert('Por favor, selecione uma cliente.');
      return;
    }

    let signatureBase64 = '';
    if (canvasRef.current && hasSignature) {
      signatureBase64 = canvasRef.current.toDataURL('image/png');
    }

    const newFicha: AnamnesisFicha = {
      id: `ficha_${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      date: new Date().toISOString().split('T')[0],
      nailType,
      preferredShape,
      hasAllergies,
      allergyDetails: hasAllergies ? allergyDetails : undefined,
      usesMedications,
      medicationDetails: usesMedications ? medicationDetails : undefined,
      hasDiabetes,
      hasFungusHistory,
      previousTechnique,
      clientSignature: signatureBase64 || undefined,
      notes,
    };

    const updated = [newFicha, ...fichas];
    setFichas(updated);
    saveAnamnesis(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ficha?')) {
      const updated = fichas.filter((f) => f.id !== id);
      setFichas(updated);
      saveAnamnesis(updated);
    }
  };

  const filteredFichas = fichas.filter((f) =>
    f.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h2 className="text-xl font-bold text-slate-900">Fichas de Anamnese Digital</h2>
            <p className="text-xs text-slate-500">
              Avaliação de unhas, histórico de saúde, formato preferido e assinatura digital da cliente.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Preencher Nova Ficha</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ficha pelo nome da cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>

        {/* Fichas Grid */}
        {filteredFichas.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <FileHeart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Nenhuma ficha registrada</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Clique em &quot;Preencher Nova Ficha&quot; para registrar a avaliação completa da unha da sua cliente com assinatura na tela.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFichas.map((ficha) => (
              <div
                key={ficha.id}
                onClick={() => setSelectedFicha(ficha)}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      {formatDateBR(ficha.date)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{ficha.clientName}</h3>
                  </div>
                  {ficha.clientSignature ? (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3" /> Assinada
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      Pendente
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Tipo de Unha</span>
                    <span className="font-bold text-slate-800 capitalize">{ficha.nailType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Formato</span>
                    <span className="font-bold text-rose-600 capitalize">{ficha.preferredShape}</span>
                  </div>
                </div>

                {(ficha.hasAllergies || ficha.hasDiabetes || ficha.hasFungusHistory) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-xl border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Atenção: Alergias ou observações de saúde informadas</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold">
                  <span>Ver ficha completa</span>
                  <span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Preencher Nova Ficha */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fade-in my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
              <div className="flex items-center space-x-2">
                <FileHeart className="w-5 h-5" />
                <h2 className="text-sm font-bold">Ficha de Anamnese & Unhas</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Cliente */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Selecione a Cliente *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                >
                  <option value="">Selecione...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Unha & Formato */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Tipo de Unha Natural
                  </label>
                  <select
                    value={nailType}
                    onChange={(e) => setNailType(e.target.value as AnamnesisFicha['nailType'])}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                  >
                    <option value="natural">Natural Saudável</option>
                    <option value="roída">Roída</option>
                    <option value="oleosa">Oleosa</option>
                    <option value="quebradiça">Quebradiça / Frágil</option>
                    <option value="seca">Seca</option>
                    <option value="outra">Outra</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Formato Desejado
                  </label>
                  <select
                    value={preferredShape}
                    onChange={(e) =>
                      setPreferredShape(e.target.value as AnamnesisFicha['preferredShape'])
                    }
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                  >
                    <option value="almond">Almond (Amendoadas)</option>
                    <option value="quadrada">Quadrada</option>
                    <option value="redonda">Redonda</option>
                    <option value="bailarina">Bailarina (Coffin)</option>
                    <option value="stiletto">Stiletto</option>
                  </select>
                </div>
              </div>

              {/* Health checks */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Questionário de Saúde
                </span>

                <label className="flex items-center space-x-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAllergies}
                    onChange={(e) => setHasAllergies(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-400"
                  />
                  <span>Possui alguma alergia a esmaltes, químicos ou cosméticos?</span>
                </label>
                {hasAllergies && (
                  <input
                    type="text"
                    placeholder="Quais alergias?"
                    value={allergyDetails}
                    onChange={(e) => setAllergyDetails(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                )}

                <label className="flex items-center space-x-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDiabetes}
                    onChange={(e) => setHasDiabetes(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-400"
                  />
                  <span>Possui diabetes ou problemas de cicatrização?</span>
                </label>

                <label className="flex items-center space-x-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFungusHistory}
                    onChange={(e) => setHasFungusHistory(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-400"
                  />
                  <span>Histórico de micoses ou infecções recentes nas unhas?</span>
                </label>
              </div>

              {/* Previous technique & Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Técnica ou procedimento anterior
                </label>
                <input
                  type="text"
                  placeholder="Ex: Usava gel moldado em outro salão, retirou há 1 mês..."
                  value={previousTechnique}
                  onChange={(e) => setPreviousTechnique(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
                />
              </div>

              {/* Digital Signature Canvas */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-rose-500" />
                    Assinatura da Cliente (Na tela)
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                  >
                    Limpar assinatura
                  </button>
                </div>
                <div className="border border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full touch-none cursor-crosshair"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block text-center">
                  A cliente pode assinar usando o dedo ou caneta stylus direto na tela.
                </span>
              </div>

              {/* Submit */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md"
                >
                  Salvar Ficha de Anamnese
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Ficha */}
      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fade-in my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Ficha de Anamnese
                </span>
                <h2 className="text-base font-bold text-white">{selectedFicha.clientName}</h2>
              </div>
              <button
                onClick={() => setSelectedFicha(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Data</span>
                  <span className="font-bold text-slate-800">{formatDateBR(selectedFicha.date)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Formato</span>
                  <span className="font-bold text-rose-600 capitalize">{selectedFicha.preferredShape}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tipo de lâmina ungueal:</span>
                  <span className="font-bold text-slate-800 capitalize">{selectedFicha.nailType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alergias:</span>
                  <span className="font-bold text-slate-800">
                    {selectedFicha.hasAllergies ? selectedFicha.allergyDetails || 'Sim' : 'Nenhuma'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Diabetes / Cicatrização:</span>
                  <span className="font-bold text-slate-800">
                    {selectedFicha.hasDiabetes ? 'Sim' : 'Não'}
                  </span>
                </div>
                {selectedFicha.previousTechnique && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Técnica anterior:</span>
                    <span className="font-bold text-slate-800">{selectedFicha.previousTechnique}</span>
                  </div>
                )}
              </div>

              {selectedFicha.clientSignature && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Assinatura Digital da Cliente
                  </span>
                  <img
                    src={selectedFicha.clientSignature}
                    alt="Assinatura"
                    className="max-h-24 mx-auto border border-slate-200 bg-white rounded-xl p-1 shadow-inner"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(selectedFicha.id);
                    setSelectedFicha(null);
                  }}
                  className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                  title="Excluir ficha"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFicha(null)}
                  className="py-2.5 px-6 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
