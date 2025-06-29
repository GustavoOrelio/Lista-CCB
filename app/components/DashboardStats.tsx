'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Users, Calendar, Church, Briefcase } from "lucide-react";
import { voluntarioService } from '@/app/services/client/voluntarioService';
import { igrejaService } from '@/app/services/client/igrejaService';
import { cargoService } from '@/app/services/client/cargoService';

interface DashboardStats {
  totalVoluntarios: number;
  totalEscalas: number;
  totalIgrejas: number;
  totalCargos: number;
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
    totalCargos: 0,
    proximosEventos: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar total de voluntários
        const voluntarios = await voluntarioService.listar();

        // Buscar total de igrejas
        const igrejas = await igrejaService.listar();

        // Buscar total de cargos
        const cargos = await cargoService.listar();

        setStats({
          totalVoluntarios: voluntarios.length,
          totalEscalas: 0, // Temporariamente desabilitado
          totalIgrejas: igrejas.length,
          totalCargos: cargos.length,
          proximosEventos: [] // Temporariamente desabilitado
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cargos Cadastrados</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCargos}</div>
        </CardContent>
      </Card>
    </div>
  );
} 