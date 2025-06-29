'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import NovoUsuarioDialog from './components/NovoUsuarioDialog';
import EditarUsuarioDialog from './components/EditarUsuarioDialog';
import ExcluirUsuarioDialog from './components/ExcluirUsuarioDialog';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  igreja: string;
  cargo: string;
  isAdmin: boolean;
}

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);
  const [editarUsuario, setEditarUsuario] = useState<Usuario | null>(null);
  const [excluirUsuario, setExcluirUsuario] = useState<Usuario | null>(null);

  const carregarUsuarios = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        console.error('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirUsuario = async (id: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsuarios(usuarios.filter((u) => u.id !== id));
        setExcluirUsuario(null);
      } else {
        console.error('Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Verificar se o usuário atual é admin
  if (!currentUser?.isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Acesso negado. Apenas administradores podem gerenciar usuários.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Carregando usuários...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <Button onClick={() => setNovoUsuarioOpen(true)}>
          Novo Usuário
        </Button>
      </div>

      <div className="grid gap-4">
        {usuarios.map((usuario) => (
          <Card key={usuario.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{usuario.nome}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditarUsuario(usuario)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setExcluirUsuario(usuario)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Email:</span>
                  <div className="text-muted-foreground">{usuario.email}</div>
                </div>
                <div>
                  <span className="font-medium">Igreja:</span>
                  <div className="text-muted-foreground">{usuario.igreja}</div>
                </div>
                <div>
                  <span className="font-medium">Cargo:</span>
                  <div className="text-muted-foreground">{usuario.cargo}</div>
                </div>
                <div>
                  <span className="font-medium">Administrador:</span>
                  <div className="text-muted-foreground">
                    {usuario.isAdmin ? 'Sim' : 'Não'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NovoUsuarioDialog
        open={novoUsuarioOpen}
        onOpenChange={setNovoUsuarioOpen}
        onUsuarioCriado={carregarUsuarios}
      />

      {editarUsuario && (
        <EditarUsuarioDialog
          usuario={editarUsuario}
          open={!!editarUsuario}
          onOpenChange={(open: boolean) => !open && setEditarUsuario(null)}
          onUsuarioAtualizado={carregarUsuarios}
        />
      )}

      {excluirUsuario && (
        <ExcluirUsuarioDialog
          usuario={excluirUsuario}
          open={!!excluirUsuario}
          onOpenChange={(open: boolean) => !open && setExcluirUsuario(null)}
          onConfirmar={() => handleExcluirUsuario(excluirUsuario.id)}
        />
      )}
    </div>
  );
} 