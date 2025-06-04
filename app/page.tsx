'use client';

import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardStats } from './components/DashboardStats';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Bem-vindo ao Sistema CCB</h1>
        <p className="mt-2 text-gray-600 text-base md:text-lg">
          Acompanhe as estatísticas e próximos eventos do sistema.
        </p>
      </div>

      <DashboardStats />
    </div>
  );
}