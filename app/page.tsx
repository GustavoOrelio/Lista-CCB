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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo ao Sistema CCB</h1>
        <p className="mt-2 text-gray-600">
          Acompanhe as estatísticas e próximos eventos do sistema.
        </p>
      </div>

      <DashboardStats />
    </div>
  );
}