"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { voluntarioService } from '@/app/services/voluntarioService';
import { igrejaService } from '@/app/services/igrejaService';
import { cargoService } from '@/app/services/cargoService';

const PIE_COLORS = ["#64748b", "#cbd5e1", "#94a3b8", "#e5e7eb", "#a3a3a3"];

interface BarData { igreja: string; total: number; }
interface PieData { name: string; value: number; color: string; }

export function DashboardCharts() {
  const [data, setData] = useState<BarData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);
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
        color: PIE_COLORS[idx % PIE_COLORS.length]
      })).filter(c => c.value > 0);
      setPieData(porCargo);
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
          <div className="w-full h-72 overflow-x-auto">
            <div className="min-w-[350px]">
              <ResponsiveContainer width="100%" height={288}>
                <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="igreja" fontSize={10} />
                  <YAxis allowDecimals={false} fontSize={10} />
                  <Tooltip />
                  <Legend wrapperStyle={{ display: typeof window !== 'undefined' && window.innerWidth < 640 ? 'none' : 'block' }} />
                  <Bar dataKey="total" fill="#64748b" name="Voluntários" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Distribuição de Voluntários por Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-72 flex items-center justify-center">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Carregando...</div>
            ) : pieData.length === 0 ? (
              <div className="text-muted-foreground">Nenhum dado para exibir</div>
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ display: typeof window !== 'undefined' && window.innerWidth < 640 ? 'none' : 'block' }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 