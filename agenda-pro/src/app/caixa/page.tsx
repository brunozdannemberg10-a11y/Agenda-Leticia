'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  QrCode,
  CreditCard,
  Banknote,
  Receipt,
  FileText,
  Clock,
  History,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
  Calendar,
  User,
  Filter,
  Eye,
  Info
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PaymentModal } from '@/components/caixa/PaymentModal';
import { ExpenseModal } from '@/components/caixa/ExpenseModal';
import { CloseCashRegisterModal } from '@/components/caixa/CloseCashRegisterModal';
import {
  CashRegister,
  SaleTransaction,
  Client,
  BusinessConfig,
  CashMovement,
  PaymentMethod
} from '@/lib/types';
import {
  loadCashRegister,
  saveCashRegister,
  loadPastRegisters,
  savePastRegisters,
  loadSales,
  saveSales,
  loadClients,
  saveClients,
  loadConfig
} from '@/lib/storage';
import { formatCurrency, formatPhone, formatDateBR, getTodayDateString } from '@/lib/utils';
import { getWhatsAppLink, generateReceiptMessage } from '@/lib/whatsapp';

export default function CaixaPage() {
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [cashRegister, setCashRegister] = useState<CashRegister>(loadCashRegister());
  const [pastRegisters, setPastRegisters] = useState<CashRegister[]>(loadPastRegisters());
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [expenseType, setExpenseType] = useState<'despesa' | 'suprimento' | 'sangria'>('despesa');

  // Sales View Filter
  const [salesTab, setSalesTab] = useState<'recebidas' | 'a_receber'>('recebidas');
  const [periodFilter, setPeriodFilter] = useState<'hoje' | 'ontem' | 'semana' | 'mes'>('hoje');

  // Selected Sale for modal preview
  const [selectedSalePreview, setSelectedSalePreview] = useState<SaleTransaction | null>(null);

  useEffect(() => {
    setIsClient(true);
    setConfig(loadConfig());
    setCashRegister(loadCashRegister());
    setPastRegisters(loadPastRegisters());
    setSales(loadSales());
    setClients(loadClients());
  }, []);

  const handleOpenExpense = (type: 'despesa' | 'suprimento' | 'sangria') => {
    setExpenseType(type);
    setIsExpenseModalOpen(true);
  };

  const handleSaveMovement = (mov: {
    type: 'despesa' | 'suprimento' | 'sangria';
    amount: number;
    method: PaymentMethod;
    description: string;
    category?: string;
  }) => {
    const newMovement: CashMovement = {
      id: `mov_${Date.now()}`,
      type: mov.type,
      amount: mov.amount,
      method: mov.method,
      description: mov.description,
      category: mov.category,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
    };

    let newExpensesTotal = cashRegister.expensesTotal;
    let newSupplyTotal = cashRegister.supplyTotal;
    let newBleedTotal = cashRegister.bleedTotal;
    let newFinalExpected = cashRegister.finalExpectedAmount;

    if (mov.type === 'despesa') {
      newExpensesTotal += mov.amount;
      newFinalExpected -= mov.amount;
    } else if (mov.type === 'suprimento') {
      newSupplyTotal += mov.amount;
      newFinalExpected += mov.amount;
    } else if (mov.type === 'sangria') {
      newBleedTotal += mov.amount;
      newFinalExpected -= mov.amount;
    }

    const updated: CashRegister = {
      ...cashRegister,
      expensesTotal: newExpensesTotal,
      supplyTotal: newSupplyTotal,
      bleedTotal: newBleedTotal,
      finalExpectedAmount: newFinalExpected,
      movements: [newMovement, ...cashRegister.movements],
    };

    setCashRegister(updated);
    saveCashRegister(updated);
  };

  const handleConfirmSale = (sale: SaleTransaction) => {
    const updatedSales = [sale, ...sales];
    setSales(updatedSales);
    saveSales(updatedSales);

    const updatedRegister: CashRegister = {
      ...cashRegister,
      salesTotal: cashRegister.salesTotal + sale.total,
      finalExpectedAmount: cashRegister.finalExpectedAmount + sale.total,
      movements: [
        {
          id: `mov_${Date.now()}`,
          type: 'venda',
          amount: sale.total,
          method: sale.payments[0]?.method || 'pix',
          description: `Venda - ${sale.clientName} (${sale.items.map((i) => i.description).join(', ')})`,
          clientName: sale.clientName,
          saleId: sale.id,
          time: sale.time,
          date: sale.date,
        },
        ...cashRegister.movements,
      ],
    };

    setCashRegister(updatedRegister);
    saveCashRegister(updatedRegister);

    // If change was added as credit or sale total, update client
    if (sale.clientId) {
      const updatedClients = clients.map((c) => {
        if (c.id === sale.clientId) {
          const creditAddition = sale.changeAsCredit && sale.change ? sale.change : 0;
          return {
            ...c,
            totalSpent: c.totalSpent + sale.total,
            totalVisits: c.totalVisits + 1,
            creditBalance: c.creditBalance + creditAddition,
            lastVisit: sale.date,
          };
        }
        return c;
      });
      setClients(updatedClients);
      saveClients(updatedClients);
    }
  };

  const handleConfirmClose = (closingData: {
    closedAt: string;
    closedBy: string;
    destinationAccount: string;
    closingNotes: string;
    finalRealAmount?: number;
  }) => {
    const closedRegister: CashRegister = {
      ...cashRegister,
      status: 'closed',
      closedAt: closingData.closedAt,
      closedBy: closingData.closedBy,
      destinationAccount: closingData.destinationAccount,
      closingNotes: closingData.closingNotes,
      finalRealAmount: closingData.finalRealAmount,
    };

    // Save to past registers list
    const updatedPast = [closedRegister, ...pastRegisters];
    setPastRegisters(updatedPast);
    savePastRegisters(updatedPast);

    setCashRegister(closedRegister);
    saveCashRegister(closedRegister);
  };

  const handleOpenNewRegister = () => {
    const nextCode = (pastRegisters[0]?.codeNumber || 12) + 1;
    const opened: CashRegister = {
      id: `cx_${nextCode}`,
      codeNumber: nextCode,
      openedAt: new Date().toISOString().split('T')[0] + ' 08:00',
      openedBy: config.ownerName,
      status: 'open',
      initialAmount: 100.0,
      salesTotal: 0,
      expensesTotal: 0,
      supplyTotal: 100.0,
      bleedTotal: 0,
      finalExpectedAmount: 100.0,
      movements: [
        {
          id: `mov_${Date.now()}`,
          type: 'suprimento',
          amount: 100.0,
          method: 'dinheiro',
          description: 'Fundo de troco inicial',
          time: '08:00',
          date: new Date().toISOString().split('T')[0],
        },
      ],
    };
    setCashRegister(opened);
    saveCashRegister(opened);
  };

  const handleReopenLastRegister = () => {
    const last = pastRegisters[0];
    if (!last) return;

    if (confirm(`Deseja realmente reabrir o Caixa #${last.codeNumber}? O fechamento será cancelado e o caixa voltará a ficar aberto.`)) {
      const reopened: CashRegister = {
        ...last,
        status: 'open',
        closedAt: undefined,
        closedBy: undefined,
      };

      const remainingPast = pastRegisters.slice(1);
      setPastRegisters(remainingPast);
      savePastRegisters(remainingPast);

      setCashRegister(reopened);
      saveCashRegister(reopened);
    }
  };

  // Method breakdown
  const methodTotals = cashRegister.movements.reduce(
    (acc, curr) => {
      if (curr.type === 'venda' || curr.type === 'suprimento') {
        acc[curr.method] = (acc[curr.method] || 0) + curr.amount;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const lastClosedRegister = pastRegisters[0];

  // Check if open register is from a previous day
  const isOpenFromPastDay =
    cashRegister.status === 'open' &&
    cashRegister.openedAt &&
    !cashRegister.openedAt.startsWith(getTodayDateString());

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

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Warning if cash register is open from past days */}
        {isOpenFromPastDay && (
          <div className="bg-purple-900/90 text-white p-4 rounded-3xl border border-purple-700 shadow-md flex items-center justify-between flex-wrap gap-3 animate-pulse">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-purple-300 flex-shrink-0" />
              <div>
                <span className="font-extrabold text-sm block">ATENÇÃO — Caixa em Aberto</span>
                <span className="text-xs text-purple-200">
                  O Caixa #{cashRegister.codeNumber} está aberto desde {cashRegister.openedAt}. Recomenda-se fechar o caixa ao fim de cada expediente.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCloseModalOpen(true)}
              className="py-2 px-4 rounded-2xl bg-white text-purple-950 font-black text-xs hover:bg-purple-100 shadow-sm transition-all"
            >
              Fechar Caixa Agora
            </button>
          </div>
        )}

        {/* Main Cash Register Status Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    cashRegister.status === 'open'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      cashRegister.status === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  ></span>
                  {cashRegister.status === 'open' ? `Caixa #${cashRegister.codeNumber || 13} Aberto` : `Caixa #${cashRegister.codeNumber || 13} Fechado`}
                </span>
                <span className="text-xs text-slate-400">
                  Aberto em: {cashRegister.openedAt}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
                {formatCurrency(cashRegister.finalExpectedAmount)}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Vendas: <b className="text-emerald-400">{formatCurrency(cashRegister.salesTotal)}</b></span>
                <span>•</span>
                <span>Despesas: <b className="text-rose-400">-{formatCurrency(cashRegister.expensesTotal)}</b></span>
                <span>•</span>
                <span>Fundo Inicial: <b>{formatCurrency(cashRegister.initialAmount)}</b></span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
              {cashRegister.status === 'open' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Venda (PDV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenExpense('despesa')}
                    className="flex items-center justify-center space-x-1 py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all"
                  >
                    <ArrowDownCircle className="w-4 h-4 text-rose-400" />
                    <span>Despesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenExpense('suprimento')}
                    className="flex items-center justify-center space-x-1 py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all"
                  >
                    <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                    <span>Suprimento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenExpense('sangria')}
                    className="flex items-center justify-center space-x-1 py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all"
                  >
                    <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                    <span>Sangria</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCloseModalOpen(true)}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-2xl bg-rose-500/30 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 font-bold text-xs transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Fechar Caixa</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenNewRegister}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Abrir Novo Caixa</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resumo por Forma de Pagamento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>PIX</span>
              <QrCode className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {formatCurrency(methodTotals.pix || 0)}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Conta Bancária</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>Dinheiro</span>
              <Banknote className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {formatCurrency(methodTotals.dinheiro || 0)}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold">Físico em Gaveta</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>Cartão Débito</span>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {formatCurrency(methodTotals.debito || 0)}
            </div>
            <span className="text-[10px] text-blue-600 font-semibold">Maquininha</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>Cartão Crédito</span>
              <CreditCard className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {formatCurrency(methodTotals.credito || 0)}
            </div>
            <span className="text-[10px] text-purple-600 font-semibold">Parcelado / À Vista</span>
          </div>
        </div>

        {/* Card: Informações do Último Caixa Fechado (com Reabertura) */}
        {lastClosedRegister && cashRegister.status !== 'open' && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                <History className="w-4 h-4 text-amber-600" />
                Informações do Último Caixa Fechado
              </span>
              <button
                type="button"
                onClick={handleReopenLastRegister}
                className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reabrir Último Caixa (#{lastClosedRegister.codeNumber})
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-amber-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Caixa</span>
                <span className="font-bold text-slate-800">#{lastClosedRegister.codeNumber}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Abertura</span>
                <span className="font-bold text-slate-800">{lastClosedRegister.openedAt}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Fechamento</span>
                <span className="font-bold text-slate-800">{lastClosedRegister.closedAt}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Valor Final</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(lastClosedRegister.finalExpectedAmount)}
                </span>
              </div>
            </div>

            {lastClosedRegister.closingNotes && (
              <p className="text-[11px] text-slate-600 italic">
                Observação: &ldquo;{lastClosedRegister.closingNotes}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Vendas Recebidas vs Lembretes a Receber */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            {/* Tabs */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSalesTab('recebidas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  salesTab === 'recebidas'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Vendas Recebidas ({sales.length})
              </button>
              <button
                type="button"
                onClick={() => setSalesTab('a_receber')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  salesTab === 'a_receber'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Lembrete a Receber
              </button>
            </div>

            {/* Period Filters */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              {(['hoje', 'ontem', 'semana', 'mes'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodFilter(p)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                    periodFilter === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Sales List */}
          {salesTab === 'recebidas' ? (
            sales.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Nenhuma venda registrada neste período.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 p-2 rounded-xl transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{sale.clientName}</span>
                      <span className="text-[11px] text-slate-500">
                        {sale.items.map((i) => i.description).join(', ')} • {sale.time} • Pagto:{' '}
                        {sale.payments.map((p) => p.method.toUpperCase()).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-black text-emerald-600 text-sm">
                        {formatCurrency(sale.total)}
                      </span>
                      {sale.clientPhone && (
                        <button
                          type="button"
                          onClick={() => {
                            const msg = generateReceiptMessage(sale, config);
                            window.open(getWhatsAppLink(sale.clientPhone!, msg), '_blank');
                          }}
                          className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          title="Enviar Comprovante WhatsApp"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Nenhuma venda pendente a receber no momento. Todos os atendimentos foram baixados.
            </div>
          )}
        </div>

        {/* Movimentações do Caixa */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-rose-500" />
              Histórico de Movimentações do Caixa #{cashRegister.codeNumber || 13}
            </h3>
            <span className="text-xs text-slate-400">
              {cashRegister.movements.length} registro(s)
            </span>
          </div>

          {cashRegister.movements.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Nenhuma movimentação registrada.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {cashRegister.movements.map((mov) => {
                const isPositive = mov.type === 'venda' || mov.type === 'suprimento';
                return (
                  <div key={mov.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpCircle className="w-4 h-4" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {mov.description}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {mov.date} às {mov.time} • Forma: {mov.method.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black text-sm block ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : '-'} {formatCurrency(mov.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize font-medium">
                        {mov.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        clients={clients}
        config={config}
        cashRegister={cashRegister}
        onConfirmPayment={handleConfirmSale}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        type={expenseType}
        onSaveMovement={handleSaveMovement}
      />

      <CloseCashRegisterModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        cashRegister={cashRegister}
        config={config}
        onConfirmClose={handleConfirmClose}
      />
    </div>
  );
}
