'use client';

import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
    <div className="p-8">
      <h1 className="text-3xl font-bold">Bem-vindo ao Sistema CCB</h1>
      <p className="mt-4 text-gray-600">
        Selecione uma opção no menu lateral para começar.
      </p>
    </div>
  );
}