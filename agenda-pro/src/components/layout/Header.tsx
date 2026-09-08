'use client';

import React from 'react';
import { Calendar, User, ExternalLink, Sparkles, Bell, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  businessName: string;
  professionalName: string;
  slug: string;
  todaySalesCount?: number;
  todaySalesTotal?: number;
}

export const Header: React.FC<HeaderProps> = ({
  businessName,
  professionalName,
  slug,
  todaySalesCount = 0,
  todaySalesTotal = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand & Business */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 text-sm md:text-base leading-tight">
              {businessName || 'Minha Agenda'}
            </h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {professionalName || 'Profissional'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Public Booking Link */}
          <Link
            href={`/agendar/${slug || 'leticia'}`}
            target="_blank"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100/80 border border-rose-200/60 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Link da Agenda Online</span>
          </Link>

          {/* Quick Cash indicator */}
          <Link
            href="/caixa"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/60 text-xs font-semibold transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xs:inline">Caixa Hoje:</span>
            <span className="font-bold text-emerald-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(todaySalesTotal)}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
