'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import NovoUsuarioDialog from './components/NovoUsuarioDialog';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  igreja: string;
  cargo: string;
  isAdmin: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { canManageUsers } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!canManageUsers()) {
      router.push('/');
      toast.error('Você não tem permissão para acessar esta página.');
      return;
    }
    carregarUsuarios();
  }, [canManageUsers, router]);

  async function carregarUsuarios() {
    try {
      const usuariosRef = collection(db, 'usuarios');
      const querySnapshot = await getDocs(usuariosRef);
      const usuariosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Usuario[];
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários.');
    }
  }

  if (!canManageUsers()) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Novo Usuário
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Igreja</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Cargo</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b">
                <td className="px-6 py-4 text-sm">{usuario.nome}</td>
                <td className="px-6 py-4 text-sm">{usuario.email}</td>
                <td className="px-6 py-4 text-sm">{usuario.igreja}</td>
                <td className="px-6 py-4 text-sm">{usuario.cargo}</td>
                <td className="px-6 py-4 text-sm">
                  {usuario.isAdmin ? 'Administrador' : 'Usuário'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NovoUsuarioDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUsuarioCriado={carregarUsuarios}
      />
    </div>
  );
} 