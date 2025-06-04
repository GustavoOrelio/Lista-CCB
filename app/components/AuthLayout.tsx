'use client';

import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

export function AuthLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Se estiver na página de login, não mostra a Sidebar
  if (pathname === '/login') {
    return children;
  }

  // Se não estiver autenticado, mostra apenas o conteúdo
  if (!user) {
    return children;
  }

  // Se estiver autenticado e não estiver na página de login, mostra a Sidebar
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 bg-gray-100 ml-0 md:ml-64">
        {children}
      </main>
    </div>
  );
} 