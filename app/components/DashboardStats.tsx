'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Users, Calendar, Church, Clock } from "lucide-react";
import { voluntarioService } from '@/app/services/voluntarioService';
import { EscalaService } from '@/app/services/escalaService';
import { igrejaService } from '@/app/services/igrejaService';

interface DashboardStats {
  totalVoluntarios: number;
  totalEscalas: number;
  totalIgrejas: number;
  proximosEventos: Array<{
    id: string;
    data: string;
    descricao: string;
  }>;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVoluntarios: 0,
    totalEscalas: 0,
    totalIgrejas: 0,
    proximosEventos: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar total de voluntários
        const voluntarios = await voluntarioService.listar();

        // Buscar total de igrejas
        const igrejas = await igrejaService.listar();

        // Buscar escalas do mês atual
        const dataAtual = new Date();
        const escalas = await EscalaService.getEscalaDoMes(
          dataAtual.getMonth(),
          dataAtual.getFullYear(),
          '', // igrejaId vazio para buscar todas
          '' // cargoId vazio para buscar todos
        );

        // Filtrar escalas futuras
        const escalasFuturas = escalas.filter(escala =>
          new Date(escala.data) >= dataAtual
        );

        // Ordenar próximos eventos
        const proximosEventos = escalasFuturas
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .slice(0, 5)
          .map(escala => ({
            id: escala.data.toString(),
            data: new Date(escala.data).toLocaleDateString('pt-BR'),
            descricao: `${escala.tipoCulto} - ${escala.voluntarios.map(v => v.nome).join(', ')}`
          }));

        setStats({
          totalVoluntarios: voluntarios.length,
          totalEscalas: escalasFuturas.length,
          totalIgrejas: igrejas.length,
          proximosEventos
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Voluntários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVoluntarios}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Escalas Ativas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEscalas}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Igrejas Cadastradas</CardTitle>
          <Church className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIgrejas}</div>
        </CardContent>
      </Card>
    </div>
  );
} 