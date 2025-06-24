'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "@/app/components/ui/password-input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { toast } from "sonner";
import { db, auth } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore';
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
  const [igrejasIds, setIgrejasIds] = useState<string[]>([]);
  const [cargosIds, setCargosIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);

  function limparFormulario() {
    setNome('');
    setEmail('');
    setSenha('');
    setIgrejasIds([]);
    setCargosIds([]);
    setIsAdmin(false);
  }

  useEffect(() => {
    carregarIgrejas();
    carregarCargos();
  }, []);

  // Limpar campos quando o diálogo é aberto
  useEffect(() => {
    if (open) {
      limparFormulario();
    }
  }, [open]);

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

  async function verificarEmailExistente(email: string): Promise<boolean> {
    try {
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações básicas
      if (!nome.trim()) {
        toast.error('Nome é obrigatório.');
        return;
      }

      if (!email.trim()) {
        toast.error('Email é obrigatório.');
        return;
      }

      if (!senha || senha.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres.');
        return;
      }

      // Verificar se o email já existe no Firestore
      const emailJaExiste = await verificarEmailExistente(email);
      if (emailJaExiste) {
        toast.error('Este email já está sendo usado por outro usuário.');
        return;
      }

      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      // Criar documento do usuário no Firestore usando o UID como ID do documento
      await setDoc(doc(db, 'usuarios', uid), {
        uid,
        nome,
        email,
        igrejas: igrejasIds,
        cargos: cargosIds,
        isAdmin
      });

      toast.success('Usuário criado com sucesso!');
      onUsuarioCriado();
      onOpenChange(false);
      limparFormulario();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);

      // Tratamento específico para diferentes tipos de erro
      let mensagemErro = 'Erro ao criar usuário. Tente novamente.';

      if (error?.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            mensagemErro = 'Este email já está sendo usado por outro usuário.';
            break;
          case 'auth/weak-password':
            mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
            break;
          case 'auth/invalid-email':
            mensagemErro = 'Email inválido. Verifique o formato do email.';
            break;
          case 'auth/operation-not-allowed':
            mensagemErro = 'Criação de usuários não permitida. Contate o administrador.';
            break;
          default:
            mensagemErro = `Erro: ${error.message || 'Erro desconhecido'}`;
        }
      }

      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
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
            <PasswordInput
              id="senha"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
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
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 