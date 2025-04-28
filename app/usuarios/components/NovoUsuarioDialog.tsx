'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { toast } from "sonner";
import { db, auth } from '../../config/firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface NovoUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsuarioCriado: () => void;
}

interface Igreja {
  id: string;
  nome: string;
}

interface Cargo {
  id: string;
  nome: string;
}

export default function NovoUsuarioDialog({ open, onOpenChange, onUsuarioCriado }: NovoUsuarioDialogProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [igrejaId, setIgrejaId] = useState('');
  const [cargoId, setCargoId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      // Criar documento do usuário no Firestore usando o UID como ID do documento
      await setDoc(doc(db, 'usuarios', uid), {
        uid,
        nome,
        email,
        igreja: igrejaId,
        cargo: cargoId,
        isAdmin
      });

      toast.success('Usuário criado com sucesso!');
      onUsuarioCriado();
      onOpenChange(false);
      limparFormulario();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function limparFormulario() {
    setNome('');
    setEmail('');
    setSenha('');
    setIgrejaId('');
    setCargoId('');
    setIsAdmin(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
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
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 