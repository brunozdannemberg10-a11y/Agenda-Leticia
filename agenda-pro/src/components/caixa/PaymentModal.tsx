'use client';

import React, { useState } from 'react';
import {
  X,
  DollarSign,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  Plus,
  Trash2,
  Receipt,
  MessageCircle,
  CheckCircle2,
  User,
  Percent,
  Calendar,
  Gift
} from 'lucide-react';
import {
  Appointment,
  Client,
  PaymentItem,
  PaymentMethod,
  SaleTransaction,
  BusinessConfig,
  CashRegister
} from '@/lib/types';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { getWhatsAppLink, generateReceiptMessage } from '@/lib/whatsapp';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  client?: Client | null;
  clients: Client[];
  config: BusinessConfig;
  cashRegister: CashRegister;
  onConfirmPayment: (sale: SaleTransaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  client,
  clients,
  config,
  cashRegister,
  onConfirmPayment,
}) => {
  const initialClient = client || (appointment ? clients.find((c) => c.id === appointment.clientId) : null);
  const initialTotal = appointment ? appointment.totalPrice : 150.00;

  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || '');
  const [items, setItems] = useState<{ description: string; quantity: number; unitPrice: number; total: number }[]>(
    appointment
      ? appointment.services.map((s) => ({
          description: s.serviceName,
          quantity: 1,
          unitPrice: s.price,
          total: s.price,
        }))
      : [{ description: 'Atendimento', quantity: 1, unitPrice: 150, total: 150 }]
  );

  // Discount options: Reais or Porcentagem
  const [discountType, setDiscountType] = useState<'reais' | 'porcentagem'>('reais');
  const [discountInput, setDiscountInput] = useState<number>(0);

  // Change as credit
  const [includeChangeAsCredit, setIncludeChangeAsCredit] = useState<boolean>(false);

  // Payments
  const [payments, setPayments] = useState<PaymentItem[]>([
    { method: 'pix', amount: initialTotal, installments: 1 },
  ]);

  const [completedSale, setCompletedSale] = useState<SaleTransaction | null>(null);

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId) || initialClient;
  const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);

  const discountAmount =
    discountType === 'porcentagem'
      ? (subtotal * (discountInput || 0)) / 100
      : discountInput || 0;

  const totalToPay = Math.max(0, subtotal - discountAmount);
  const totalPaid = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const change = Math.max(0, totalPaid - totalToPay);
  const remaining = Math.max(0, totalToPay - totalPaid);

  const handleAddPaymentRow = () => {
    setPayments((prev) => [...prev, { method: 'dinheiro', amount: remaining, installments: 1 }]);
  };

  const handleRemovePaymentRow = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index: number, field: keyof PaymentItem, value: any) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();

    if (totalPaid < totalToPay) {
      alert(`Falta receber ${formatCurrency(remaining)}. Ajuste as formas de pagamento.`);
      return;
    }

    const sale: SaleTransaction = {
      id: `sale_${Date.now()}`,
      appointmentId: appointment?.id,
      clientId: currentClient?.id,
      clientName: currentClient?.name || 'Cliente Avulsa',
      clientPhone: currentClient?.phone,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      items,
      subtotal,
      discountType,
      discountValue: discountInput,
      discount: discountAmount,
      total: totalToPay,
      payments,
      change,
      changeAsCredit: includeChangeAsCredit && change > 0,
      cashRegisterId: cashRegister.id,
      professionalName: appointment?.professionalName || config.ownerName,
    };

    onConfirmPayment(sale);
    setCompletedSale(sale);
  };

  const handleSendWhatsAppReceipt = () => {
    if (!completedSale || !currentClient?.phone) return;
    const msg = generateReceiptMessage(completedSale, config);
    window.open(getWhatsAppLink(currentClient.phone, msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="flex items-center space-x-2.5">
            <Receipt className="w-5 h-5" />
            <h2 className="text-base font-bold">
              {completedSale ? 'Comprovante da Venda' : 'Receber no Caixa (PDV)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedSale ? (
          /* Sale Completed Screen */
          <div className="p-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">
                Pagamento Registrado com Sucesso!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lançado no Caixa • {formatCurrency(completedSale.total)}
              </p>
            </div>

            {change > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs space-y-1">
                <div>Troco calculado: {formatCurrency(change)}</div>
                {includeChangeAsCredit && (
                  <div className="text-emerald-700 font-bold">
                    ✓ Valor creditado na conta da cliente para a próxima visita!
                  </div>
                )}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Cliente:</span>
                <span>{completedSale.clientName}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Itens:</span>
                <span>{completedSale.items.map((i) => i.description).join(', ')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Pago:</span>
                <span className="text-emerald-600">{formatCurrency(completedSale.total)}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {currentClient?.phone && (
                <button
                  type="button"
                  onClick={handleSendWhatsAppReceipt}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar Comprovante no WhatsApp
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600 transition-colors"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleFinalize} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Client Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Cliente
                </span>
                <span className="font-bold text-xs text-slate-800">
                  {currentClient?.name || 'Cliente Avulsa'}
                </span>
              </div>
              {currentClient?.creditBalance ? (
                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">
                    Crédito Disponível
                  </span>
                  <span className="font-bold text-xs text-emerald-700">
                    {formatCurrency(currentClient.creditBalance)}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Itens da Venda
              </label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{it.description}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(it.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Section (Reais ou Porcentagem) */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Desconto</span>
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setDiscountType('reais')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      discountType === 'reais' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Reais (R$)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('porcentagem')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      discountType === 'porcentagem' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Porcentagem (%)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {discountType === 'porcentagem' ? `(${discountInput || 0}% de desconto = ${formatCurrency(discountAmount)})` : 'Valor a abater'}
                </span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={discountInput || ''}
                  placeholder="0,00"
                  onChange={(e) => setDiscountInput(Number(e.target.value) || 0)}
                  className="w-24 text-right text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Total Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Total a Pagar
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {formatCurrency(totalToPay)}
                </span>
              </div>
              {change > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block">
                    Troco
                  </span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {formatCurrency(change)}
                  </span>
                </div>
              )}
            </div>

            {/* Change as Credit Option */}
            {change > 0 && (
              <label className="flex items-center space-x-2 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChangeAsCredit}
                  onChange={(e) => setIncludeChangeAsCredit(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-emerald-600" />
                  Incluir troco ({formatCurrency(change)}) como saldo de crédito da cliente
                </span>
              </label>
            )}

            {/* Payment Methods */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Formas de Pagamento
                </label>
                <button
                  type="button"
                  onClick={handleAddPaymentRow}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar outra forma
                </button>
              </div>

              <div className="space-y-2">
                {payments.map((p, idx) => (
                  <div key={idx} className="space-y-1.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <select
                        value={p.method}
                        onChange={(e) =>
                          handlePaymentChange(idx, 'method', e.target.value as PaymentMethod)
                        }
                        className="w-1/2 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="pix">PIX</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="debito">Cartão de Débito</option>
                        <option value="credito">Cartão de Crédito</option>
                        <option value="credito_cliente">Crédito do Cliente</option>
                      </select>

                      <input
                        type="number"
                        step="0.50"
                        value={p.amount || ''}
                        onChange={(e) =>
                          handlePaymentChange(idx, 'amount', Number(e.target.value) || 0)
                        }
                        className="w-1/2 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="Valor"
                        required
                      />

                      {payments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePaymentRow(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Installments for Credit Card */}
                    {p.method === 'credito' && (
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Parcelamento:</span>
                        <select
                          value={p.installments || 1}
                          onChange={(e) =>
                            handlePaymentChange(idx, 'installments', Number(e.target.value))
                          }
                          className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold"
                        >
                          <option value={1}>À Vista (1x)</option>
                          <option value={2}>2 parcelas</option>
                          <option value={3}>3 parcelas</option>
                          <option value={4}>4 parcelas</option>
                          <option value={5}>5 parcelas</option>
                          <option value={6}>6 parcelas</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 border-t border-slate-100 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar e Baixar Venda
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
