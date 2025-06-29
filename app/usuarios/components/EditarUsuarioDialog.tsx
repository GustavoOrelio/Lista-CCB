'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";

interface EditarUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsuarioAtualizado: () => void;
  usuario: {
    id: string;
    nome: string;
    email: string;
    igreja: string;
    cargo: string;
    isAdmin: boolean;
  } | null;
}

interface Igreja {
  id: string;
  nome: string;
}

export default function EditarUsuarioDialog({ open, onOpenChange, onUsuarioAtualizado, usuario }: EditarUsuarioDialogProps) {
  const [nome, setNome] = useState('');
  const [igrejaId, setIgrejaId] = useState('');
  const [cargo, setCargo] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario && open) {
      setNome(usuario.nome);
      setCargo(usuario.cargo);
      setIsAdmin(usuario.isAdmin);

      // Encontrar o ID da igreja pelo nome
      const igreja = igrejas.find(i => i.nome === usuario.igreja);
      setIgrejaId(igreja?.id || '');
    }
  }, [usuario, open, igrejas]);

  useEffect(() => {
    if (open) {
      carregarIgrejas();
    }
  }, [open]);

  async function carregarIgrejas() {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/igrejas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const igrejasData = await response.json();
        setIgrejas(igrejasData);
      }
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
      toast.error('Erro ao carregar igrejas.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          email: usuario.email,
          igrejaId: igrejaId || null,
          cargo: cargo || null,
          isAdmin
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar usuário');
      }

      toast.success('Usuário atualizado com sucesso!');
      onUsuarioAtualizado();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.message || 'Erro ao atualizar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={usuario.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="igreja">Igreja</Label>
            <Select value={igrejaId} onValueChange={setIgrejaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma igreja" />
              </SelectTrigger>
              <SelectContent>
                {igrejas.map((igreja) => (
                  <SelectItem key={igreja.id} value={igreja.id}>
                    {igreja.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Pastor, Diácono, Auxiliar..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAdmin"
              checked={isAdmin}
              onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
            />
            <Label htmlFor="isAdmin">Administrador</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 