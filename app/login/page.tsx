'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { toast } from "sonner";
import ResetPasswordDialog from '../components/ResetPasswordDialog';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      // O redirecionamento será feito pelo useEffect quando o user for atualizado
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  // Se já estiver autenticado, não mostra nada (o useEffect cuidará do redirecionamento)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px] bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-foreground">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordOpen(true)}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
      />
    </div>
  );
} 