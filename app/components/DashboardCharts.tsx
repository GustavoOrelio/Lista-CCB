"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { voluntarioService } from '@/app/services/voluntarioService';
import { igrejaService } from '@/app/services/igrejaService';
import { cargoService } from '@/app/services/cargoService';

const COLORS = ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#3b82f6", "#a21caf", "#eab308", "#14b8a6"];

export function DashboardCharts() {
  const [data, setData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const igrejas = await igrejaService.listar();
      const voluntarios = await voluntarioService.listar();
      const cargos = await cargoService.listar();
      // Agrupar voluntários por igreja
      const porIgreja = igrejas.map(igreja => ({
        igreja: igreja.nome,
        total: voluntarios.filter(v => v.igrejaId === igreja.id).length
      }));
      setData(porIgreja);
      // Agrupar voluntários por cargo
      const porCargo = cargos.map((cargo, idx) => ({
        name: cargo.nome,
        value: voluntarios.filter(v => v.cargoId === cargo.id).length,
        color: COLORS[idx % COLORS.length]
      })).filter(c => c.value > 0);
      setPieData(porCargo);
      // Evolução de voluntários ao longo dos meses (acumulado)
      const meses = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return d;
      });
      const evolucao = meses.map((mes) => {
        // Não temos data de cadastro, então mostramos o total acumulado
        return {
          mes: mes.toLocaleString('default', { month: 'short', year: '2-digit' }),
          total: voluntarios.length
        };
      });
      setLineData(evolucao);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Distribuição de Voluntários por Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full flex items-center justify-center">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Carregando...</div>
            ) : pieData.length === 0 ? (
              <div className="text-muted-foreground">Nenhum dado para exibir</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Evolução do Número de Voluntários (últimos 12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Voluntários" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 