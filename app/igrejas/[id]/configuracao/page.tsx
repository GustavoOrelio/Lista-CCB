'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import { EscalaService } from '@/app/services/escalaService';
import { toast } from 'sonner';

const diasSemana = [
  { id: 'domingoRDJ', label: 'Domingo (RDJ)' },
  { id: 'domingo', label: 'Domingo' },
  { id: 'segunda', label: 'Segunda-feira' },
  { id: 'terca', label: 'Terça-feira' },
  { id: 'quarta', label: 'Quarta-feira' },
  { id: 'quinta', label: 'Quinta-feira' },
  { id: 'sexta', label: 'Sexta-feira' },
  { id: 'sabado', label: 'Sábado' },
];

export default function ConfiguracaoIgrejaPage() {
  const params = useParams();
  const router = useRouter();
  const [diasCulto, setDiasCulto] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [igreja, setIgreja] = useState<{ id: string; nome: string; diasCulto: string[] } | null>(null);

  useEffect(() => {
    const carregarIgreja = async () => {
      try {
        const igrejas = await EscalaService.getIgrejas();
        const igreja = igrejas.find(i => i.id === params.id);
        if (igreja) {
          setIgreja(igreja);
          setDiasCulto(igreja.diasCulto || []);
        }
      } catch (error) {
        console.error('Erro ao carregar igreja:', error);
        toast.error('Erro ao carregar igreja');
      }
    };

    if (params.id) {
      carregarIgreja();
    }
  }, [params.id]);

  const handleDiaChange = (dia: string, checked: boolean) => {
    setDiasCulto(prev => {
      if (checked) {
        return [...prev, dia];
      } else {
        return prev.filter(d => d !== dia);
      }
    });
  };

  const handleSalvar = async () => {
    if (!igreja) return;

    try {
      setIsLoading(true);
      await EscalaService.atualizarDiasCultoIgreja(igreja.id, diasCulto);
      toast.success('Dias de culto atualizados com sucesso!');
      router.push('/igrejas');
    } catch (error) {
      console.error('Erro ao salvar dias de culto:', error);
      toast.error('Erro ao salvar dias de culto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!igreja) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configuração da Igreja: {igreja.nome}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dias de Culto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione os dias em que há culto nesta igreja:
            </p>

            <div className="grid gap-4">
              {diasSemana.map((dia) => (
                <div key={dia.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={dia.id}
                    checked={diasCulto.includes(dia.id)}
                    onCheckedChange={(checked) => handleDiaChange(dia.id, checked as boolean)}
                  />
                  <label
                    htmlFor={dia.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {dia.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/igrejas')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 