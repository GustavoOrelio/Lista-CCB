'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import { usePermissions } from '../hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import NovoUsuarioDialog from './components/NovoUsuarioDialog';
import EditarUsuarioDialog from './components/EditarUsuarioDialog';
import ExcluirUsuarioDialog from './components/ExcluirUsuarioDialog';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleEdit = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!usuarioSelecionado) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'usuarios', usuarioSelecionado.id));
      setUsuarios(prev => prev.filter(u => u.id !== usuarioSelecionado.id));
      toast.success('Usuário excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      setUsuarioSelecionado(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Ações</th>
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
                <td className="px-6 py-4 text-sm text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(usuario)}
                    className="mr-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(usuario)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
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

      <EditarUsuarioDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUsuarioAtualizado={carregarUsuarios}
        usuario={usuarioSelecionado}
      />

      <ExcluirUsuarioDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
} 