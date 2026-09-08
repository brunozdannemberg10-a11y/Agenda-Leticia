'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Users,
  Sparkles,
  ShoppingBag,
  CircleDollarSign,
  FileHeart,
  Settings,
  Globe,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const navItems = [
  {
    label: 'Agenda',
    href: '/',
    icon: Calendar,
  },
  {
    label: 'Frente de Caixa (PDV)',
    href: '/caixa',
    icon: ShoppingBag,
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    label: 'Serviços & Preços',
    href: '/servicos',
    icon: Sparkles,
  },
  {
    label: 'Fichas de Anamnese',
    href: '/anamnese',
    icon: FileHeart,
  },
  {
    label: 'Financeiro & Métricas',
    href: '/financeiro',
    icon: CircleDollarSign,
  },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-screen p-4 flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center space-x-3 px-3 py-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-base">ZanettIA Agenda</span>
          <span className="block text-[10px] uppercase font-bold text-rose-500 tracking-wider">Pro Edition</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all',
                isActive
                  ? 'bg-rose-50 text-rose-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-rose-600' : 'text-slate-400')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Pro Card */}
      <div className="mt-auto p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
        <div className="flex items-center space-x-2 text-rose-700 font-semibold text-xs mb-1">
          <Globe className="w-4 h-4 text-rose-500" />
          <span>Agendamento Online</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
          Envie seu link exclusivo para clientes agendarem direto pelo WhatsApp ou Instagram.
        </p>
        <Link
          href="/agendar/leticia"
          target="_blank"
          className="flex items-center justify-center space-x-1 w-full py-1.5 px-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Ver Página Pública</span>
        </Link>
      </div>
    </aside>
  );
};
