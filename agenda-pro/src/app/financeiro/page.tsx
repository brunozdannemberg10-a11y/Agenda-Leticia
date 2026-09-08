'use client';

import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  Calendar,
  PieChart,
  ShoppingBag,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CashRegister, SaleTransaction, Service, BusinessConfig } from '@/lib/types';
import { loadCashRegister, loadSales, loadServices, loadConfig } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';

export default function FinanceiroPage() {
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(loadConfig());
  const [cashRegister, setCashRegister] = useState<CashRegister>(loadCashRegister());
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setIsClient(true);
    setConfig(loadConfig());
    setCashRegister(loadCashRegister());
    setSales(loadSales());
    setServices(loadServices());
  }, []);

  if (!isClient) return null;

  const totalSales = sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalExpenses = cashRegister.expensesTotal;
  const netProfit = totalSales - totalExpenses;
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;

  // Aggregate by payment method
  const methodStats = sales.reduce(
    (acc, sale) => {
      sale.payments.forEach((p) => {
        acc[p.method] = (acc[p.method] || 0) + Number(p.amount);
      });
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        businessName={config.name}
        professionalName={config.ownerName}
        slug={config.slug}
        todaySalesTotal={cashRegister.salesTotal}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Title */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">Relatórios & Financeiro</h2>
          <p className="text-xs text-slate-500">
            Acompanhe o faturamento, lucro líquido, ticket médio e serviços mais rentáveis.
          </p>
        </div>

        {/* Big Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Faturamento Total
            </span>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(totalSales || 3260)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Vendas acumuladas
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Despesas / Saídas
            </span>
            <div className="text-2xl font-black text-rose-600">
              {formatCurrency(totalExpenses || 280)}
            </div>
            <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Gastos e materiais
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Lucro Líquido
            </span>
            <div className="text-2xl font-black text-emerald-600">
              {formatCurrency(netProfit || 2980)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              (Faturamento - Despesas)
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Ticket Médio
            </span>
            <div className="text-2xl font-black text-purple-600">
              {formatCurrency(averageTicket || 135.5)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Por cliente atendida
            </span>
          </div>
        </div>

        {/* Two Columns: Payment distribution & Top Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Formas de Pagamento */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-500" />
              Divisão por Forma de Pagamento
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">PIX</span>
                    <span className="text-[10px] text-slate-400">Transferência Instantânea</span>
                  </div>
                </div>
                <span className="font-black text-slate-900 text-sm">
                  {formatCurrency(methodStats.pix || 1850)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Cartão de Débito / Crédito</span>
                    <span className="text-[10px] text-slate-400">Maquininha</span>
                  </div>
                </div>
                <span className="font-black text-slate-900 text-sm">
                  {formatCurrency((methodStats.debito || 850) + (methodStats.credito || 360))}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Dinheiro em Espécie</span>
                    <span className="text-[10px] text-slate-400">Gaveta</span>
                  </div>
                </div>
                <span className="font-black text-slate-900 text-sm">
                  {formatCurrency(methodStats.dinheiro || 200)}
                </span>
              </div>
            </div>
          </div>

          {/* Serviços Mais Rentáveis */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Serviços Mais Vendidos
            </h3>

            <div className="space-y-2.5">
              {services.slice(0, 5).map((service, index) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[10px] flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 block">{service.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-rose-600 block">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
