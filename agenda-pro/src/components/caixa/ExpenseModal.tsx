'use client';

import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, DollarSign, Check } from 'lucide-react';
import { PaymentMethod } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'despesa' | 'suprimento' | 'sangria';
  onSaveMovement: (movement: {
    type: 'despesa' | 'suprimento' | 'sangria';
    amount: number;
    method: PaymentMethod;
    description: string;
    category?: string;
  }) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  type,
  onSaveMovement,
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Geral');
  const [method, setMethod] = useState<PaymentMethod>('dinheiro');

  if (!isOpen) return null;

  const titles = {
    despesa: 'Lançar Despesa / Saída',
    suprimento: 'Suprimento (Entrada de Dinheiro)',
    sangria: 'Sangria (Retirada de Dinheiro)',
  };

  const colors = {
    despesa: 'from-rose-500 to-rose-600',
    suprimento: 'from-emerald-500 to-teal-600',
    sangria: 'from-amber-500 to-orange-600',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (!description.trim()) {
      alert('Informe uma descrição.');
      return;
    }

    onSaveMovement({
      type,
      amount: Number(amount),
      method,
      description: description.trim(),
      category,
    });

    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-fade-in my-8">
        <div className={`flex items-center justify-between px-6 py-4 bg-gradient-to-r ${colors[type]} text-white`}>
          <h2 className="text-sm font-bold">{titles[type]}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.50"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || '')}
              placeholder="0,00"
              required
              className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Descrição do Movimento *
            </label>
            <input
              type="text"
              placeholder={type === 'despesa' ? 'Ex: Lixas descartáveis, café, vale' : 'Ex: Fundo de troco'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60"
            />
          </div>

          {type === 'despesa' && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Categoria da Despesa
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
              >
                <option value="Material de Trabalho">Material de Trabalho / Insumos</option>
                <option value="Alimentação / Lanche">Alimentação / Lanche</option>
                <option value="Transporte">Transporte / Deslocamento</option>
                <option value="Vale Profissional">Vale / Retirada</option>
                <option value="Geral">Outros</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Forma de Pagamento
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/60 font-medium"
            >
              <option value="dinheiro">Dinheiro em Espécie (Caixa)</option>
              <option value="pix">PIX</option>
              <option value="debito">Cartão de Débito</option>
              <option value="credito">Cartão de Crédito</option>
            </select>
          </div>

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
              className={`w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r ${colors[type]} text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5`}
            >
              <Check className="w-4 h-4" />
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
