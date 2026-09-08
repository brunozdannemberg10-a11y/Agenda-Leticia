'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Calendar,
  Clock,
  Building,
  AlertCircle,
  Info,
  CheckCircle2,
  Receipt,
  FileText
} from 'lucide-react';
import { CashRegister, BusinessConfig, PaymentMethod } from '@/lib/types';
import { formatCurrency, getTodayDateString } from '@/lib/utils';

interface CloseCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashRegister: CashRegister;
  config: BusinessConfig;
  onConfirmClose: (closingData: {
    closedAt: string;
    closedBy: string;
    destinationAccount: string;
    closingNotes: string;
    finalRealAmount?: number;
  }) => void;
}

export const CloseCashRegisterModal: React.FC<CloseCashRegisterModalProps> = ({
  isOpen,
  onClose,
  cashRegister,
  config,
  onConfirmClose,
}) => {
  const [closingDate, setClosingDate] = useState<string>(getTodayDateString());
  const [closingTime, setClosingTime] = useState<string>(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [destinationAccount, setDestinationAccount] = useState<string>(
    config.destinationAccounts[0] || 'Banco'
  );
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [selectedMethodForDetail, setSelectedMethodForDetail] = useState<string | null>(null);

  if (!isOpen) return null;

  // Aggregate breakdown by payment method
  const methodBreakdown: Record<
    string,
    { sales: number; supply: number; bleed: number; expenses: number; total: number }
  > = {
    pix: { sales: 0, supply: 0, bleed: 0, expenses: 0, total: 0 },
    dinheiro: { sales: 0, supply: 0, bleed: 0, expenses: 0, total: 0 },
    debito: { sales: 0, supply: 0, bleed: 0, expenses: 0, total: 0 },
    credito: { sales: 0, supply: 0, bleed: 0, expenses: 0, total: 0 },
  };

  cashRegister.movements.forEach((mov) => {
    const m = mov.method || 'dinheiro';
    if (!methodBreakdown[m]) {
      methodBreakdown[m] = { sales: 0, supply: 0, bleed: 0, expenses: 0, total: 0 };
    }

    if (mov.type === 'venda') {
      methodBreakdown[m].sales += mov.amount;
      methodBreakdown[m].total += mov.amount;
    } else if (mov.type === 'suprimento') {
      methodBreakdown[m].supply += mov.amount;
      methodBreakdown[m].total += mov.amount;
    } else if (mov.type === 'sangria') {
      methodBreakdown[m].bleed += mov.amount;
      methodBreakdown[m].total -= mov.amount;
    } else if (mov.type === 'despesa') {
      methodBreakdown[m].expenses += mov.amount;
      methodBreakdown[m].total -= mov.amount;
    }
  });

  const methodNames: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro (Espécie)',
    debito: 'Cartão de Débito',
    credito: 'Cartão de Crédito',
    credito_cliente: 'Crédito do Cliente',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onConfirmClose({
      closedAt: `${closingDate} ${closingTime}`,
      closedBy: config.ownerName,
      destinationAccount,
      closingNotes,
      finalRealAmount: cashRegister.finalExpectedAmount,
    });

    onClose();
  };

  const movementsForSelectedMethod = selectedMethodForDetail
    ? cashRegister.movements.filter((m) => m.method === selectedMethodForDetail)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-base font-bold">
                Fechamento do Caixa #{cashRegister.codeNumber || 13}
              </h2>
              <span className="text-[11px] text-slate-400">
                Abertura: {cashRegister.openedAt} • Responsável: {cashRegister.openedBy}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Inputs Row: Data, Hora, Conta Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Data do Fechamento *
              </label>
              <input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                required
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Hora *
              </label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                required
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Conta de Destino *
              </label>
              <select
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
              >
                {config.destinationAccounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Observação do Fechamento
            </label>
            <textarea
              placeholder="Ex: Tudo conferido, sem curso na semana, fundo de troco separado..."
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              rows={2}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
            />
          </div>

          {/* Tabela de Conferência por Forma de Pagamento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Conferência de Recebimentos por Forma
              </label>
              <span className="text-[11px] text-slate-500">
                Clique na forma de pagamento para auditar
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 sm:p-3">Formas de Pagamento</th>
                    <th className="p-2.5 sm:p-3 text-right">Vendas</th>
                    <th className="p-2.5 sm:p-3 text-right hidden sm:table-cell">Despesas</th>
                    <th className="p-2.5 sm:p-3 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(methodBreakdown).map(([methodKey, stats]) => (
                    <tr
                      key={methodKey}
                      onClick={() => setSelectedMethodForDetail(methodKey)}
                      className="hover:bg-rose-50/40 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 sm:p-3 font-semibold text-rose-900 underline flex items-center gap-1.5">
                        {methodNames[methodKey] || methodKey}
                      </td>
                      <td className="p-2.5 sm:p-3 text-right font-medium text-slate-700">
                        {stats.sales > 0 ? formatCurrency(stats.sales) : '-'}
                      </td>
                      <td className="p-2.5 sm:p-3 text-right font-medium text-rose-600 hidden sm:table-cell">
                        {stats.expenses > 0 ? `-${formatCurrency(stats.expenses)}` : '-'}
                      </td>
                      <td className="p-2.5 sm:p-3 text-right font-black text-slate-900">
                        {formatCurrency(stats.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold border-t border-slate-800">
                  <tr>
                    <td className="p-2.5 sm:p-3">Total Consolidado</td>
                    <td className="p-2.5 sm:p-3 text-right text-emerald-400">
                      {formatCurrency(cashRegister.salesTotal)}
                    </td>
                    <td className="p-2.5 sm:p-3 text-right text-rose-400 hidden sm:table-cell">
                      -{formatCurrency(cashRegister.expensesTotal)}
                    </td>
                    <td className="p-2.5 sm:p-3 text-right text-emerald-400 font-extrabold text-sm">
                      {formatCurrency(cashRegister.finalExpectedAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Modal / Detalhe de Auditoria da Forma Selecionada */}
          {selectedMethodForDetail && (
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between font-bold text-rose-950">
                <span>Movimentações em {methodNames[selectedMethodForDetail] || selectedMethodForDetail}</span>
                <button
                  type="button"
                  onClick={() => setSelectedMethodForDetail(null)}
                  className="text-rose-600 hover:text-rose-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {movementsForSelectedMethod.length === 0 ? (
                <p className="text-slate-500 italic">Nenhum movimento registrado nesta forma.</p>
              ) : (
                <div className="divide-y divide-rose-200/60 max-h-36 overflow-y-auto">
                  {movementsForSelectedMethod.map((m) => (
                    <div key={m.id} className="py-1.5 flex justify-between">
                      <span className="text-slate-700">
                        {m.time} • {m.description}
                      </span>
                      <span className="font-bold text-slate-900">{formatCurrency(m.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Caixa Note / Alerta */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Informação importante sobre a conferência:</p>
              <p className="text-[11px] leading-relaxed">
                A única forma de pagamento física em dinheiro que ficará em mãos é a quantia em espécie. Os recebimentos via PIX e Cartão de Débito/Crédito vão diretamente para a sua conta cadastrada.
              </p>
            </div>
          </div>

          {/* Buttons */}
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
              className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Fechamento de Caixa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
