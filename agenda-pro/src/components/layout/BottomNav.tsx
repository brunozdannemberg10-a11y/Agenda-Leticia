'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  ShoppingBag,
  Users,
  Sparkles,
  FileHeart,
  CircleDollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  // Hide bottom nav on public booking page
  if (pathname.startsWith('/agendar/')) return null;

  const mobileItems = [
    { label: 'Agenda', href: '/', icon: Calendar },
    { label: 'Caixa', href: '/caixa', icon: ShoppingBag },
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'Serviços', href: '/servicos', icon: Sparkles },
    { label: 'Anamnese', href: '/anamnese', icon: FileHeart },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all',
              isActive
                ? 'text-rose-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <div className={cn(
              'p-1 rounded-lg transition-all',
              isActive && 'bg-rose-50'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
