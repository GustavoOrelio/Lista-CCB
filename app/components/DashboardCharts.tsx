"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { voluntarioService } from '@/app/services/voluntarioService';
import { igrejaService } from '@/app/services/igrejaService';

export function DashboardCharts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const igrejas = await igrejaService.listar();
      const voluntarios = await voluntarioService.listar();
      // Agrupar voluntários por igreja
      const porIgreja = igrejas.map(igreja => ({
        igreja: igreja.nome,
        total: voluntarios.filter(v => v.igrejaId === igreja.id).length
      }));
      setData(porIgreja);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">Distribuição de Voluntários por Igreja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="igreja" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#6366f1" name="Voluntários" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 