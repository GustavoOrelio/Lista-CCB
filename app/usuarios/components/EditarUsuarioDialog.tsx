'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { toast } from "sonner";
import { db } from '../../config/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

interface Cargo {
  id: string;
  nome: string;
}

export default function EditarUsuarioDialog({ open, onOpenChange, onUsuarioAtualizado, usuario }: EditarUsuarioDialogProps) {
  const [nome, setNome] = useState('');
  const [igrejaId, setIgrejaId] = useState('');
  const [cargoId, setCargoId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome);
      setIgrejaId(usuario.igreja);
      setCargoId(usuario.cargo);
      setIsAdmin(usuario.isAdmin);
    }
  }, [usuario]);

  useEffect(() => {
    carregarIgrejas();
    carregarCargos();
  }, []);

  async function carregarIgrejas() {
    try {
      const igrejasRef = collection(db, 'igrejas');
      const snapshot = await getDocs(igrejasRef);
      const igrejasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Igreja[];
      setIgrejas(igrejasData);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
      toast.error('Erro ao carregar igrejas.');
    }
  }

  async function carregarCargos() {
    try {
      const cargosRef = collection(db, 'cargos');
      const snapshot = await getDocs(cargosRef);
      const cargosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cargo[];
      setCargos(cargosData);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      toast.error('Erro ao carregar cargos.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    setLoading(true);

    try {
      const userRef = doc(db, 'usuarios', usuario.id);
      await updateDoc(userRef, {
        nome,
        igreja: igrejaId,
        cargo: cargoId,
        isAdmin
      });

      toast.success('Usuário atualizado com sucesso!');
      onUsuarioAtualizado();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="igreja">Igreja</Label>
            <Select value={igrejaId} onValueChange={setIgrejaId} required>
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
            <Select value={cargoId} onValueChange={setCargoId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {cargos.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAdmin"
              checked={isAdmin}
              onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
            />
            <Label htmlFor="isAdmin">Usuário Administrador</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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