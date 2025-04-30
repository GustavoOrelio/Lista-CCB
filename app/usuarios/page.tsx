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
  igrejas: string[];
  igrejasNomes?: string[];
  cargos: string[];
  cargosNomes?: string[];
  isAdmin: boolean;
}


export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [igrejas, setIgrejas] = useState<Map<string, string>>(new Map());
  const [cargos, setCargos] = useState<Map<string, string>>(new Map());
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
    carregarDados();
  }, [canManageUsers, router]);

  async function carregarDados() {
    try {
      // Carregar igrejas
      const igrejasRef = collection(db, 'igrejas');
      const igrejasSnapshot = await getDocs(igrejasRef);
      const igrejasMap = new Map<string, string>();
      igrejasSnapshot.docs.forEach(doc => {
        igrejasMap.set(doc.id, doc.data().nome);
      });
      setIgrejas(igrejasMap);

      // Carregar cargos
      const cargosRef = collection(db, 'cargos');
      const cargosSnapshot = await getDocs(cargosRef);
      const cargosMap = new Map<string, string>();
      cargosSnapshot.docs.forEach(doc => {
        cargosMap.set(doc.id, doc.data().nome);
      });
      setCargos(cargosMap);

      // Carregar usuários
      const usuariosRef = collection(db, 'usuarios');
      const usuariosSnapshot = await getDocs(usuariosRef);
      const usuariosData = usuariosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          igrejas: data.igrejas || [],
          cargos: data.cargos || [],
        };
      }) as Usuario[];

      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados.');
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

  const getNomeIgreja = (id: string) => igrejas.get(id) || id;
  const getNomeCargo = (id: string) => cargos.get(id) || id;

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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Igrejas</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Cargos</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b">
                <td className="px-6 py-4 text-sm">{usuario.nome}</td>
                <td className="px-6 py-4 text-sm">{usuario.email}</td>
                <td className="px-6 py-4 text-sm">
                  {usuario.igrejas.map(id => getNomeIgreja(id)).join(', ')}
                </td>
                <td className="px-6 py-4 text-sm">
                  {usuario.cargos.map(id => getNomeCargo(id)).join(', ')}
                </td>
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
        onUsuarioCriado={carregarDados}
      />

      <EditarUsuarioDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUsuarioAtualizado={carregarDados}
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