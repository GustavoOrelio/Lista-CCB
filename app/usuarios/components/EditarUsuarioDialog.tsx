'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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
    igrejas: string[];
    cargos: string[];
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
  const [igrejasIds, setIgrejasIds] = useState<string[]>([]);
  const [cargosIds, setCargosIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome);
      setIgrejasIds(usuario.igrejas);
      setCargosIds(usuario.cargos);
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
        igrejas: igrejasIds,
        cargos: cargosIds,
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
            <Label>Igrejas</Label>
            <div className="border rounded-md p-4 space-y-2">
              {igrejas.map((igreja) => (
                <div key={igreja.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`igreja-${igreja.id}`}
                    checked={igrejasIds.includes(igreja.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setIgrejasIds(prev => [...prev, igreja.id]);
                      } else {
                        setIgrejasIds(prev => prev.filter(id => id !== igreja.id));
                      }
                    }}
                  />
                  <Label htmlFor={`igreja-${igreja.id}`}>{igreja.nome}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cargos</Label>
            <div className="border rounded-md p-4 space-y-2">
              {cargos.map((cargo) => (
                <div key={cargo.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cargo-${cargo.id}`}
                    checked={cargosIds.includes(cargo.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCargosIds(prev => [...prev, cargo.id]);
                      } else {
                        setCargosIds(prev => prev.filter(id => id !== cargo.id));
                      }
                    }}
                  />
                  <Label htmlFor={`cargo-${cargo.id}`}>{cargo.nome}</Label>
                </div>
              ))}
            </div>
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